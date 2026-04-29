"""
Management command: migrate_to_schema

Combines both migration steps into a single command:

  Step 1 — Column/Cell → data_schema/Examination.data
      Builds Dataset.data_schema from Column objects and populates
      Examination.data from Cell objects, then deletes Columns and Cells.

  Step 2 — Form element types → data_question
      Converts all legacy form element types (input_question,
      single_column_question, multi_column_question) to data_question,
      merges multi_column_question groups into array schema properties,
      and removes x-multi-column-group scaffolding annotations.

The two steps run in sequence for each dataset, inside a single
transaction.atomic() per dataset, so either both succeed or neither is
committed.

Usage
-----
    # Dry run — prints a full report, writes nothing:
    python manage.py migrate_to_schema --dry-run

    # Migrate every eligible dataset:
    python manage.py migrate_to_schema

    # Migrate a single dataset by name (useful for testing):
    python manage.py migrate_to_schema --dataset my_dataset_name

Step 1 — what it does
---------------------
For each Dataset that has Column objects and no existing data_schema:

1.  Builds a JSON Schema {"type": "object", "properties": {...}} from the
    Column objects.  Type resolution uses two passes:

    Pass A — form-authoritative columns:
        single_column_question  → type "string" + choices list from the
                                  form's option db_values.
        input_question          → type "string" regardless of col_format,
                                  because both text_input and textarea are
                                  unrestricted HTML text fields.
        multi_column_question   → type "string" + x-multi-column-group
                                  annotation (scaffolding consumed by Step 2).

    Pass B — col_format-only columns (no form element):
        VARCHAR2(n)             → type "string", maxLength n
        TEXT / empty / unknown  → type "string"
        DATE(7) / DATE          → type "string", format "date"
        NUMBER(p,0) / INT       → type "integer"
        NUMBER(p,s>0) / number  → type "number"
        NUMBER(,)               → type "number"

    The maxLength value extracted from VARCHAR2(n) is stored in the schema
    and used by the JS renderer to automatically select textarea vs
    text input (see TEXTAREA_MAXLENGTH_THRESHOLD in templates.js).

2.  For each Examination, builds a data dict from its Cell values, coercing
    each value to the correct Python type (int / float / str) as determined
    by the schema.  Empty-string cells are omitted.

3.  Saves data_schema to the Dataset and bulk-updates all Examinations.

4.  Deletes all Cell and Column records for the dataset.

Step 2 — what it does
---------------------
For every element (and sub-element) in Dataset.form["elements"]:

    input_question      → {"type": "data_question", "property": <column>}
                          If input_type was "textarea", adds
                          "widget": "textarea" to the schema property.

    single_column_question
                        → {"type": "data_question", "property": <column>}
                          choices already in the schema from Step 1.

    multi_column_question
                        → Merges the group into one array+choices schema
                          property.  Examination.data is updated to replace
                          the per-column "0"/"1" flags with a JSON array of
                          selected option texts.  The element becomes a
                          single data_question.

    label / html / show_value / data_question
                        → Left untouched.

Also removes x-multi-column-group scaffolding annotations from the schema.

Safety notes
------------
- Each dataset is processed inside its own transaction.atomic().  All
  calculations are performed on deep copies first; the transaction only
  performs DB writes.  A failure on one dataset rolls back only that
  dataset.
- --dry-run performs every calculation but never touches the database.
- Datasets that already have a non-empty data_schema AND whose form
  contains no legacy element types and no scaffolding annotations are
  skipped entirely.
- Datasets with no Column objects and no form elements to migrate are
  also skipped.
"""

import copy
import re
import sys

from django.core.management.base import BaseCommand
from django.db import transaction

from data.models import Cell, Column, Dataset, Examination

# ---------------------------------------------------------------------------
# Regex helpers
# ---------------------------------------------------------------------------

_NUMBER_RE = re.compile(
    r"^NUMBER\s*\(\s*(\d*)\s*,\s*(\d*)\s*\)$",
    re.IGNORECASE,
)
_VARCHAR_RE = re.compile(r"^VARCHAR2?\s*\(\s*(\d+)\s*\)$", re.IGNORECASE)


# ---------------------------------------------------------------------------
# Step 1 helpers — schema building from Columns
# ---------------------------------------------------------------------------


def col_format_to_schema_attrs(col_format: str) -> dict:
    """
    Convert a legacy Oracle/mixed col_format string to a partial JSON Schema
    property dict containing only the keys col_format can reliably supply.

    Returned keys (all optional):
        "type"       — "string" | "integer" | "number"
        "format"     — "date"  (only when type is "string")
        "maxLength"  — int, extracted from VARCHAR2(n)

    The maxLength value drives the textarea-vs-input decision in the JS
    renderer.  The threshold is TEXTAREA_MAXLENGTH_THRESHOLD in templates.js.
    A string property with no maxLength is rendered as a plain text input.
    """
    raw = (col_format or "").strip()
    upper = raw.upper()

    if not raw:
        return {"type": "string"}

    if upper in ("DATE(7)", "DATE"):
        return {"type": "string", "format": "date"}

    if upper == "TEXT":
        return {"type": "string"}

    m_varchar = _VARCHAR_RE.match(raw)
    if m_varchar:
        return {"type": "string", "maxLength": int(m_varchar.group(1))}

    if upper == "INT":
        return {"type": "integer"}

    if upper in ("NUMBER", "NUMBER(,)"):
        return {"type": "number"}

    m = _NUMBER_RE.match(raw)
    if m:
        scale_str = m.group(2).strip()
        if scale_str in ("", "0"):
            return {"type": "integer"}
        return {"type": "number"}

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
                return {"type": "integer"}
            return {"type": "number"}
        return {"type": "number"}

    # Fallback — unknown format; store as string so no data is lost
    return {"type": "string"}


def _flat_elements(form: dict) -> list[dict]:
    """Return every element and sub-element from form as a flat list."""
    result = []
    for elem in form.get("elements") or []:
        result.append(elem)
        result.extend(elem.get("sub_elements") or [])
    return result


def _build_form_type_overrides(dataset: Dataset) -> dict[str, dict]:
    """
    Inspect the dataset's form JSON and return a mapping of

        column_name  →  partial schema property dict

    for every column whose type can be determined reliably from the form
    element, i.e. better than from col_format alone.

    Covered cases:

    single_column_question
        type "string", choices [<db_value>, ...]
        The form is authoritative; col_format is ignored for type/choices.
        If the element has a "label", it is stored as "title" and takes
        precedence over the Column.title when building the schema.

    input_question (both text_input and textarea)
        type "string"
        Both variants render an unrestricted HTML text field; there is no
        guarantee the stored value is numeric even if col_format says NUMBER.
        col_format is ignored entirely for type.
        If the element has a "label", it is stored as "title" and takes
        precedence over the Column.title when building the schema.

    multi_column_question options
        type "string"
        Each option-column is a boolean "0"/"1" flag stored as a string.
        An x-multi-column-group annotation is added so that Step 2 can
        merge the individual columns into a single array property.
        If the element has a "label", it is passed along so Step 2 can use
        it as the title of the merged array property.
    """
    overrides: dict[str, dict] = {}
    form = dataset.form or {}
    elements = _flat_elements(form)

    multi_group_index = 0

    for elem in elements:
        content = elem.get("content") or {}
        elem_type = content.get("type")

        if elem_type == "single_column_question":
            col_name = content.get("column")
            if not col_name:
                continue
            col_name = str(col_name)
            choices = []
            for opt in content.get("options") or []:
                if opt.get("db_value") is None:
                    continue
                text = str(opt.get("text", ""))
                db_value = opt["db_value"]
                if text != str(db_value):
                    choices.append([text, db_value])
                else:
                    choices.append(db_value)
            override: dict = {
                "type": "string",
                **({"choices": choices} if choices else {}),
            }
            label = elem.get("label")
            if label:
                override["title"] = label
            overrides[col_name] = override

        elif elem_type == "input_question":
            col_name = content.get("column")
            if col_name:
                col_name = str(col_name)
                input_override: dict = {"type": "string"}
                label = elem.get("label")
                if label:
                    input_override["title"] = label
                # setdefault: don't overwrite a single_column_question override
                # that might already exist for the same column.
                overrides.setdefault(col_name, input_override)

        elif elem_type == "multi_column_question":
            group_text = content.get("text") or ""
            for opt in content.get("options") or []:
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


def build_data_schema(dataset: Dataset) -> dict:
    """
    Construct a {"type": "object", "properties": {...}} JSON Schema from the
    dataset's Column set.

    For each column the property is built as follows:
    1.  Start with col_format_to_schema_attrs() to get type/format/maxLength.
    2.  Merge in the form override (if any) — this wins on type and choices,
        but preserves maxLength from col_format so the renderer knows the
        field's length even for form-referenced columns.
    3.  Add title and description from the Column object.
    """
    form_overrides = _build_form_type_overrides(dataset)

    # Preserve column order: explicit display_order first, then by insertion id.
    columns = list(dataset.column_set.order_by("display_order", "id"))

    properties: dict[str, dict] = {}

    for col in columns:
        col_attrs = col_format_to_schema_attrs(col.col_format)

        prop: dict = {"title": col.title or col.name}
        # Start with col_format attrs so maxLength / format are preserved.
        prop.update(col_attrs)

        if col.name in form_overrides:
            # Form override wins on type and choices.
            prop.update(form_overrides[col.name])
            # If the form changed the type away from string, drop format.
            if prop.get("format") and prop.get("type") != "string":
                del prop["format"]

        description = col.description or ""
        if description == "There is no description of this field.":
            description = ""
        if description:
            prop["description"] = description

        properties[col.name] = prop

    return {
        "type": "object",
        "properties": properties,
    }


def build_examination_data(examination: Examination, schema: dict) -> dict:
    """
    Build the data dict for a single examination from its Cell set.

    Values are coerced to the correct Python type (int / float / str) using
    the schema that was just built for this dataset.  Empty-string and null
    cell values are omitted so the dict stays sparse — a missing key means
    "no data entered", matching the Model-A convention.
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
            # Stored value doesn't parse — keep as string so no data is lost.
            value = cell.value

        data[col_name] = value

    return data


# ---------------------------------------------------------------------------
# Step 2 helpers — form element conversion
# ---------------------------------------------------------------------------


def _slugify(text: str) -> str:
    """Lowercase slug: keep only ascii letters, digits and underscores."""
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9]+", "_", text)
    return text.strip("_")


def _has_legacy_elements(form: dict) -> bool:
    """Return True if the form contains any element type that needs migration."""
    legacy = {"input_question", "single_column_question", "multi_column_question"}
    return any(e.get("content", {}).get("type") in legacy for e in _flat_elements(form))


def _has_scaffolding(schema_properties: dict) -> bool:
    """Return True if any schema property still carries an x-multi-column-group key."""
    return any("x-multi-column-group" in prop for prop in schema_properties.values())


def migrate_form_in_memory(
    form: dict,
    schema_properties: dict,
    exam_data_list: list[dict],
) -> dict:
    """
    Apply all Step 2 form-element conversions to the in-memory form dict,
    schema_properties dict, and exam_data_list (one data dict per examination).

    All three arguments are mutated in-place.

    Display properties from the old content are preserved in the new
    data_question content object:
        input_question        — width, tabindex, placement, placeholder, caption
        single_column_question — width, tabindex, placement, caption
        multi_column_question  — tabindex, options_orientation

    Returns a report dict:
        converted_input        int
        converted_single       int
        converted_multi        int
        merged_property_names  list[str]  — new array property names
        removed_schema_keys    list[str]  — old per-option column keys removed
        scaffolding_removed    int
    """
    report = {
        "converted_input": 0,
        "converted_single": 0,
        "converted_multi": 0,
        "merged_property_names": [],
        "removed_schema_keys": [],
        "scaffolding_removed": 0,
    }

    for element in _flat_elements(form):
        content = element.get("content") or {}
        elem_type = content.get("type")

        if elem_type == "input_question":
            col_name = str(content.get("column") or "")
            # Preserve textarea intent in the schema so the JS renderer can
            # use a <textarea> once it supports the "widget" hint.  The
            # maxLength route (below) is the preferred long-term mechanism;
            # "widget" is a fallback for cases where col_format was absent.
            if (
                content.get("input_type") == "textarea"
                and col_name in schema_properties
            ):
                schema_properties[col_name].setdefault("widget", "textarea")
            new_content: dict = {"type": "data_question", "property": col_name}
            for key in (
                "width",
                "tabindex",
                "placement",
                "placeholder",
                "caption",
                "hide_text",
            ):
                if key in content:
                    new_content[key] = content[key]
            element["content"] = new_content
            report["converted_input"] += 1

        elif elem_type == "single_column_question":
            col_name = str(content.get("column") or "")
            new_content = {"type": "data_question", "property": col_name}
            for key in ("width", "tabindex", "placement", "caption", "hide_text"):
                if key in content:
                    new_content[key] = content[key]
            element["content"] = new_content
            report["converted_single"] += 1

        elif elem_type == "multi_column_question":
            elem_label = element.get("label") or ""
            merged_name, removed_keys = _merge_multi_column_group(
                content,
                schema_properties,
                exam_data_list,
                elem_label,
            )
            new_content = {"type": "data_question", "property": merged_name}
            for key in ("tabindex", "options_orientation", "hide_text"):
                if key in content:
                    new_content[key] = content[key]
            element["content"] = new_content
            report["converted_multi"] += 1
            if merged_name:
                report["merged_property_names"].append(merged_name)
            report["removed_schema_keys"].extend(removed_keys)

    # Remove scaffolding annotations left by Step 1.
    for prop in schema_properties.values():
        if "x-multi-column-group" in prop:
            del prop["x-multi-column-group"]
            report["scaffolding_removed"] += 1

    return report


def _merge_multi_column_group(
    content: dict,
    schema_properties: dict,
    exam_data_list: list[dict],
    elem_label: str = "",
) -> tuple[str, list[str]]:
    """
    Merge one multi_column_question group.

    Mutates schema_properties and each dict in exam_data_list in-place.

    elem_label is the "label" from the form element; when present it takes
    precedence over content["text"] as the title of the merged property.

    Returns:
        merged_name   — the new array property name (empty string on failure)
        removed_keys  — list of old per-option column names removed from schema
    """
    options = content.get("options") or []
    group_text = content.get("text") or ""

    # Build (column_name, display_text) pairs, skipping options with no column.
    option_pairs = [
        (str(opt["column"]), opt.get("text") or str(opt["column"]))
        for opt in options
        if opt.get("column") is not None
    ]

    if not option_pairs:
        return "", []

    # Determine the merged property name.
    first_col = option_pairs[0][0]
    candidate = _slugify(group_text)
    if not candidate or candidate in schema_properties:
        candidate = first_col
    if candidate in schema_properties:
        candidate = candidate + "_group"
    merged_name = candidate

    # Add the merged array property to the schema.
    # elem_label (from the form element's "label" field) takes precedence over
    # group_text (from the element's content "text" field).
    choices = [display_text for _, display_text in option_pairs]
    schema_properties[merged_name] = {
        "type": "array",
        "title": elem_label or group_text or merged_name,
        "items": {"type": "string"},
        "choices": choices,
    }

    # Update each examination's data dict: replace per-column flags with array.
    for exam_data in exam_data_list:
        selected = [
            display_text
            for col, display_text in option_pairs
            # Any value other than "0", 0, empty string, None, or False
            # is treated as selected ("1" and 1 are the most common).
            if exam_data.get(col) not in ("", "0", 0, None, False)
        ]
        exam_data[merged_name] = selected
        for col, _ in option_pairs:
            exam_data.pop(col, None)

    # Remove the old individual properties from the schema.
    removed_keys = []
    for col, _ in option_pairs:
        if col in schema_properties:
            del schema_properties[col]
            removed_keys.append(col)

    return merged_name, removed_keys


# ---------------------------------------------------------------------------
# The management command
# ---------------------------------------------------------------------------


class Command(BaseCommand):
    help = (
        "Migrate Column/Cell data and legacy form element types to the "
        "data_schema/Examination.data model (Step 1 + Step 2 combined)."
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
            help="Migrate only the named dataset (slug).",
        )

    def handle(self, *args, **options):
        dry_run: bool = options["dry_run"]
        target_name: str | None = options["dataset"]

        if dry_run:
            self.stdout.write(
                self.style.WARNING("DRY RUN — no changes will be written.\n"),
            )

        qs = Dataset.objects.all()
        if target_name:
            qs = qs.filter(name=target_name)
            if not qs.exists():
                self.stderr.write(
                    self.style.ERROR(f"Dataset '{target_name}' not found."),
                )
                sys.exit(1)

        datasets = list(qs.order_by("name"))
        self.stdout.write(f"Found {len(datasets)} dataset(s) to inspect.\n")

        total_migrated = 0
        total_skipped = 0
        total_errors = 0

        for dataset in datasets:
            outcome = self._process_dataset(dataset, dry_run=dry_run)
            if outcome == "migrated":
                total_migrated += 1
            elif outcome == "skipped":
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

    def _process_dataset(self, dataset: Dataset, dry_run: bool) -> str:
        """Process one dataset.  Returns 'migrated', 'skipped', or 'error'."""
        ds_label = f"[{dataset.name}]"

        has_columns = dataset.column_set.exists()
        already_has_schema = bool((dataset.data_schema or {}).get("properties"))
        form = dataset.form or {}
        schema_properties = (dataset.data_schema or {}).get("properties") or {}
        needs_step2 = _has_legacy_elements(form) or _has_scaffolding(schema_properties)

        # Skip completely if there is nothing to do.
        if not has_columns and not needs_step2:
            self.stdout.write(f"  {ds_label} SKIP — nothing to migrate")
            return "skipped"

        if already_has_schema and not needs_step2:
            self.stdout.write(
                f"  {ds_label} SKIP — already fully migrated "
                f"({len(schema_properties)} properties)",
            )
            return "skipped"

        # --- Step 1: build schema and examination data from Columns/Cells ---

        step1_summary = ""

        if has_columns and not already_has_schema:
            columns = list(dataset.column_set.order_by("display_order", "id"))
            examinations_step1 = list(
                Examination.objects.filter(dataset=dataset).prefetch_related(
                    "cell_set__column",
                ),
            )
            new_schema = build_data_schema(dataset)
            n_cells = Cell.objects.filter(column__dataset=dataset).count()

            updated_examinations = []
            for exam in examinations_step1:
                exam.data = build_examination_data(exam, new_schema)
                updated_examinations.append(exam)

            step1_summary = (
                f"Step 1: {len(columns)} columns → "
                f"{len(new_schema['properties'])} schema properties | "
                f"{len(examinations_step1)} examinations | "
                f"{n_cells} cells"
            )
        else:
            new_schema = None
            updated_examinations = []
            n_cells = 0

        # --- Step 2: convert form elements to data_question ---

        # Determine the schema_properties to work on for Step 2.
        # If Step 1 just built a new schema, use that; otherwise use existing.
        if new_schema is not None:
            schema_props_for_step2 = new_schema["properties"]
        else:
            schema_props_for_step2 = copy.deepcopy(schema_properties)

        step2_summary = ""

        if needs_step2 and form.get("elements"):
            # Load examinations for Step 2 data mutation (multi_column merges).
            # If Step 1 already loaded them, reuse those objects; their data
            # has already been updated to the new schema values.
            if updated_examinations:
                examinations_step2 = updated_examinations
            else:
                examinations_step2 = list(Examination.objects.filter(dataset=dataset))

            form_copy = copy.deepcopy(form)
            exam_data_copies = [copy.deepcopy(exam.data) for exam in examinations_step2]

            try:
                step2_report = migrate_form_in_memory(
                    form_copy,
                    schema_props_for_step2,
                    exam_data_copies,
                )
            except Exception as exc:
                self.stderr.write(
                    self.style.ERROR(f"  {ds_label} ✗ Step 2 computation error: {exc}"),
                )
                return "error"

            parts = []
            if step2_report["converted_input"]:
                parts.append(f"input_question×{step2_report['converted_input']}")
            if step2_report["converted_single"]:
                parts.append(
                    f"single_column_question×{step2_report['converted_single']}",
                )
            if step2_report["converted_multi"]:
                merged = ", ".join(step2_report["merged_property_names"])
                removed = ", ".join(step2_report["removed_schema_keys"])
                parts.append(
                    f"multi_column_question×{step2_report['converted_multi']} "
                    f"→ [{merged}] (removed: [{removed}])",
                )
            if step2_report["scaffolding_removed"]:
                parts.append(
                    f"scaffolding×{step2_report['scaffolding_removed']} removed",
                )
            step2_summary = "Step 2: " + (
                " | ".join(parts) if parts else "nothing converted"
            )
        else:
            form_copy = None
            exam_data_copies = []
            examinations_step2 = []
            step2_report = None

        # --- Print summary ---

        summary_lines = []
        if step1_summary:
            summary_lines.append(step1_summary)
        if step2_summary:
            summary_lines.append(step2_summary)
        for line in summary_lines:
            self.stdout.write(f"  {ds_label} {line}")

        if dry_run:
            return "migrated"

        # --- Write everything inside a single atomic transaction ---
        try:
            with transaction.atomic():
                if new_schema is not None:
                    # Step 1 writes: save schema, bulk-update examinations,
                    # delete cells then columns.

                    # If Step 2 also ran, schema_props_for_step2 is the same
                    # dict as new_schema["properties"] and has been mutated
                    # in-place by migrate_form_in_memory.  The save below
                    # will capture those mutations automatically.
                    dataset.data_schema = new_schema
                    dataset.save(update_fields=["data_schema"])

                    if updated_examinations:
                        # If Step 2 ran and mutated exam_data_copies, apply
                        # those copies back to the examination objects now.
                        if exam_data_copies:
                            for exam, new_data in zip(
                                examinations_step2,
                                exam_data_copies,
                            ):
                                exam.data = new_data
                        Examination.objects.bulk_update(
                            updated_examinations,
                            fields=["data"],
                            batch_size=500,
                        )

                    Cell.objects.filter(column__dataset=dataset).delete()
                    Column.objects.filter(dataset=dataset).delete()

                elif (
                    exam_data_copies
                    and step2_report
                    and step2_report["converted_multi"]
                ):
                    # Step 1 was skipped (schema already existed) but Step 2
                    # ran and changed examination data via multi_column merges.
                    for exam, new_data in zip(examinations_step2, exam_data_copies):
                        exam.data = new_data
                    Examination.objects.bulk_update(
                        examinations_step2,
                        fields=["data"],
                        batch_size=500,
                    )

                if form_copy is not None:
                    # Step 2 writes: save the converted form and final schema.
                    dataset.form = form_copy
                    dataset.data_schema = {
                        **(dataset.data_schema or {}),
                        "properties": schema_props_for_step2,
                    }
                    dataset.save(update_fields=["form", "data_schema"])

            self.stdout.write(self.style.SUCCESS("    ✓ committed"))
            return "migrated"

        except Exception as exc:
            self.stderr.write(self.style.ERROR(f"    ✗ ERROR for {ds_label}: {exc}"))
            return "error"
