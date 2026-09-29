"""
Management command: check_examination_data_types

Report examination data values whose Python type does not match the type
declared for them in the dataset's ``data_schema`` -- e.g. a string where
the schema says ``number``.

Values whose key is missing from ``Examination.data`` are never reported:
an unanswered question is not stored at all. ``null`` values are accepted
for every type by default, since the form frontend stores a cleared field
as ``null``; pass ``--strict-null`` to report nulls that the schema does
not allow.

Type mapping used for the check (JSON schema -> Python):

* ``string`` -> ``str``
* ``boolean`` -> ``bool``
* ``number`` -> ``int`` or ``float`` (``bool`` does not count)
* ``integer`` -> ``int`` or a ``float`` with no fractional part
* ``object`` -> ``dict``
* ``array`` -> ``list``
* ``null`` -> ``None``

Nested schemas are followed via ``properties``, ``keys`` (dynamic dict keys)
and ``items`` (array items); paths are reported dotted, with ``*`` as the
placeholder for dynamic keys and array indices.

Usage
-----

    # Check every dataset:
    python manage.py check_examination_data_types

    # Check a single dataset:
    python manage.py check_examination_data_types --dataset skin_prick_test

    # Only print totals, not every individual mismatch:
    python manage.py check_examination_data_types --summary

    # Also report null values where the schema does not allow them:
    python manage.py check_examination_data_types --strict-null

    # Omit the mismatching values themselves (only types and locations), so
    # the output is safe to share without confidentiality settings:
    python manage.py check_examination_data_types --no-values
"""

from collections import Counter

from django.core.management.base import BaseCommand

from data.models import Dataset, Examination

TYPE_CHECKS = {
    "string": lambda value: isinstance(value, str),
    "boolean": lambda value: isinstance(value, bool),
    "number": lambda value: isinstance(value, (int, float))
    and not isinstance(value, bool),
    "integer": lambda value: (
        (isinstance(value, int) and not isinstance(value, bool))
        or (isinstance(value, float) and value.is_integer())
    ),
    "object": lambda value: isinstance(value, dict),
    "array": lambda value: isinstance(value, list),
    "null": lambda value: value is None,
}


def _schema_types(schema):
    types = schema.get("type") or []
    if isinstance(types, str):
        types = [types]
    return types


def _matches(value, types):
    known = [t for t in types if t in TYPE_CHECKS]
    if not known:
        # Schema puts no known type restriction on this value.
        return True
    return any(TYPE_CHECKS[t](value) for t in known)


class DataTypeChecker:
    """Walk a data schema alongside examination data, collecting mismatches.

    Each mismatch is a ``(path, expected_types, value)`` tuple, where
    ``path`` is a dotted property path (``*`` marks dynamic dict keys and
    array indices).
    """

    def __init__(self, strict_null=False):
        self.strict_null = strict_null
        self.mismatches = []

    def check(self, data, schema):
        """Return the list of mismatches for one examination's data."""
        self.mismatches = []
        if isinstance(data, dict):
            self._check_node(data, schema or {}, "")
        return self.mismatches

    def _check_node(self, value, schema, path):
        if value is None:
            if self.strict_null and "null" not in _schema_types(schema):
                self.mismatches.append((path, _schema_types(schema), value))
            return

        properties = schema.get("properties")
        keys = schema.get("keys")
        items = schema.get("items")
        if (
            isinstance(properties, dict)
            or isinstance(keys, dict)
            or isinstance(items, dict)
        ):
            self._check_container(value, schema, path)
            return

        types = _schema_types(schema)
        if types and not _matches(value, types):
            self.mismatches.append((path, types, value))

    def _check_container(self, value, schema, path):
        types = _schema_types(schema)
        properties = schema.get("properties")
        keys = schema.get("keys")
        items = schema.get("items")

        if (
            isinstance(items, dict)
            and not isinstance(properties, dict)
            and not isinstance(keys, dict)
        ):
            if not isinstance(value, list):
                self.mismatches.append((path, types, value))
                return
            for index, item in enumerate(value):
                self._check_node(item, items, f"{path}.{index}" if path else str(index))
            return

        if not isinstance(value, dict):
            self.mismatches.append((path, types, value))
            return

        if isinstance(properties, dict):
            for name, sub_schema in properties.items():
                if name in value:
                    child_path = f"{path}.{name}" if path else name
                    self._check_node(value[name], sub_schema or {}, child_path)
        if isinstance(keys, dict):
            for name in value:
                child_path = f"{path}.{name}" if path else name
                self._check_node(value[name], keys, child_path)


class Command(BaseCommand):
    help = "Report examination values that do not match their data_schema type."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dataset",
            type=str,
            default=None,
            help="Only check the dataset with this name.",
        )
        parser.add_argument(
            "--summary",
            action="store_true",
            help="Only print totals, not each individual mismatch.",
        )
        parser.add_argument(
            "--strict-null",
            action="store_true",
            help="Also report null values where the schema does not allow null.",
        )
        parser.add_argument(
            "--no-values",
            action="store_true",
            help=(
                "Do not print the mismatching values themselves, only their "
                "types -- the output stays free of participant data."
            ),
        )

    def handle(self, *args, **options):
        datasets = Dataset.objects.all()
        if options["dataset"]:
            datasets = datasets.filter(name=options["dataset"])

        schemas = {
            dataset.pk: (dataset.name, dataset.data_schema)
            for dataset in datasets
            if dataset.data_schema
        }

        checker = DataTypeChecker(strict_null=options["strict_null"])
        counter = Counter()
        exams_with_mismatches = set()
        examined = 0

        for exam in (
            Examination.objects.filter(dataset__in=schemas)
            .only("id", "data", "dataset_id", "visit_id", "is_deleted")
            .iterator()
        ):
            examined += 1
            dataset_name, schema = schemas[exam.dataset_id]
            mismatches = checker.check(exam.data, schema)
            if not mismatches:
                continue
            exams_with_mismatches.add(exam.id)
            prefix = (
                f"Examination {exam.id} (visit {exam.visit_id}, "
                f"dataset {dataset_name!r})"
            )
            if exam.is_deleted:
                prefix += " [deleted]"
            for path, types, value in mismatches:
                expected = " or ".join(types) if types else "any"
                counter[(dataset_name, path, expected, type(value).__name__)] += 1
                if options["summary"]:
                    continue
                if options["no_values"]:
                    detail = ""
                else:
                    detail = f": {repr(value)[:80]}"
                self.stdout.write(
                    f"{prefix}: {path}: expected {expected}, "
                    f"got {type(value).__name__}{detail}",
                )

        if counter:
            total = sum(counter.values())
            self.stdout.write(
                self.style.WARNING(
                    f"\n{total} type mismatch(es) in {len(exams_with_mismatches)} "
                    f"of {examined} examinations checked:",
                ),
            )
            for (dataset, path, expected, got), count in counter.most_common():
                self.stdout.write(
                    f"  [{dataset}] {path}: expected {expected}, "
                    f"got {got} -- {count}x",
                )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f"No type mismatches found in {examined} examinations.",
                ),
            )
