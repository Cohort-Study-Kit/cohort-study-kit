"""
Management command: check_form_schema_properties

Verify that every dataset form only refers to properties that actually exist
in ``Dataset.data_schema``.

Checks:

* ``data_question`` elements -- ``content.property`` must be a schema key.
* ``show_value`` elements -- every simple variable in ``content.variables``
  (i.e. variables that are not external values such as ``column$...``) must be
  a schema key.
* Element conditions -- every simple variable in ``condition.variables`` must
  be a schema key.
* Form-level warnings -- every simple variable in ``warning.variables`` must
  be a schema key.
* Legacy element types (``input_question``, ``single_column_question``,
  ``multi_column_question``) are also reported when their column/option column
  is not present in the schema, which helps catch forms that were only
  partially migrated.

Usage
-----

    # Check every dataset:
    python manage.py check_form_schema_properties

    # Check a single dataset:
    python manage.py check_form_schema_properties --dataset sports_aktiviteter
"""

from django.core.management.base import BaseCommand

from data.models import Dataset


def _flat_elements(form):
    """Return every element and sub-element from *form* as a flat list."""
    result = []
    for elem in form.get("elements") or []:
        result.append(elem)
        result.extend(elem.get("sub_elements") or [])
    return result


def _is_simple_variable(variable):
    """Return True for plain property names, False for external-value refs."""
    return "$" not in variable


class Command(BaseCommand):
    help = (
        "Check that every form element refers to an existing data_schema " "property."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--dataset",
            type=str,
            default=None,
            help="Only check the dataset with this name.",
        )

    def handle(self, *args, **options):
        datasets = Dataset.objects.all()
        if options["dataset"]:
            datasets = datasets.filter(name=options["dataset"])

        issues = []
        for dataset in datasets:
            schema_properties = (dataset.data_schema or {}).get("properties") or {}
            form = dataset.form or {}

            if not schema_properties and form.get("elements"):
                issues.append(
                    {
                        "dataset": dataset.name,
                        "label": "",
                        "type": "",
                        "missing": "",
                        "context": "Dataset has form elements but no data_schema properties",
                    },
                )

            for element in _flat_elements(form):
                content = element.get("content") or {}
                elem_type = content.get("type")
                label = element.get("label", "") or ""

                if elem_type == "data_question":
                    prop = content.get("property")
                    if prop and prop not in schema_properties:
                        issues.append(
                            {
                                "dataset": dataset.name,
                                "label": label,
                                "type": elem_type,
                                "missing": prop,
                                "context": "property",
                            },
                        )
                elif elem_type in ("input_question", "single_column_question"):
                    col = content.get("column")
                    if col and col not in schema_properties:
                        issues.append(
                            {
                                "dataset": dataset.name,
                                "label": label,
                                "type": elem_type,
                                "missing": col,
                                "context": "column (legacy)",
                            },
                        )
                elif elem_type == "multi_column_question":
                    for opt in content.get("options") or []:
                        col = opt.get("column")
                        if col and col not in schema_properties:
                            issues.append(
                                {
                                    "dataset": dataset.name,
                                    "label": label,
                                    "type": elem_type,
                                    "missing": col,
                                    "context": "option column (legacy)",
                                },
                            )
                elif elem_type == "show_value":
                    for var in content.get("variables") or []:
                        if _is_simple_variable(var) and var not in schema_properties:
                            issues.append(
                                {
                                    "dataset": dataset.name,
                                    "label": label,
                                    "type": elem_type,
                                    "missing": var,
                                    "context": "show_value variable",
                                },
                            )

                # Element-level conditions.
                for cond in element.get("conditions") or []:
                    for var in cond.get("variables") or []:
                        if _is_simple_variable(var) and var not in schema_properties:
                            issues.append(
                                {
                                    "dataset": dataset.name,
                                    "label": label,
                                    "type": elem_type,
                                    "missing": var,
                                    "context": "condition variable",
                                },
                            )

            # Form-level warnings.
            for warning in form.get("warnings") or []:
                for var in warning.get("variables") or []:
                    if _is_simple_variable(var) and var not in schema_properties:
                        issues.append(
                            {
                                "dataset": dataset.name,
                                "label": "(form warning)",
                                "type": "warning",
                                "missing": var,
                                "context": "warning variable",
                            },
                        )

        if issues:
            self.stdout.write(
                self.style.WARNING(
                    f"Found {len(issues)} issue(s) across checked datasets:",
                ),
            )
            for issue in issues:
                if issue["missing"]:
                    self.stdout.write(
                        f'  [{issue["dataset"]}] {issue["context"]}: '
                        f'"{issue["missing"]}" '
                        f'(element type: {issue["type"]}, '
                        f'label: {issue["label"]})',
                    )
                else:
                    self.stdout.write(f'  [{issue["dataset"]}] {issue["context"]}')
        else:
            self.stdout.write(self.style.SUCCESS("No missing schema properties found."))
