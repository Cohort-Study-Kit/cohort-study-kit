"""
Management command: migrate_columns_to_schema

Migrates all Dataset/Column/Cell data (Model B) into the data_schema/Examination.data
format (Model A), then deletes the now-redundant Column and Cell records.

Usage
-----
    # Dry run — prints a full report, writes nothing:
    python manage.py migrate_columns_to_schema --dry-run

    # Migrate every dataset that still uses columns:
    python manage.py migrate_columns_to_schema

    # Migrate a single dataset by name (useful for testing one at a time):
    python manage.py migrate_columns_to_schema --dataset my_dataset_name

What the command does for each eligible Dataset
------------------------------------------------
1.  Builds a JSON Schema (``data_schema``) from the dataset's Column objects.

    Type resolution works in two passes, with the form taking priority over
    col_format wherever it provides reliable information:

    Pass A — form-authoritative columns
        ``single_column_question``:
            Always ``type: "string"`` with a ``choices`` list taken from the
            option ``db_value`` fields.  The form is the canonical source for
            both type and allowed values; col_format is ignored entirely.

        ``input_question`` (both ``text_input`` and ``textarea``):
            Always ``type: "string"``.  Both variants render an unrestricted
            HTML text input — the user can type any characters, so there is no
            guarantee the value is numeric even if col_format says NUMBER.
            col_format is ignored entirely for these columns.

    Pass B — col_format-only columns
        All remaining columns (those not referenced by any form element) use
        col_format as their sole type hint:

        VARCHAR2(…) / text / empty / unknown  →  "string"
        DATE(7) / date                        →  "string", format "date"
        NUMBER(p, 0) / NUMBER(p,) / Int       →  "integer"
        NUMBER(p, s>0) / number / Number(…)   →  "number"
        NUMBER(,)                             →  "number"  (ambiguous, safe default)

    ``multi_column_question`` option-columns always map to ``type: "string"``
    and receive an ``x-multi-column-group`` annotation so that Step 2 can
    merge them into a single array property (see docs/STEP2_FORM_MIGRATION.md).

2.  For each Examination belonging to the dataset, builds an ``Examination.data``
    dict by reading all related Cell values keyed by column name.  Values are
    coerced to the correct Python type (int / float / str) matching the schema
    type derived in step 1.  Empty-string cells are omitted.

3.  Saves the new ``data_schema`` on the Dataset and bulk-updates every
    Examination's ``data`` field.

4.  Deletes all Cell and Column records for the dataset.

Safety notes
------------
- Each dataset is processed inside its own ``transaction.atomic()``.  A failure
  on one dataset rolls back only that dataset; others are unaffected.
- ``--dry-run`` performs every calculation but never touches the database.
- Datasets that already have a non-empty ``data_schema`` are skipped.
- Datasets with no Column objects are skipped.
"""

import re
import sys

from django.core.management.base import BaseCommand
from django.db import transaction

from data.models import Cell, Column, Dataset, Examination

# ---------------------------------------------------------------------------
# col_format → JSON Schema type helpers
# ---------------------------------------------------------------------------

_NUMBER_RE = re.compile(
    r"^NUMBER\s*\(\s*(\d*)\s*,\s*(\d*)\s*\)$",
    re.IGNORECASE,
)
_VARCHAR_RE = re.compile(r"^VARCHAR2?\s*\(", re.IGNORECASE)


def col_format_to_schema_type(col_format: str) -> tuple[str, str | None]:
    """
    Convert a legacy Oracle/mixed ``col_format`` string to a
    ``(json_schema_type, json_schema_format_or_None)`` pair.

    This is only called for columns whose type cannot be determined from the
    form element (see module docstring).
    """
    raw = (col_format or "").strip()
    upper = raw.upper()

    if not raw:
        return "string", None

    if upper in ("DATE(7)", "DATE"):
        return "string", "date"

    if upper == "TEXT":
        return "string", None

    if _VARCHAR_RE.match(upper):
        return "string", None

    if upper == "INT":
        return "integer", None

    if upper in ("NUMBER", "NUMBER(,)"):
        return "number", None

    m = _NUMBER_RE.match(raw)
    if m:
        scale_str = m.group(2).strip()
        if scale_str in ("", "0"):
            return "integer", None
        return "number", None

    # Mixed-case variant, e.g. "Number(3,2)"
    if re.match(r"^number\s*\(", raw, re.IGNORECASE):
        m2 = re.match(
            r"number\s*\(\s*(\d*)\s*,\s*(\d*)\s*\)",
            raw,
            re.IGNORECASE,
        )
        if m2:
            scale_str = m2.group(2).strip()
            if scale_str in ("", "0"):
                return "integer", None
            return "number", None
        return "number", None

    # Fallback — unknown format; store as string so no data is lost
    return "string", None


# ---------------------------------------------------------------------------
# Form-element inspection helpers
# ---------------------------------------------------------------------------


def _flat_elements(form: dict) -> list[dict]:
    """Return every element and sub-element from a form, flattened."""
    result = []
    for elem in form.get("elements") or []:
        result.append(elem)
        result.extend(elem.get("sub_elements") or [])
    return result


def _build_form_type_overrides(dataset: Dataset) -> dict[str, dict]:
    """
    Inspect the dataset's form JSON and return a mapping of

        column_name  →  partial schema property dict

    for every column whose type can be determined reliably from the form,
    i.e. better than from col_format alone.  Columns not present in the
    returned dict must fall back to col_format.

    Covered cases:

    ``single_column_question``
        type: "string", choices: [<db_value>, ...]
        The form is the authoritative source; col_format is ignored.

    ``input_question`` with ``input_type: "textarea"``
        type: "string"
        A textarea is definitively a long free-text field.

    ``multi_column_question`` options
        type: "string"
        Each option-column is effectively a boolean "0"/"1" flag stored as a
        string.  An ``x-multi-column-group`` annotation is added so that Step 2
        can merge the individual columns back into a single array property.
    """
    overrides: dict[str, dict] = {}
    form = dataset.form or {}
    elements = _flat_elements(form)

    # Track multi_column_question groups for annotation
    multi_group_index = 0

    for elem in elements:
        content = elem.get("content") or {}
        elem_type = content.get("type")

        if elem_type == "single_column_question":
            col_name = content.get("column")
            if not col_name:
                continue
            col_name = str(col_name)
            choices = [
                opt["db_value"]
                for opt in (content.get("options") or [])
                if opt.get("db_value") is not None
            ]
            overrides[col_name] = {
                "type": "string",
                **({"choices": choices} if choices else {}),
            }

        elif elem_type == "input_question":
            col_name = content.get("column")
            if col_name:
                # Both text_input and textarea are unrestricted HTML text
                # inputs — the user can type any characters, so the stored
                # value is always a string regardless of col_format.
                overrides.setdefault(str(col_name), {"type": "string"})

        elif elem_type == "multi_column_question":
            group_text = content.get("text") or ""
            options = content.get("options") or []
            for opt in options:
                col_name = opt.get("column")
                if not col_name:
                    continue
                col_name = str(col_name)
                overrides[col_name] = {
                    "type": "string",
                    "x-multi-column-group": {
                        "group_index": multi_group_index,
                        "group_text": group_text,
                        "option_text": opt.get("text") or "",
                    },
                }
            multi_group_index += 1

    return overrides


# ---------------------------------------------------------------------------
# Schema builder
# ---------------------------------------------------------------------------


def build_data_schema(dataset: Dataset) -> dict:
    """
    Construct a ``{"type": "object", "properties": {...}}`` JSON Schema from
    the dataset's Column set.

    For each column the property type is resolved as follows:

    1.  If the form element analysis (``_build_form_type_overrides``) yields an
        override for this column, that override wins — col_format is ignored for
        the type/choices fields.

    2.  Otherwise ``col_format_to_schema_type`` is used.

    In both cases, the Column's ``title`` and ``description`` are always
    preserved, and the form-derived override is merged on top so that col_format
    can still supply ``format: "date"`` for columns not covered by the form.
    """
    form_overrides = _build_form_type_overrides(dataset)

    # Preserve column order: explicit display_order first, then by insertion id
    columns = list(dataset.column_set.order_by("display_order", "id"))

    properties: dict[str, dict] = {}

    for col in columns:
        col_type, col_fmt = col_format_to_schema_type(col.col_format)

        if col.name in form_overrides:
            # Form override supplies the type (and possibly choices).
            # We still carry col_format's "date" format if applicable, but
            # the form's string/number declaration takes precedence.
            prop: dict = {
                "type": form_overrides[col.name]["type"],
                "title": col.title or col.name,
            }
            # Merge any extra keys from the override (choices, x-multi-column-group…)
            for k, v in form_overrides[col.name].items():
                if k != "type":
                    prop[k] = v
            # Carry date format from col_format only when the form also says string
            if col_fmt and prop["type"] == "string":
                prop["format"] = col_fmt
        else:
            # No form override — use col_format exclusively for the type
            prop = {
                "type": col_type,
                "title": col.title or col.name,
            }
            if col_fmt:
                prop["format"] = col_fmt

        if col.description:
            prop["description"] = col.description

        properties[col.name] = prop

    return {
        "type": "object",
        "properties": properties,
    }


# ---------------------------------------------------------------------------
# Per-examination data builder
# ---------------------------------------------------------------------------


def build_examination_data(examination: Examination, schema: dict) -> dict:
    """
    Build the ``data`` dict for a single examination from its Cell set.

    Values are coerced to the correct Python type (int / float / str) using the
    schema that was just built for this dataset.  Empty-string and null cell
    values are omitted so the resulting dict stays sparse, matching the Model-A
    convention where a missing key means "no data entered".
    """
    properties = schema.get("properties") or {}
    data: dict = {}

    for cell in examination.cell_set.select_related("column").all():
        if cell.value == "" or cell.value is None:
            continue

        col_name = cell.column.name
        schema_type = (properties.get(col_name) or {}).get("type", "string")

        try:
            if schema_type == "integer":
                value: int | float | str = int(cell.value)
            elif schema_type == "number":
                value = float(cell.value)
            else:
                value = cell.value
        except (ValueError, TypeError):
            # Stored value doesn't parse to the expected type — keep as string
            # so no data is silently lost.
            value = cell.value

        data[col_name] = value

    return data


# ---------------------------------------------------------------------------
# The command
# ---------------------------------------------------------------------------


class Command(BaseCommand):
    help = (
        "Migrate Column/Cell data (Model B) into Dataset.data_schema / "
        "Examination.data (Model A), then delete the Column and Cell records."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            default=False,
            help=(
                "Simulate the migration and print a full report without "
                "writing anything to the database."
            ),
        )
        parser.add_argument(
            "--dataset",
            metavar="DATASET_NAME",
            default=None,
            help="Migrate only the named dataset (slug). Useful for testing.",
        )

    # ------------------------------------------------------------------

    def handle(self, *args, **options):
        dry_run: bool = options["dry_run"]
        target_name: str | None = options["dataset"]

        if dry_run:
            self.stdout.write(
                self.style.WARNING("DRY RUN — no changes will be written.\n"),
            )

        qs = Dataset.objects.filter(column__isnull=False).distinct()
        if target_name:
            qs = qs.filter(name=target_name)
            if not qs.exists():
                self.stderr.write(
                    self.style.ERROR(
                        f"Dataset '{target_name}' not found or has no columns.",
                    ),
                )
                sys.exit(1)

        datasets = list(qs.order_by("name"))
        self.stdout.write(f"Found {len(datasets)} dataset(s) to process.\n")

        total_migrated = 0
        total_skipped = 0
        total_errors = 0

        for dataset in datasets:
            result = self._process_dataset(dataset, dry_run=dry_run)
            if result == "migrated":
                total_migrated += 1
            elif result == "skipped":
                total_skipped += 1
            else:
                total_errors += 1

        self.stdout.write("")
        self.stdout.write("=" * 60)
        self.stdout.write(
            self.style.SUCCESS(f"Migrated : {total_migrated}")
            + f"  Skipped: {total_skipped}  Errors: {total_errors}",
        )
        if dry_run:
            self.stdout.write(
                self.style.WARNING("DRY RUN complete — database was not modified."),
            )

        if total_errors:
            sys.exit(1)

    # ------------------------------------------------------------------

    def _process_dataset(self, dataset: Dataset, dry_run: bool) -> str:
        """Process one dataset.  Returns 'migrated', 'skipped', or 'error'."""
        ds_label = f"[{dataset.name}]"

        if dataset.data_schema and dataset.data_schema.get("properties"):
            self.stdout.write(
                f"  {ds_label} SKIP — already has data_schema "
                f"({len(dataset.data_schema['properties'])} properties)",
            )
            return "skipped"

        columns = list(dataset.column_set.order_by("display_order", "id"))
        if not columns:
            self.stdout.write(f"  {ds_label} SKIP — no columns found")
            return "skipped"

        examinations = list(
            Examination.objects.filter(dataset=dataset).prefetch_related(
                "cell_set__column",
            ),
        )

        new_schema = build_data_schema(dataset)
        n_props = len(new_schema["properties"])

        updated_examinations: list[Examination] = []
        for exam in examinations:
            exam.data = build_examination_data(exam, new_schema)
            updated_examinations.append(exam)

        n_cells = Cell.objects.filter(column__dataset=dataset).count()

        # Summarise what type sources were used
        form_overrides = _build_form_type_overrides(dataset)
        n_form_driven = sum(1 for col in columns if col.name in form_overrides)
        n_colformat_driven = len(columns) - n_form_driven

        self.stdout.write(
            f"  {ds_label} "
            f"{len(columns)} columns → {n_props} schema properties "
            f"(form: {n_form_driven}, col_format: {n_colformat_driven}) | "
            f"{len(examinations)} examinations | "
            f"{n_cells} cells to delete",
        )

        if dry_run:
            for prop_name, prop_def in list(new_schema["properties"].items())[:5]:
                self.stdout.write(f"    {prop_name!r}: {prop_def}")
            if n_props > 5:
                self.stdout.write(f"    … and {n_props - 5} more properties")
            return "migrated"

        try:
            with transaction.atomic():
                dataset.data_schema = new_schema
                dataset.save(update_fields=["data_schema"])

                if updated_examinations:
                    Examination.objects.bulk_update(
                        updated_examinations,
                        fields=["data"],
                        batch_size=500,
                    )

                # Delete cells before columns (FK dependency)
                Cell.objects.filter(column__dataset=dataset).delete()
                Column.objects.filter(dataset=dataset).delete()

            self.stdout.write(self.style.SUCCESS("    ✓ committed"))
            return "migrated"

        except Exception as exc:
            self.stderr.write(self.style.ERROR(f"    ✗ ERROR for {ds_label}: {exc}"))
            return "error"
