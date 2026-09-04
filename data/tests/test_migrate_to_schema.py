"""Tests for the migrate_to_schema management command."""

import json
import lzma
import subprocess
from io import StringIO
from pathlib import Path

from django.core.management import call_command
from django.test import TestCase

from data.models import Cell, Column, Dataset, Examination


class MigrateToSchemaValueMappingTest(TestCase):
    """Test value mapping during and after schema migration."""

    fixtures = ["base/fixtures/test_database.json.xz"]

    def test_value_mapping_reapplied_to_already_migrated_dataset(self):
        """Already-migrated datasets are remapped when --value-mapping is given."""
        dataset = Dataset.objects.get(name="sports_aktiviteter")
        exam = Examination.objects.filter(dataset=dataset).first()
        self.assertIsNotNone(exam)

        # Pre-condition: the local fixture was migrated without value mapping,
        # so sportinschool is still stored as "1" / "0".
        exam.data = {**exam.data, "sportinschool": "1"}
        exam.save(update_fields=["data"])
        dataset.data_schema["properties"]["sportinschool"]["choices"] = ["1", "0"]
        dataset.save(update_fields=["data_schema"])

        out = StringIO()
        err = StringIO()
        call_command(
            "migrate_to_schema",
            "--dataset",
            "sports_aktiviteter",
            "--value-mapping",
            "value_mismatches.csv",
            stdout=out,
            stderr=err,
        )

        self.assertEqual(err.getvalue(), "")
        output = out.getvalue()
        self.assertIn("Remap:", output)
        self.assertIn("committed", output)

        exam.refresh_from_db()
        dataset.refresh_from_db()

        # Stored value should be remapped.
        self.assertEqual(exam.data["sportinschool"], "Yes")

        # Schema choices should be remapped.
        self.assertEqual(
            dataset.data_schema["properties"]["sportinschool"]["choices"],
            ["Yes", "No"],
        )

        # Form conditions should reference the new stored value.
        condition = dataset.form["elements"][0]["sub_elements"][0]["conditions"][0]
        self.assertEqual(condition["code"], 'sportinschool === "No"')

    def test_value_mapping_during_initial_migration(self):
        """Value mapping is applied when migrating a legacy dataset."""
        # Load the unmigrated form from an older fixture commit.
        old_fixture = lzma.decompress(
            subprocess.check_output(
                ["git", "show", "4187c39:base/fixtures/test_database.json.xz"],
                cwd=Path(__file__).resolve().parents[2],
            ),
        )
        data = json.loads(old_fixture)

        old_pk = next(
            item["pk"]
            for item in data
            if item["model"] == "data.dataset"
            and item["fields"]["name"] == "sports_aktiviteter"
        )
        old_form = next(
            item["fields"]["form"]
            for item in data
            if item["model"] == "data.dataset" and item["pk"] == old_pk
        )
        columns_data = [
            item["fields"]
            for item in data
            if item["model"] == "data.column"
            and item["fields"].get("fk_dataset") == old_pk
        ]

        # Re-use an existing proband/visit from the fixture, then remove the
        # already-migrated dataset so we can recreate it in the legacy state
        # using the same name (so the CSV mappings match).
        existing_exam = Examination.objects.filter(
            dataset__name="sports_aktiviteter",
        ).first()
        self.assertIsNotNone(existing_exam)
        visit = existing_exam.visit
        cohort = existing_exam.dataset.cohort
        author = existing_exam.dataset.author
        Dataset.objects.filter(name="sports_aktiviteter").delete()

        dataset = Dataset.objects.create(
            name="sports_aktiviteter",
            title="Sports Aktiviteter",
            cohort=cohort,
            form=old_form,
            data_schema={},
            author=author,
        )

        col_pks = {}
        for col_fields in columns_data:
            col = Column.objects.create(
                dataset=dataset,
                name=col_fields["name"],
                title=col_fields["title"],
                col_format=col_fields["col_format"],
            )
            col_pks[
                next(
                    item["pk"]
                    for item in data
                    if item["model"] == "data.column" and item["fields"] == col_fields
                )
            ] = col

        exam = Examination.objects.create(
            dataset=dataset,
            visit=visit,
            startdate="2023-01-01",
            status="none",
        )
        Cell.objects.create(
            column=col_pks[
                next(
                    item["pk"]
                    for item in data
                    if item["model"] == "data.column"
                    and item["fields"]["name"] == "sportinschool"
                )
            ],
            examination=exam,
            value="1",
        )
        Cell.objects.create(
            column=col_pks[
                next(
                    item["pk"]
                    for item in data
                    if item["model"] == "data.column"
                    and item["fields"]["name"] == "sportperweek"
                )
            ],
            examination=exam,
            value="0",
        )

        out = StringIO()
        err = StringIO()
        try:
            call_command(
                "migrate_to_schema",
                "--dataset",
                "sports_aktiviteter",
                "--value-mapping",
                "value_mismatches.csv",
                stdout=out,
                stderr=err,
            )
        except SystemExit:
            pass

        self.assertEqual(
            err.getvalue(),
            "",
            f"stdout: {out.getvalue()}",
        )
        self.assertIn("committed", out.getvalue())

        exam.refresh_from_db()
        dataset.refresh_from_db()
        self.assertEqual(exam.data["sportinschool"], "Yes")
        self.assertEqual(
            dataset.data_schema["properties"]["sportinschool"]["choices"],
            [["Nej", "Yes"], ["Ja", "No"]],
        )
        # This column maps old stored values 0..6 to 1..7, so a double
        # application would shift the value again (0→1→2) and corrupt the
        # choices list with a duplicate "7".
        self.assertEqual(exam.data["sportperweek"], "1")
        self.assertEqual(
            dataset.data_schema["properties"]["sportperweek"]["choices"],
            ["1", "2", "3", "4", "5", "6", "7"],
        )


class MigrateToSchemaTypeResolutionTest(TestCase):
    """Test schema type resolution for input_question columns."""

    fixtures = ["base/fixtures/test_database.json.xz"]

    def _legacy_element(self, label, content):
        return {"label": label, "content": content, "sub_elements": []}

    def test_input_question_numeric_col_format_wins(self):
        """input_question columns honor numeric col_format; others stay string."""
        existing_exam = Examination.objects.first()
        self.assertIsNotNone(existing_exam)

        form = {
            "elements": [
                self._legacy_element(
                    "Minutes",
                    {
                        "type": "input_question",
                        "column": "minutes_field",
                        "input_type": "text_input",
                    },
                ),
                self._legacy_element(
                    "Ratio",
                    {
                        "type": "input_question",
                        "column": "ratio_field",
                        "input_type": "text_input",
                    },
                ),
                self._legacy_element(
                    "Comment",
                    {
                        "type": "input_question",
                        "column": "comment_field",
                        "input_type": "text_input",
                    },
                ),
                self._legacy_element(
                    "Choice",
                    {
                        "type": "single_column_question",
                        "column": "choice_field",
                        "input_type": "select",
                        "options": [
                            {"text": "Yes", "db_value": "1"},
                            {"text": "No", "db_value": "0"},
                        ],
                    },
                ),
            ],
        }
        dataset = Dataset.objects.create(
            name="type_resolution_test",
            title="Type Resolution Test",
            cohort=existing_exam.dataset.cohort,
            form=form,
            data_schema={},
            author=existing_exam.dataset.author,
        )
        columns = {}
        for name, col_format in [
            ("minutes_field", "NUMBER(10,0)"),
            ("ratio_field", "NUMBER(10,2)"),
            ("comment_field", "VARCHAR2(30)"),
            ("choice_field", "NUMBER(1,0)"),
        ]:
            columns[name] = Column.objects.create(
                dataset=dataset,
                name=name,
                title=name,
                col_format=col_format,
            )

        exam = Examination.objects.create(
            dataset=dataset,
            visit=existing_exam.visit,
            startdate="2023-01-01",
            status="none",
        )
        for name, value in [
            ("minutes_field", "45"),
            ("ratio_field", "1.5"),
            ("comment_field", "hello"),
            ("choice_field", "1"),
        ]:
            Cell.objects.create(
                column=columns[name],
                examination=exam,
                value=value,
            )

        out = StringIO()
        err = StringIO()
        call_command(
            "migrate_to_schema",
            "--dataset",
            "type_resolution_test",
            stdout=out,
            stderr=err,
        )

        self.assertEqual(err.getvalue(), "", f"stdout: {out.getvalue()}")
        self.assertIn("committed", out.getvalue())

        exam.refresh_from_db()
        dataset.refresh_from_db()
        properties = dataset.data_schema["properties"]

        self.assertEqual(properties["minutes_field"]["type"], "integer")
        self.assertEqual(properties["ratio_field"]["type"], "number")
        self.assertEqual(properties["comment_field"]["type"], "string")
        # single_column_question keeps string type even with numeric col_format.
        self.assertEqual(properties["choice_field"]["type"], "string")
        self.assertEqual(
            properties["choice_field"]["choices"],
            [["Yes", "1"], ["No", "0"]],
        )

        self.assertEqual(exam.data["minutes_field"], 45)
        self.assertIsInstance(exam.data["minutes_field"], int)
        self.assertEqual(exam.data["ratio_field"], 1.5)
        self.assertIsInstance(exam.data["ratio_field"], float)
        self.assertEqual(exam.data["comment_field"], "hello")
        self.assertEqual(exam.data["choice_field"], "1")

        # Step 2 should have converted the legacy elements to data_question.
        types = [e["content"]["type"] for e in dataset.form["elements"]]
        self.assertEqual(types, ["data_question"] * 4)
