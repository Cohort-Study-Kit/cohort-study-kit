from django.conf import settings
from django.db import models
from simple_history.models import HistoricalRecords


class HelpData(models.Model):
    """This model is not in use in this django app.
    It is a table used by the data managers for their own purposes
    independently from the webapp.
    """

    fk_dataset = models.ForeignKey(
        "data.Dataset",
        on_delete=models.CASCADE,
        default=None,
        null=True,
        blank=True,
    )
    lookup_value = models.CharField(
        max_length=50,
        default="?",
        help_text=(
            "The value your search depends " "on. e.g. drugcode from table dict_drug"
        ),
    )
    col_1 = models.CharField(
        max_length=1000,
        default="?",
        help_text=(
            "Main value-column that corresponds "
            "to the lookup_value, e.g drugname from dict_drug."
        ),
    )
    col_2 = models.CharField(
        max_length=50,
        default="?",
        blank=True,
    )
    old_id = models.CharField(
        max_length=10,
        default="",
        blank=True,
        help_text="The old oracle-database-id of this row",
    )

    def __str__(self):
        return f"{self.lookup_value} {self.col_1}"

    history = HistoricalRecords(table_name="zz_data_helpdata")


class HelpDoc(models.Model):
    title = models.CharField(max_length=255)
    file = models.FileField()
    status = models.CharField(
        default=None,
        max_length=100,
        help_text="Status of SOP",
        null=True,
        blank=True,
    )
    date = models.DateField()
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        default=None,
        blank=True,
        help_text="The person creating the SOP",
    )
    history = HistoricalRecords(table_name="zz_data_helpdoc")
