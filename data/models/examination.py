from django.db import models
from django.db.models import UniqueConstraint
from django.urls import reverse
from django_jsonform.models.fields import JSONField
from simple_history.models import HistoricalRecords


class LockStatusChoices(models.IntegerChoices):
    OPEN = 0
    LOCKED = 1
    VALIDATION = 2


class Examination(models.Model):
    STATUS_CHOICES = (  # All options, enforced at db level
        ("none", ""),
        ("completed", "Completed"),
        ("planned", "Planned"),
        ("incomplete", "Incomplete"),
        ("not_applicable", "Not applicable"),
        ("ongoing", "Ongoing"),
        ("not_done", "Not done"),
        ("unavailable", "Unavailable"),
        ("defective", "Defective"),
    )

    def get_status_choices(self):  # Options based on restrictions set in dataset table
        if not self.fk_dataset:
            return self.STATUS_CHOICES
        return tuple(
            filter(
                lambda choice: self.fk_dataset.status_choices[choice[0]],
                self.STATUS_CHOICES,
            ),
        )

    fk_dataset = models.ForeignKey(
        "data.Dataset",
        on_delete=models.CASCADE,
        default=None,
        null=True,
        blank=True,
    )

    lock_status = models.IntegerField(
        default=LockStatusChoices.OPEN,
        help_text="Indicate Quality Status. Locked or Qualitychecks",
        null=True,
        blank=True,
        choices=LockStatusChoices,
    )

    is_deleted = models.BooleanField(
        default=False,
        help_text="Indicate whether this data has been or should be deleted.",
        null=True,
        blank=True,
    )
    startdate = models.DateField(
        "Start date",
        default=None,
        db_index=True,
        null=True,
        blank=True,
    )

    finishdate = models.DateField(
        "Finish date",
        default=None,
        blank=True,
        null=True,
    )
    comments = models.CharField(
        default="",
        blank=True,
        db_index=True,
        max_length=1000,
    )
    exceptional_values = models.BooleanField(
        default=False,
    )

    @property
    def readonly(self):
        return self.lock_status == LockStatusChoices.LOCKED

    class Meta:
        ordering = ["-fk_visit__id"]
        indexes = [
            models.Index(fields=["fk_visit"]),
        ]

    fk_visit = models.ForeignKey(
        "data.Visit",
        on_delete=models.CASCADE,
        default=None,
    )

    data = JSONField(
        schema=lambda instance=None: (
            instance.fk_dataset.data_schema
            if instance
            and hasattr(instance, "fk_dataset")
            and instance.fk_dataset
            and bool(instance.fk_dataset.data_schema)
            else {"type": "object", "properties": {}}
        ),
        blank=True,
        default=dict,
    )

    status = models.CharField(
        default="none",
        db_index=True,
        max_length=15,
        choices=STATUS_CHOICES,
    )

    old_peid = models.IntegerField(
        default=None,
        help_text="Old id number will be deleted",
        null=True,
        blank=True,
    )

    def __str__(self):
        return f"{self.fk_visit} - {self.fk_dataset}"

    def get_absolute_url(self):
        return reverse("data:examination-form", args=(self.pk,))

    history = HistoricalRecords(table_name="zz_data_examination")


class Cell(models.Model):
    # Foreign Keys
    fk_column = models.ForeignKey(
        "data.Column",
        on_delete=models.CASCADE,
        default=None,
        db_index=True,
    )

    value = models.CharField(
        default="",
        db_index=True,
        blank=True,
        max_length=2000,
    )

    fk_examination = models.ForeignKey(
        "data.Examination",
        on_delete=models.CASCADE,
        default=None,
        db_index=True,
    )

    def __str__(self):
        return f"{self.fk_column.name}: {self.value}"

    class Meta:
        ordering = ["fk_examination"]
        constraints = [
            UniqueConstraint(
                fields=["fk_column", "fk_examination"],
                name="unique_column_and_examination",
            ),
        ]
        indexes = [
            models.Index(
                fields=["fk_column", "fk_examination"],
                name="main_datapoint",
            ),
        ]

    history = HistoricalRecords(table_name="zz_data_cell")
