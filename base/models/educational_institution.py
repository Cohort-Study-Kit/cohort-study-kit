from django.db import models
from simple_history.models import HistoricalRecords

from .proband import Proband


EDUCATIONAL_INSTITUTION_CHOICES = [
    ("nursery", "Nursery"),
    ("daycare", "Daycare"),
    ("kindergarten", "Kindergarten"),
    ("forest_kindergarten", "Forest kindergarten"),
    ("school", "School"),
    ("after_school_care", "After school care"),
    ("private", "Private"),
    ("boarding_school", "Boarding school"),
    ("workplace", "Workplace"),
    ("club", "Club"),
    ("other", "Other"),
    ("unknown", "Unknown"),
]


class EducationalInstitution(models.Model):
    proband = models.ForeignKey(Proband, on_delete=models.CASCADE)
    name = models.CharField(blank=True, max_length=255)
    type = models.CharField(max_length=255, choices=EDUCATIONAL_INSTITUTION_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    street = models.CharField(max_length=255)
    city = models.CharField(max_length=255)
    province = models.CharField(
        max_length=255,
        blank=True,
    )  # Foreign province, empty if Danish address
    postcode = models.CharField(blank=True, max_length=10)
    country = models.CharField(max_length=22, default="DK")
    phone = models.CharField(blank=True, max_length=72)
    dog = models.BooleanField(null=True)
    cat = models.BooleanField(null=True)
    other_furred_animal = models.BooleanField(null=True)
    comments = models.CharField(blank=True, max_length=1000)
    is_deleted = models.BooleanField(default=False)

    # Django-simple-history package
    history = HistoricalRecords(table_name="zz_base_institution")

    def is_foreign_address(self):
        return self.country != "DK"

    def __str__(self):
        if self.name:
            return f"{self.name}, {self.city}, {self.country}"
        return f"{self.street}, {self.city}, {self.country}  ({self.proband.copsac_id})"


class EducationalInstitutionStats(models.Model):
    institution = models.ForeignKey(
        EducationalInstitution,
        on_delete=models.CASCADE,
        related_name="stats",
    )
    build_year = models.IntegerField(blank=True, null=True)
    room_size = models.IntegerField(blank=True, null=True)
    number_children = models.IntegerField(blank=True, null=True)
    time_spent = models.IntegerField(blank=True, null=True)
    smoking = models.BooleanField(blank=True, null=True)
    number_smokers = models.IntegerField(blank=True, null=True)

    # Django-simple-history package
    history = HistoricalRecords(table_name="zz_base_institution_stats")

    def __str__(self):
        return str(self.institution)

    # Define plural name for EducationalInstitutionStats
    class Meta:
        verbose_name_plural = "Educational Institution Stats"
