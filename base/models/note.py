import datetime

from django.db import models
from simple_history.models import HistoricalRecords


# Proband notes related models


class Note(models.Model):
    class Meta:
        ordering = ["-date"]

    fk_proband = models.ForeignKey(
        "base.Proband",
        on_delete=models.CASCADE,
    )
    date = models.DateField("Date of note", default=datetime.date.today)
    note = models.TextField(default="")
    is_deleted = models.BooleanField(
        default=False,
        help_text="Indicate whether this data should be deleted.",
    )

    def __str__(self):
        return f"{str(self.fk_proband)} {self.date}"

    history = HistoricalRecords(table_name="zz_base_probandnote")
