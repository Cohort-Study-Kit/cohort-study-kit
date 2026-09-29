"""Tests for the check_examination_data_types management command."""

from io import StringIO

from django.core.management import call_command
from django.test import TestCase

from data.models import Dataset, Examination

SCHEMA = {
    "type": "object",
    "properties": {
        "height": {"type": "number", "title": "Height"},
        "count": {"type": "integer", "title": "Count"},
        "label": {"type": "string", "title": "Label"},
        "checked": {"type": "boolean", "title": "Checked"},
        "child": {
            "type": "object",
            "properties": {"weight": {"type": "number"}},
        },
        "tags": {"type": "array", "items": {"type": "string"}},
    },
}


class CheckExaminationDataTypesTest(TestCase):
    """Test the examination data type checker."""

    fixtures = ["base/fixtures/test_database.json.xz"]

    def setUp(self):
        existing_exam = Examination.objects.first()
        self.visit = existing_exam.visit
        self.dataset = Dataset.objects.create(
            name="type_check_test",
            title="Type Check Test",
            cohort=self.visit.proband.cohort,
            data_schema=SCHEMA,
        )

    def _run(self, *args):
        out = StringIO()
        err = StringIO()
        call_command("check_examination_data_types", *args, stdout=out, stderr=err)
        return out.getvalue(), err.getvalue()

    def _create_exam(self, data):
        return Examination.objects.create(
            dataset=self.dataset,
            visit=self.visit,
            startdate="2023-01-01",
            status="none",
            data=data,
        )

    def test_matching_data_reports_nothing(self):
        """Data whose types all match the schema is not reported."""
        self._create_exam(
            {
                "height": 1.75,
                "count": 3,
                "label": "ok",
                "checked": True,
                "child": {"weight": 2.5},
                "tags": ["a", "b"],
            },
        )

        out, err = self._run("--dataset", "type_check_test")
        self.assertEqual(err, "")
        self.assertIn("No type mismatches found", out)

    def test_string_in_number_field_is_reported(self):
        """A string value for a number property is flagged."""
        exam = self._create_exam({"height": "1,75"})

        out, err = self._run("--dataset", "type_check_test")
        self.assertEqual(err, "")
        self.assertIn("1 type mismatch", out)
        self.assertIn(f"Examination {exam.id}", out)
        self.assertIn("height: expected number, got str", out)
        self.assertIn("'1,75'", out)

    def test_empty_string_in_number_field_is_reported(self):
        """An empty string for a number property is flagged."""
        self._create_exam({"height": ""})

        out, err = self._run("--dataset", "type_check_test")
        self.assertIn("height: expected number, got str", out)

    def test_number_in_string_field_is_reported(self):
        """A number value for a string property is flagged."""
        self._create_exam({"label": 12})

        out, err = self._run("--dataset", "type_check_test")
        self.assertIn("label: expected string, got int", out)

    def test_boolean_does_not_count_as_number(self):
        """A boolean is not silently accepted for number or integer fields."""
        self._create_exam({"height": True, "count": False})

        out, err = self._run("--dataset", "type_check_test")
        self.assertIn("height: expected number, got bool", out)
        self.assertIn("count: expected integer, got bool", out)

    def test_float_without_fraction_counts_as_integer(self):
        """A float like 3.0 satisfies an integer field (JSON semantics)."""
        self._create_exam({"count": 3.0})

        out, err = self._run("--dataset", "type_check_test")
        self.assertIn("No type mismatches found", out)

    def test_null_is_accepted_by_default(self):
        """null matches any type unless --strict-null is used."""
        self._create_exam({"height": None, "label": None})

        out, err = self._run("--dataset", "type_check_test")
        self.assertIn("No type mismatches found", out)

        out, err = self._run("--dataset", "type_check_test", "--strict-null")
        self.assertIn("label: expected string, got NoneType", out)
        self.assertIn("height: expected number, got NoneType", out)

    def test_nested_object_mismatch_is_reported(self):
        """Mismatches inside nested properties are found and paths are dotted."""
        self._create_exam({"child": {"weight": "heavy"}})

        out, err = self._run("--dataset", "type_check_test")
        self.assertIn("child.weight: expected number, got str", out)

    def test_array_item_mismatch_is_reported(self):
        """Mismatching array items are reported with their index."""
        self._create_exam({"tags": ["ok", 1.5]})

        out, err = self._run("--dataset", "type_check_test")
        self.assertIn("tags.1: expected string, got float", out)

    def test_wrong_container_type_is_reported(self):
        """A non-dict value for an object property is flagged."""
        self._create_exam({"child": "not a dict"})

        out, err = self._run("--dataset", "type_check_test")
        self.assertIn("child: expected object, got str", out)

    def test_absent_keys_are_not_reported(self):
        """Unanswered questions (missing keys) are not mismatches."""
        self._create_exam({"height": 1.75})

        out, err = self._run("--dataset", "type_check_test")
        self.assertIn("No type mismatches found", out)

    def test_summary_option_prints_totals_only(self):
        """--summary suppresses the per-examination lines."""
        self._create_exam({"height": "1,75", "count": "many"})

        out, err = self._run("--dataset", "type_check_test", "--summary")
        self.assertNotIn("Examination ", out)
        self.assertIn("2 type mismatch(es)", out)
        self.assertIn("height: expected number, got str -- 1x", out)
        self.assertIn("count: expected integer, got str -- 1x", out)

    def test_no_values_option_hides_value_contents(self):
        """--no-values prints locations and types but not the values."""
        exam = self._create_exam({"height": "1,75 secret", "label": 12})

        out, err = self._run("--dataset", "type_check_test", "--no-values")
        self.assertEqual(err, "")
        self.assertIn(f"Examination {exam.id}", out)
        self.assertIn("height: expected number, got str", out)
        self.assertIn("label: expected string, got int", out)
        self.assertNotIn("secret", out)
        self.assertNotIn("1,75", out)

    def test_dataset_without_schema_is_skipped(self):
        """Datasets without a data_schema are not checked."""
        no_schema_dataset = Dataset.objects.create(
            name="no_schema_test",
            title="No Schema",
            cohort=self.visit.proband.cohort,
            data_schema={},
        )
        Examination.objects.create(
            dataset=no_schema_dataset,
            visit=self.visit,
            startdate="2023-01-01",
            status="none",
            data={"anything": [1, 2]},
        )

        out, err = self._run("--dataset", "no_schema_test")
        self.assertIn("No type mismatches found", out)
        self.assertNotIn("anything", out)
