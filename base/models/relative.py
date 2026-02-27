from django.db import models
from django.urls import reverse
from simple_history.models import HistoricalRecords


# Relative related models


class RelativeTypes(models.TextChoices):
    FATHER = "father", "Father"
    SECOND_FATHER = "second_father", "Second father"
    NON_BIO_FATHER = "non_bio_father", "Non-biological father"
    STEPFATHER = "stepfather", "Stepfather"

    MOTHER = "mother", "Mother"
    SECOND_MOTHER = "second_mother", "Second mother"
    NON_BIO_MOTHER = "non_bio_mother", "Non-biological mother"
    STEPMOTHER = "stepmother", "Stepmother"

    SIBLING = "sibling", "Sibling"
    SAME_FATHER = "same_father", "Half-sibling, same father"
    SAME_MOTHER = "same_mother", "Half-sibling, same mother"
    NON_BIO_SIBLING = "non_bio_sibling", "Non-biological sibling"

    UNKNOWN = "unknown", "Unknown"


class Relative(models.Model):
    # CPR is CharField due to old CPR data in Oracle can be anything of chars
    # But not just numbers. Like "xxxxxxxx - xxxx" or "11.abc.2222"
    # CPR in relative can not be unique, because there is same person registered
    # twice as "relative" to difference probands
    cpr = models.CharField(
        default=None,
        null=True,
        blank=True,
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
    atopic_father = models.BooleanField(
        default=False,
        null=True,
        blank=True,
        help_text="",
    )
    allfood = models.BooleanField(
        default=False,
        null=True,
        blank=True,
        help_text="History of food allergy?",
    )
    allinh = models.BooleanField(
        default=False,
        null=True,
        blank=True,
        help_text="History of inhalant allergy?",
    )
    alliv = models.BooleanField(
        default=False,
        null=True,
        blank=True,
        help_text="History of typeIV allergy?",
    )
    astdoc = models.BooleanField(
        default=False,
        null=True,
        blank=True,
        help_text="Doctor diagnosed asthma?",
    )
    asthist = models.BooleanField(
        default=False,
        null=True,
        blank=True,
        help_text="History of asthmetic symptoms?",
    )
    asthmamedication = models.BooleanField(
        default=False,
        null=True,
        blank=True,
        help_text="Daily asthma medication > 1 year?",
    )
    dermdoctor = models.BooleanField(
        default=False,
        null=True,
        blank=True,
        help_text="Doctor diagnosed Dermatitis?",
    )
    dermhist = models.BooleanField(
        default=False,
        null=True,
        blank=True,
        help_text="History of Dermatitis?",
    )
    dermmed = models.BooleanField(
        default=False,
        null=True,
        blank=True,
        help_text="Ever received medical treatment for Dermatitis?",
    )
    rhindoctor = models.BooleanField(
        default=False,
        null=True,
        blank=True,
        help_text="Doctor diagnosed Rhinitis?",
    )
    rhinhist = models.BooleanField(
        default=False,
        null=True,
        blank=True,
        help_text="History of Rhinitis?",
    )
    rhinmed = models.BooleanField(
        default=False,
        null=True,
        blank=True,
        help_text="Ever received medical treatment for Rhinitis?",
    )
    twin = models.CharField(
        max_length=1,
        null=True,
        blank=True,
        default=None,
        choices=[(None, "None"), ("A", "Twin A"), ("B", "Twin B")],
    )
    comments = models.TextField(default=None, null=True)
    old_rel_id = models.IntegerField(default=None, unique=True, null=True, blank=True)
    relation_type = models.CharField(
        max_length=15,
        choices=RelativeTypes,
        default=RelativeTypes.UNKNOWN,
    )
    fk_proband = models.ForeignKey(
        "base.Proband",
        on_delete=models.CASCADE,
        related_name="Proband",
    )
    lock_status = models.IntegerField(
        default=0,
        help_text="Indicate Quality Status. Locked or Qualitychecks",
        null=True,
        blank=True,
    )
    is_deleted = models.BooleanField(
        default=False,
        help_text="Is this relative deleted?",
    )

    def __str__(self):
        return f"{self.name} ({self.id})"

    @property
    def name(self):
        return f"{self.firstname} {self.lastname}"

    def get_absolute_url(self):
        return reverse("base_Relative_detail", args=(self.pk,))

    def get_update_url(self):
        return reverse("base_Relative_update", args=(self.pk,))

    # Django-simple-history package
    history = HistoricalRecords(table_name="zz_base_relative")
