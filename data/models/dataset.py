import datetime

from django.conf import settings
from django.db import models
from django.utils.safestring import mark_safe
from django_jsonform.models.fields import JSONField
from django_mysql.models import QuerySet
from simple_history.models import HistoricalRecords

from .examination import Examination


class Dataset(models.Model):
    STATUS_CHOICES = (
        ("none", ""),
        ("committed", "Committed"),
        ("planned", "Planned"),
    )
    STATUS_CHOICES_SCHEMA = {
        "type": "object",
        "keys": {
            choice[0]: {"type": "boolean", "title": choice[1], "default": False}
            for choice in Examination.STATUS_CHOICES
        },
    }
    mtm_visit = models.ManyToManyField(
        "data.VisitType",
        through="data.DatasetVisitTypeRel",
        through_fields=("fk_dataset", "fk_visit_type"),
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        default=None,
        blank=True,
        related_name="author",
        help_text="The person creating the dataset",
    )
    contact_pers = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        default=None,
        blank=True,
        related_name="contact_pers",
        help_text="Contact person(s) for the dataset",
    )
    cohort = models.ForeignKey(
        "base.Cohort",
        on_delete=models.CASCADE,
    )

    # Date
    released = models.DateField("Date of release", null=True, blank=True)
    updated = models.DateTimeField(auto_now=True)

    # Char
    title = models.CharField(
        max_length=255,
        help_text="Title of dataset, human readable, can be changed",
    )

    name = models.SlugField(
        max_length=100,
        unique=True,
        help_text="Name of dataset, slug field, should never change",
    )

    base_project = models.CharField(
        default="",
        max_length=100,
        null=True,
        blank=True,
        help_text="Project in mind when creating dataset",
    )

    tags = models.CharField(
        default="",
        null=True,
        blank=True,
        max_length=1000,
        help_text="Helpful tags for data search",
    )

    status = models.CharField(
        default="none",
        max_length=15,
        help_text="Status of dataset",
        choices=STATUS_CHOICES,
    )

    def default_status_choices():
        return {choice[0]: True for choice in Examination.STATUS_CHOICES}

    status_choices = JSONField(
        schema=STATUS_CHOICES_SCHEMA,
        default=default_status_choices,
    )

    use_finishdate = models.BooleanField(default=True)

    data_schema = models.JSONField(
        default=dict,
        help_text=mark_safe(
            "Read the <a href='https://django-jsonform.readthedocs.io/en/"
            "stable/schema.html' target='_blank'>Schema Guide</a>",
        ),
        blank=True,
    )

    origin = models.CharField(
        default="",
        null=True,
        blank=True,
        max_length=255,
        help_text="Where does the dataset stem from i.e a  research group",
    )

    description = models.CharField(
        default="",
        null=True,
        blank=True,
        max_length=1000,
        help_text="Descripton of explanatory variables",
    )

    implocation = models.CharField(
        default="",
        null=True,
        blank=True,
        max_length=1000,
        help_text="What is this?",
    )

    validation = models.CharField(default="", max_length=1000, null=True, blank=True)
    cleaning = models.CharField(default="", max_length=1000, null=True, blank=True)
    notes = models.CharField(
        default="",
        null=True,
        blank=True,
        max_length=1000,
        help_text="Details to keep in mind using the dataset",
    )

    form = models.JSONField(
        default=dict,
        help_text="Layout and behavior of end user form",
        blank=True,
    )

    # Text
    xtract_sql = models.TextField(
        default="",
        null=True,
        blank=True,
        help_text="SQL code extracting data",
    )

    def __str__(self):
        return self.name

    class Meta:
        ordering = [
            "name",
        ]

    # Django-simple-history package
    history = HistoricalRecords(table_name="zz_data_dataset")


class Column(models.Model):
    objects = QuerySet.as_manager()
    # Foreign Keys
    fk_dataset = models.ForeignKey(
        "data.Dataset",
        on_delete=models.CASCADE,
        null=True,
    )

    display_order = models.IntegerField(
        default=None,
        blank=True,
        null=True,
        help_text="If specified, the order in which the column is displayed in the frontend.",
    )

    # Char
    name = models.SlugField(
        max_length=50,
        help_text="Name of the column, keep the dataset in mind when naming",
    )
    title = models.CharField(
        default="",
        blank=True,
        max_length=50,
        help_text="Human readable name or abbreviation, etc.",
    )
    org_name = models.CharField(
        default="",
        blank=True,
        max_length=100,
        help_text="Original name of data",
    )
    col_format = models.CharField(
        default="",
        blank=True,
        max_length=50,
        help_text="Format of data in given column",
    )
    caption_column = models.CharField(
        default="",
        blank=True,
        max_length=100,
        help_text="Very short description of this column",
    )
    description = models.CharField(
        default="",
        blank=True,
        max_length=1000,
        help_text="Description",
    )
    unit = models.CharField(
        default="",
        blank=True,
        max_length=50,
        help_text="Unit data in column",
    )
    is_meta = models.BooleanField(
        default=None,
        blank=True,
        null=True,
        help_text="Specifies if the data is meta data",
    )

    def __str__(self):
        return self.name.strip() or "[Empty string]"

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["fk_dataset", "name"],
                name="unique_dataset_column",
            ),
        ]

    # Django-simple-history package
    history = HistoricalRecords(table_name="zz_data_column")


class DatasetVisitTypeRel(models.Model):
    fk_dataset = models.ForeignKey(
        "data.Dataset",
        null=True,
        on_delete=models.CASCADE,
    )
    fk_visit_type = models.ForeignKey(
        "data.VisitType",
        null=True,
        on_delete=models.CASCADE,
    )
    fk_helpdoc = models.ForeignKey(
        "data.HelpDoc",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    date = models.DateField(
        default=datetime.date.today,
        blank=True,
        help_text="If date not filled, default value is current date.",
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["fk_dataset", "fk_visit_type"],
                name="unique_dataset_visit_type",
            ),
        ]

    def __str__(self):
        return f"{self.fk_visit_type.name} : {self.fk_dataset.name}"

    history = HistoricalRecords(table_name="zz_data_datasetvisittyperel")
