import datetime

from django.db import models
from django.db.models import UniqueConstraint
from simple_history.models import HistoricalRecords

# Consent related models


class ConsentType(models.Model):
    name = models.CharField(max_length=61)
    cohort = models.ForeignKey(
        "base.Cohort",
        on_delete=models.CASCADE,
    )
    history = HistoricalRecords(table_name="zz_base_consenttype")

    def __str__(self):
        return self.name

    class Meta:
        constraints = [
            UniqueConstraint(fields=["name", "cohort"], name="unique_consent_type"),
        ]


class Consent(models.Model):
    STATUS_CHOICES = (
        ("none", ""),
        ("completed", "Completed"),
        ("ongoing", "Ongoing"),
        ("rejected", "Rejected"),
    )
    date = models.DateField(
        default=datetime.date.today,
        null=True,
        blank=True,
        help_text="Date consent was given",
    )
    applied_date = models.DateField(
        null=True,
        blank=True,
        help_text="Date from when consent was applied",
    )
    withdrawn_date = models.DateField(
        null=True,
        blank=True,
        help_text="Date from when consent was withdrawn (if at all)",
    )
    is_deleted = models.BooleanField(default=False)
    comments = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=9, choices=STATUS_CHOICES)
    fk_consent_type = models.ForeignKey(
        "base.ConsentType",
        on_delete=models.CASCADE,
    )
    fk_proband = models.ForeignKey(
        "base.Proband",
        on_delete=models.CASCADE,
    )
    history = HistoricalRecords(table_name="zz_base_consent")

    def __str__(self):
        return f"{self.fk_proband.firstname} {self.fk_proband.lastname}, {self.fk_consent_type.name}"

    class Meta:
        constraints = [
            UniqueConstraint(
                fields=["fk_consent_type", "fk_proband"],
                name="unique_consent",
            ),
        ]
