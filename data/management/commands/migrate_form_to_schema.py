"""
Management command: migrate_form_to_schema

Converts all legacy Model-B form element types in Dataset.form into the
Model-A ``data_question`` type, so that the form only controls layout and
all type/option information lives in Dataset.data_schema.

Prerequisite
------------
``python manage.py migrate_columns_to_schema`` must have been run first.
Every Dataset that previously used Columns must already have a populated
``data_schema`` and every Examination must already have a populated ``data``
dict.  The Column and Cell tables must be empty.

Usage
-----
    # Dry run — prints a full report, writes nothing:
    python manage.py migrate_form_to_schema --dry-run

    # Migrate every dataset whose form still contains legacy element types:
    python manage.py migrate_form_to_schema

    # Migrate a single dataset by name (useful for testing one at a time):
    python manage.py migrate_form_to_schema --dataset my_dataset_name

What the command does for each eligible Dataset
------------------------------------------------
For every element (and sub-element) in Dataset.form["elements"]:

1.  input_question
        Replaced with {"type": "data_question", "property": <column>}.
        If the original input_type was "textarea", the schema property also
        gains "widget": "textarea" so the JS renderer can honour it later.

2.  single_column_question
        Replaced with {"type": "data_question", "property": <column>}.
        The choices are already in the schema from migrate_columns_to_schema.

3.  multi_column_question
        Each group of individual boolean-flag columns is merged into one
        array property in the schema.  Examination.data dicts are updated to
        replace the per-column "0"/"1" flags with a JSON array of the
        selected option texts.  The form element is replaced with a single
        data_question pointing at the new merged property.

        The merged property name is derived by slugifying the question text.
        If the slug is empty or already taken, the name of the first column
        in the group is used as the property name instead.

4.  label, html, show_value, data_question
        Left untouched — these carry no legacy data linkage.

After converting all elements the command also removes the temporary
``x-multi-column-group`` annotation from every schema property (it was
scaffolding left by migrate_columns_to_schema for this step only).

Safety notes
------------
- Each dataset is processed inside its own transaction.atomic().  All
  calculations (schema mutations, examination data mutations) are performed
  first on deep copies of the in-memory objects; the transaction only
  performs the DB writes.  A failure on one dataset rolls back only that
  dataset; other datasets are unaffected.
- --dry-run performs every calculation but never touches the database.
- Datasets whose form contains no legacy element types and no scaffolding
  annotations are skipped.
- Datasets with no form elements at all are skipped.
"""

import copy
import re
import sys

from django.core.management.base import BaseCommand
from django.db import transaction

from data.models import Dataset, Examination

# ---------------------------------------------------------------------------
# Small helpers
# ---------------------------------------------------------------------------


def _slugify(text: str) -> str:
    """Lowercase slug: keep only ascii letters, digits and underscores."""
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9]+", "_", text)
    return text.strip("_")


def _flat_elements(form: dict) -> list[dict]:
    """Return every element and sub-element from *form* as a flat list."""
    result = []
    for elem in form.get("elements") or []:
        result.append(elem)
        result.extend(elem.get("sub_elements") or [])
    return result


def _has_legacy_elements(form: dict) -> bool:
    """Return True if the form contains any element type that needs migration."""
    legacy = {"input_question", "single_column_question", "multi_column_question"}
    return any(e.get("content", {}).get("type") in legacy for e in _flat_elements(form))


def _has_scaffolding(schema_properties: dict) -> bool:
    """Return True if any schema property still carries an x-multi-column-group key."""
    return any("x-multi-column-group" in prop for prop in schema_properties.values())


# ---------------------------------------------------------------------------
# Core migration logic — operates entirely on in-memory objects
# ---------------------------------------------------------------------------


def migrate_dataset_in_memory(
    form: dict,
    schema_properties: dict,
    exam_data_list: list[dict],
) -> dict:
    """
    Apply all form-element conversions to the in-memory *form* dict,
    *schema_properties* dict, and *exam_data_list* (a list of examination
    data dicts, one per examination).

    All three arguments are mutated in-place.

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
            # use a <textarea> instead of <input type="text"> once it
            # supports the "widget" hint.
            if (
                content.get("input_type") == "textarea"
                and col_name in schema_properties
            ):
                schema_properties[col_name]["widget"] = "textarea"
            element["content"] = {"type": "data_question", "property": col_name}
            report["converted_input"] += 1

        elif elem_type == "single_column_question":
            col_name = str(content.get("column") or "")
            element["content"] = {"type": "data_question", "property": col_name}
            report["converted_single"] += 1

        elif elem_type == "multi_column_question":
            merged_name, removed_keys = _merge_multi_column_question(
                content,
                schema_properties,
                exam_data_list,
            )
            element["content"] = {"type": "data_question", "property": merged_name}
            report["converted_multi"] += 1
            if merged_name:
                report["merged_property_names"].append(merged_name)
            report["removed_schema_keys"].extend(removed_keys)

    # Remove scaffolding annotations that migrate_columns_to_schema left behind.
    for prop in schema_properties.values():
        if "x-multi-column-group" in prop:
            del prop["x-multi-column-group"]
            report["scaffolding_removed"] += 1

    return report


def _merge_multi_column_question(
    content: dict,
    schema_properties: dict,
    exam_data_list: list[dict],
) -> tuple[str, list[str]]:
    """
    Merge one multi_column_question group.

    Mutates *schema_properties* and each dict in *exam_data_list* in-place.

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
    choices = [display_text for _, display_text in option_pairs]
    schema_properties[merged_name] = {
        "type": "array",
        "title": group_text or merged_name,
        "items": {"type": "string"},
        "choices": choices,
    }

    # Update each examination's data dict.
    for exam_data in exam_data_list:
        selected = [
            display_text
            for col, display_text in option_pairs
            # Any value other than "0", 0, empty string, None, or False counts
            # as selected ("1" and 1 are the most common truthy values stored).
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
        "Convert legacy form element types (input_question, "
        "single_column_question, multi_column_question) to data_question, "
        "merge multi_column_question groups into array schema properties, "
        "and remove x-multi-column-group scaffolding annotations."
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

        form = dataset.form or {}
        if not form.get("elements"):
            self.stdout.write(f"  {ds_label} SKIP — no form elements")
            return "skipped"

        schema_properties = (dataset.data_schema or {}).get("properties") or {}

        # Skip if there is genuinely nothing to do.
        if not _has_legacy_elements(form) and not _has_scaffolding(schema_properties):
            self.stdout.write(f"  {ds_label} SKIP — already fully migrated")
            return "skipped"

        # Load all examinations up front.
        examinations = list(Examination.objects.filter(dataset=dataset))

        # Work on deep copies so that a dry-run or an error never partially
        # mutates the objects that Django has cached in memory.
        form_copy = copy.deepcopy(form)
        schema_props_copy = copy.deepcopy(schema_properties)
        # Build a parallel list of mutable data dicts, one per examination,
        # in the same order as `examinations`.
        exam_data_copies = [copy.deepcopy(exam.data) for exam in examinations]

        try:
            report = migrate_dataset_in_memory(
                form_copy,
                schema_props_copy,
                exam_data_copies,
            )
        except Exception as exc:
            self.stderr.write(
                self.style.ERROR(f"  {ds_label} ✗ computation error: {exc}"),
            )
            return "error"

        # Build a human-readable summary line.
        parts = []
        if report["converted_input"]:
            parts.append(f"input_question×{report['converted_input']}")
        if report["converted_single"]:
            parts.append(f"single_column_question×{report['converted_single']}")
        if report["converted_multi"]:
            merged = ", ".join(report["merged_property_names"])
            removed = ", ".join(report["removed_schema_keys"])
            parts.append(
                f"multi_column_question×{report['converted_multi']} "
                f"→ [{merged}] (removed: [{removed}])",
            )
        if report["scaffolding_removed"]:
            parts.append(f"scaffolding×{report['scaffolding_removed']} removed")
        summary = " | ".join(parts) if parts else "nothing converted"

        self.stdout.write(
            f"  {ds_label} {summary} | {len(examinations)} examination(s)",
        )

        if dry_run:
            return "migrated"

        # --- Write everything inside a single atomic transaction ---
        try:
            with transaction.atomic():
                # 1. Save the mutated form and schema.
                dataset.form = form_copy
                dataset.data_schema = {
                    **(dataset.data_schema or {}),
                    "properties": schema_props_copy,
                }
                dataset.save(update_fields=["form", "data_schema"])

                # 2. Bulk-update examination data if any multi_column_question
                #    groups were merged (the only conversion that changes data).
                if report["converted_multi"] and examinations:
                    for exam, new_data in zip(examinations, exam_data_copies):
                        exam.data = new_data
                    Examination.objects.bulk_update(
                        examinations,
                        fields=["data"],
                        batch_size=500,
                    )

            self.stdout.write(self.style.SUCCESS("    ✓ committed"))
            return "migrated"

        except Exception as exc:
            self.stderr.write(self.style.ERROR(f"    ✗ ERROR for {ds_label}: {exc}"))
            return "error"
