"""Tests for the check_form_schema_properties management command."""

from io import StringIO

from django.core.management import call_command
from django.test import TestCase

from data.models import Dataset


class CheckFormSchemaPropertiesTest(TestCase):
    """Test the form/schema consistency checker."""

    fixtures = ["base/fixtures/test_database.json.xz"]

    def _run(self, *args):
        out = StringIO()
        err = StringIO()
        call_command("check_form_schema_properties", *args, stdout=out, stderr=err)
        return out.getvalue(), err.getvalue()

    def test_valid_form_reports_no_issues(self):
        """A form whose data_question property exists in the schema is clean."""
        dataset = Dataset.objects.get(name="sports_aktiviteter")
        # The fixture should already be migrated; sanity-check the pre-condition.
        self.assertIn("sportinschool", dataset.data_schema.get("properties", {}))

        out, err = self._run("--dataset", "sports_aktiviteter")
        self.assertEqual(err, "")
        self.assertIn("No missing schema properties found", out)

    def test_missing_data_question_property_is_reported(self):
        """A data_question that references a schema property not in the schema is flagged."""
        dataset = Dataset.objects.get(name="sports_aktiviteter")
        dataset.form["elements"].append(
            {
                "label": "Missing prop",
                "content": {"type": "data_question", "property": "does_not_exist"},
                "sub_elements": [],
                "conditions": [],
            },
        )
        dataset.save(update_fields=["form"])

        out, err = self._run("--dataset", "sports_aktiviteter")
        self.assertEqual(err, "")
        self.assertIn("Found 1 issue", out)
        self.assertIn("does_not_exist", out)

    def test_missing_condition_variable_is_reported(self):
        """A condition that uses an unknown simple variable is flagged."""
        dataset = Dataset.objects.get(name="sports_aktiviteter")
        element = dataset.form["elements"][0]
        element["conditions"].append(
            {
                "code": "unknown_var === 1",
                "variables": ["unknown_var"],
            },
        )
        dataset.save(update_fields=["form"])

        out, err = self._run("--dataset", "sports_aktiviteter")
        self.assertEqual(err, "")
        self.assertIn("condition variable", out)
        self.assertIn("unknown_var", out)

    def test_external_value_variables_are_ignored(self):
        """Variables referencing external values (with '$') are not schema properties."""
        dataset = Dataset.objects.get(name="sports_aktiviteter")
        element = dataset.form["elements"][0]
        element["conditions"].append(
            {
                "code": "column$something$else === 1",
                "variables": ["column$something$else"],
            },
        )
        dataset.save(update_fields=["form"])

        out, err = self._run("--dataset", "sports_aktiviteter")
        self.assertEqual(err, "")
        self.assertIn("No missing schema properties found", out)

    def test_show_value_variable_is_checked(self):
        """A show_value element's simple variables are checked against the schema."""
        dataset = Dataset.objects.get(name="sports_aktiviteter")
        dataset.form["elements"].append(
            {
                "label": "Computed",
                "content": {
                    "type": "show_value",
                    "text": "Result",
                    "source": "missing_show === 1",
                    "variables": ["missing_show"],
                },
                "sub_elements": [],
                "conditions": [],
            },
        )
        dataset.save(update_fields=["form"])

        out, err = self._run("--dataset", "sports_aktiviteter")
        self.assertEqual(err, "")
        self.assertIn("show_value variable", out)
        self.assertIn("missing_show", out)

    def test_form_warning_variable_is_checked(self):
        """Form-level warning variables are checked against the schema."""
        dataset = Dataset.objects.get(name="sports_aktiviteter")
        dataset.form.setdefault("warnings", []).append(
            {
                "test": "missing_warn > 0",
                "variables": ["missing_warn"],
            },
        )
        dataset.save(update_fields=["form"])

        out, err = self._run("--dataset", "sports_aktiviteter")
        self.assertEqual(err, "")
        self.assertIn("warning variable", out)
        self.assertIn("missing_warn", out)

    def test_sub_elements_are_checked(self):
        """Nested sub_elements are also validated."""
        dataset = Dataset.objects.get(name="sports_aktiviteter")
        dataset.form["elements"][0]["sub_elements"].append(
            {
                "label": "Nested missing",
                "content": {"type": "data_question", "property": "nested_missing"},
                "conditions": [],
            },
        )
        dataset.save(update_fields=["form"])

        out, err = self._run("--dataset", "sports_aktiviteter")
        self.assertEqual(err, "")
        self.assertIn("nested_missing", out)

    def test_dataset_filter_limits_output(self):
        """The --dataset option restricts the check to a single dataset."""
        # All datasets have some form; the full run in other tests covers them.
        out, err = self._run("--dataset", "sports_aktiviteter")
        self.assertEqual(err, "")
        # Should not mention other datasets.
        self.assertNotIn("[faeces_sample]", out)
        self.assertNotIn("[growth]", out)
