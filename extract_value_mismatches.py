"""
Extract mismatches between displayed option text and stored db_value
for all single_column_question elements across datasets.

Usage (on the server, from the project root):

    python manage.py shell < extract_value_mismatches.py > value_mismatches.csv

Output is RFC-4180 CSV to stdout.  Open the file in LibreOffice Calc,
add a column "new_stored_value", fill it in, and place the file back in
this directory.  The migration command will then be updated to read the
CSV and transform values during data migration.

Expected final CSV columns:
    dataset,column_name,shown_value,currently_stored_value,new_stored_value
"""

import csv
import sys

from data.models import Dataset


def _flat_elements(form: dict) -> list[dict]:
    """Return every element and sub-element from form as a flat list."""
    result = []
    for elem in form.get("elements") or []:
        result.append(elem)
        result.extend(elem.get("sub_elements") or [])
    return result


def main():
    writer = csv.writer(sys.stdout, lineterminator="\n")
    writer.writerow(["dataset", "column_name", "shown_value", "currently_stored_value"])

    for dataset in Dataset.objects.order_by("name"):
        form = dataset.form or {}
        elements = _flat_elements(form)

        # Build a map of column_name -> set of stored_values that differ from shown text
        column_mismatches: dict[str, set[str]] = {}
        for elem in elements:
            content = elem.get("content") or {}
            if content.get("type") != "single_column_question":
                continue
            col_name = str(content.get("column") or "")
            if not col_name:
                continue
            stored_values = set()
            for opt in content.get("options") or []:
                text = str(opt.get("text", ""))
                db_value = opt.get("db_value")
                if db_value is None:
                    continue
                db_str = str(db_value)
                if db_str == text:
                    continue
                stored_values.add(db_str)
            if stored_values:
                column_mismatches[col_name] = stored_values

        if not column_mismatches:
            continue

        # Emit rows for every mismatch
        for elem in elements:
            content = elem.get("content") or {}
            if content.get("type") != "single_column_question":
                continue
            col_name = str(content.get("column") or "")
            for opt in content.get("options") or []:
                text = str(opt.get("text", ""))
                db_value = opt.get("db_value")
                if db_value is None:
                    continue
                db_str = str(db_value)
                if db_str == text:
                    continue
                writer.writerow([dataset.name, col_name, text, db_str])


if __name__ == "__main__":
    main()
