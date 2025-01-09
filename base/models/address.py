from django.db import models
from simple_history.models import HistoricalRecords

from .proband import Proband

HOME_TYPE_CHOICES = [
    ("apartment", "Apartment"),
    ("farm", "Farm"),
    ("holiday_cottage", "Holiday cottage"),
    ("house", "House"),
    ("terrace_house", "Terrace house"),
]

LIVES_WITH_CHOICES = [
    ("both_parents", "Both parents"),
    ("father", "Father"),
    ("mother", "Mother"),
    ("no_parents", "None of the biological parents"),
]


class Address(models.Model):
    proband = models.ForeignKey(Proband, on_delete=models.CASCADE)
    primary_home = models.BooleanField(default=True)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    home_type = models.CharField(max_length=15, choices=HOME_TYPE_CHOICES)
    street = models.CharField(max_length=255)
    city = models.CharField(max_length=255)
    province = models.CharField(
        max_length=255,
        blank=True,
    )  # Foreign province, empty if Danish address
    country = models.CharField(max_length=22, default="DK")
    postcode = models.CharField(blank=True, max_length=10)
    # TODO: change all phone fields to max 15.
    # Users have added notes to the phone fields.
    phone = models.CharField(blank=True, max_length=72)
    cellphone_proband = models.CharField(blank=True, max_length=72)
    cellphone_father = models.CharField(blank=True, max_length=72)
    cellphone_mother = models.CharField(blank=True, max_length=72)
    workphone1 = models.CharField(blank=True, max_length=72)
    workphone2 = models.CharField(blank=True, max_length=72)
    email_father = models.EmailField(blank=True)
    email_mother = models.EmailField(blank=True)
    abcmailaddress = models.EmailField(blank=True)
    lives_with = models.CharField(max_length=255, choices=LIVES_WITH_CHOICES)
    comments = models.CharField(blank=True, max_length=1000)
    is_deleted = models.BooleanField(default=False)

    # Django-simple-history package
    history = HistoricalRecords(table_name="zz_base_address")

    def is_foreign_address(self):
        return self.country != "DK"

    def __str__(self):
        return f"{self.street}, {self.city}, {self.country} ({self.proband.copsac_id})"

    class Meta:
        verbose_name_plural = "addresses"
