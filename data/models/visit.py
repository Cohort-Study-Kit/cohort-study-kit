from django.db import models
from django.urls import reverse
from simple_history.models import HistoricalRecords


class VisitType(models.Model):
    STATUS_CHOICES = (
        ("none", ""),
        ("completed", "Completed"),
        ("committed", "Committed"),
        ("planned", "Planned"),
    )

    class Meta:
        ordering = ["-year", "-month", "-days", "name"]

    name = models.CharField(
        default=None,
        max_length=50,
        help_text="Name of visit",
    )
    comments = models.CharField(
        default=None,
        max_length=200,
        help_text="Helpful comments regarding this visit",
        null=True,
        blank=True,
    )
    status = models.CharField(
        default="none",
        max_length=15,
        help_text="Status of visit",
        choices=STATUS_CHOICES,
    )
    cohort = models.ForeignKey(
        "base.Cohort",
        on_delete=models.CASCADE,
    )

    # Integer
    # Currently used for sorting, maybe not needed?
    year = models.IntegerField(
        default=None,
        null=True,
        blank=True,
    )
    month = models.IntegerField(
        default=None,
        null=True,
        blank=True,
    )
    days = models.IntegerField(
        default=None,
        null=True,
        blank=True,
    )

    # Bool
    adhoc = models.BooleanField(
        default=0,
        help_text="True if this visit was Ad Hoc",
    )

    def __str__(self):
        return self.name

    history = HistoricalRecords(table_name="zz_data_visittype")


class Visit(models.Model):
    STATUS_CHOICES = (
        ("none", ""),
        ("completed", "Completed"),
        ("planned", "Planned"),
        ("unavailable", "Unavailable"),
    )

    class Meta:
        ordering = ["fk_visit_type__id", "visit_date"]
        indexes = [
            models.Index(fields=["id"]),
        ]

    fk_proband = models.ForeignKey(
        "base.Proband",
        on_delete=models.CASCADE,
        default=None,
        null=True,
        blank=True,
    )
    fk_visit_type = models.ForeignKey(
        "data.VisitType",
        related_name="PrimaryVisitType",
        on_delete=models.CASCADE,
        default=None,
        null=True,
        blank=True,
    )
    fk_secondary_visit_type = models.ForeignKey(
        "data.VisitType",
        related_name="SecondaryVisitType",
        on_delete=models.CASCADE,
        default=None,
        null=True,
        blank=True,
    )
    is_deleted = models.BooleanField(
        default=False,
        help_text="Indicate whether this data has been or should be deleted.",
        null=True,
        blank=True,
    )
    old_pvid = models.IntegerField(
        default=None,
        help_text="Old id number will be deleted",
        null=True,
        blank=True,
    )
    status = models.CharField(
        default="none",
        db_index=True,
        max_length=15,
        choices=STATUS_CHOICES,
    )
    comments = models.CharField(
        default="",
        db_index=True,
        max_length=1000,
        blank=True,
    )
    visit_date = models.DateField(
        default=None,
        null=True,
        blank=True,
    )

    def __str__(self):
        return f"{self.fk_visit_type.name} ({self.fk_proband})"

    def get_absolute_url(self):
        return reverse("data_Visit_detail", args=(self.pk,))

    def get_update_url(self):
        return reverse("data_Visit_update", args=(self.pk,))

    history = HistoricalRecords(table_name="zz_data_visit")
