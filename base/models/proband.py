import datetime

from django.db import models
from simple_history.models import HistoricalRecords

from .helpers import current_year


class Cohort(models.Model):
    name = models.CharField(
        max_length=50,
        unique=True,
        help_text="Popular name of the Cohort",
    )

    year = models.IntegerField(default=current_year)

    def __str__(self):
        return self.name

    # Django-simple-history package
    history = HistoricalRecords(table_name="zz_base_cohort")


class RecruitingCenter(models.Model):
    title = models.CharField(
        default="",
        blank=True,
        max_length=255,
        unique=True,
    )
    number = models.IntegerField(
        default=None,
        blank=True,
        null=True,
    )

    def __str__(self):
        title = self.title.strip() or "[Empty string]"
        return title

    # Django-simple-history package
    history = HistoricalRecords(table_name="zz_base_recruitingcenter")


class Site(models.Model):
    title = models.CharField(
        default="",
        blank=True,
        max_length=255,
        unique=True,
    )

    def __str__(self):
        title = self.title.strip() or "[Empty string]"
        return title

    # Django-simple-history package
    history = HistoricalRecords(table_name="zz_base_site")


SEX_CHOICES = [
    ("m", "Male"),
    ("f", "Female"),
]

RACE_CHOICES = [
    ("c", "Caucasian"),
    ("d", "Non-Caucasian"),
]

STATUS_CHOICES = [
    ("active", "Active"),
    ("passive", "Passive"),
    ("resting", "Resting"),
    ("withdrawn", "Withdrawn before birth"),
]

BIRTHADDRESS_CHOICES = [
    ("urban", "Urban"),
    ("rural", "Rural"),
]

REASON_FOR_WITHDRAWAL_CHOICES = [
    ("", ""),
    ("death", "Death"),
    ("disabling_disease", "Disabling disease"),
    ("emigration", "Emigration"),
    ("no_specified_reason", "No specified reason"),
    ("parental_lack_of_time", "Parental lack of time"),
    ("emotional_distress", "Emotional distress"),
    ("social", "Social"),
    ("unreachable", "Unreachable"),
    ("other_reasons", "Other reasons"),
]


class Proband(models.Model):
    cpr = models.CharField(
        default=None,
        blank=True,
        null=True,
        max_length=10,
    )
    birthdate = models.DateField("Date of birth", default=None, null=True)
    firstname = models.CharField(
        default=None,
        null=True,
        blank=True,
        max_length=255,
        help_text="Name of proband",
    )
    lastname = models.CharField(
        default=None,
        null=True,
        blank=True,
        max_length=255,
        help_text="Name of proband",
    )
    deathdate = models.DateField(
        "Date of death",
        default=None,
        null=True,
        blank=True,
    )
    sex = models.CharField(max_length=1, null=True, choices=SEX_CHOICES)
    race = models.CharField(max_length=1, null=True, choices=RACE_CHOICES)
    status = models.CharField(max_length=9, null=True, choices=STATUS_CHOICES)
    birthaddress = models.CharField(
        max_length=5,
        null=True,
        choices=BIRTHADDRESS_CHOICES,
    )
    reason_for_withdrawal = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        choices=REASON_FOR_WITHDRAWAL_CHOICES,
    )
    passive_data = models.DateField("First day of passivity", null=True, blank=True)
    recruitingcenter = models.ForeignKey(
        RecruitingCenter,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        default=None,
    )
    site = models.ForeignKey(
        Site,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        default=None,
    )
    cohort = models.ForeignKey(
        Cohort,
        on_delete=models.CASCADE,
    )
    copsac_id = models.CharField(
        default=None,
        max_length=50,
        unique=True,
        help_text="The COPSAC ID of the proband",
    )
    reminder = models.TextField(
        default=None,
        null=True,
        blank=True,
    )
    # proband_id is temporary, remove after no longer necessary.
    proband_id = models.CharField(
        default=None,
        max_length=20,
    )
    parents_divorced = models.BooleanField(default=False)
    place_of_living = models.CharField(
        default=None,
        null=True,
        blank=True,
        max_length=50,
    )
    legal_guardian = models.CharField(
        default=None,
        null=True,
        blank=True,
        max_length=50,
    )
    date_of_divorce = models.DateField(
        default=None,
        null=True,
        blank=True,
    )

    def __str__(self):
        return f"{self.name} ({self.copsac_id})"

    @property
    def name(self):
        return f"{self.firstname} {self.lastname}"

    @property
    def formatted_cpr(self):
        return f"{self.cpr[:6]}-{self.cpr[6:]}"

    @property
    def age(self):
        today = datetime.date.today()
        return (
            today.year
            - self.birthdate.year
            - ((today.month, today.day) < (self.birthdate.month, self.birthdate.day))
        )

    # Django-simple-history package
    history = HistoricalRecords(table_name="zz_base_proband")
