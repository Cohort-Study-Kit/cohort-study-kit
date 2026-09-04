"""Tests for the get_cells overview view (data.views.cell)."""

from django.test import TestCase
from django.urls import reverse

from user.models import User

from ..models import Dataset, Examination


class GetCellsOverviewTest(TestCase):
    """The proband overview table honours the schema "x-hidden" flag."""

    fixtures = ["base/fixtures/test_database.json.xz"]

    def setUp(self):
        self.user = User.objects.create_user(
            username="overview_user",
            password="secret",
        )
        self.client.force_login(self.user)
        existing_exam = Examination.objects.first()
        self.assertIsNotNone(existing_exam)
        self.proband = existing_exam.visit.proband
        self.visit = existing_exam.visit

    def test_x_hidden_property_excluded_from_overview(self):
        dataset = Dataset.objects.create(
            name="overview_test",
            title="Overview Test",
            cohort=self.proband.cohort,
            data_schema={
                "type": "object",
                "properties": {
                    "visible_field": {"type": "string", "title": "Visible"},
                    "hidden_field": {
                        "type": "string",
                        "title": "Hidden",
                        "x-hidden": True,
                    },
                },
            },
        )
        Examination.objects.create(
            dataset=dataset,
            visit=self.visit,
            startdate="2023-01-01",
            status="none",
            data={"visible_field": "yes", "hidden_field": "no"},
        )

        response = self.client.get(
            reverse(
                "data:get_cells",
                args=[self.proband.copsac_id, "overview_test"],
            ),
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("Visible", payload["headings"])
        self.assertNotIn("Hidden", payload["headings"])
        visible_index = payload["headings"].index("Visible")
        self.assertEqual(
            [row[visible_index] for row in payload["data"]],
            ["yes"],
        )
        # The hidden value must not leak into any cell either.
        self.assertNotIn("no", [cell for row in payload["data"] for cell in row])
