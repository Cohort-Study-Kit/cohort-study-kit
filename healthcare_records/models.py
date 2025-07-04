from django.db import models
from simple_history.models import HistoricalRecords

# Related to diagnosis


class ICDCode(models.Model):
    code = models.CharField(max_length=10, unique=True)
    description = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.code} - {self.description}"

    # Django-simple-history package
    history = HistoricalRecords(table_name="zz_healthcare_records_icdcode")

    class Meta:
        verbose_name_plural = "ICD Codes"
        verbose_name = "ICD Code"


MEDICAL_ATTENTION_CHOICES = [
    ("", ""),
    ("not_attended", "Not attended"),
    ("private_physician", "Private physician"),
    ("emergency_doctor", "Emergency doctor"),
    ("casualty_department", "Casualty department"),
    ("pedriatric_admission_ward", "Pedriatric admission ward"),
    ("hospitalized", "Hospitalized"),
    ("abc_clinic", "ABC Clinic"),
    ("day_clinic", "Day clinic"),
    ("other", "Other"),
]

INTENSITY_CHOICES = [
    ("", ""),
    ("mild", "Mild"),
    ("moderate", "Moderate"),
    ("serious", "Serious"),
]

ACTION_CHOICES = [
    ("", ""),
    ("no_action", "No action"),
    ("dose_changed", "Dose changed"),
    ("temporarily_stopped", "Temporarily stopped"),
    ("stopped", "Stopped"),
    ("other", "Other"),
]

CAUSALITY_CHOICES = [
    ("", ""),
    ("not_applicable", "Not applicable"),
    ("probably", "Probably"),
    ("possibly", "Possibly"),
    ("unlikely", "Unlikely"),
]

LOCK_STATUS_CHOICES = [
    ("unlocked", "Unlocked"),
    ("locked", "Locked"),
    ("validated", "Validated"),
]


class Diagnosis(models.Model):
    proband = models.ForeignKey("base.Proband", on_delete=models.CASCADE)
    recipient = models.CharField(
        blank=False,
        choices=[("proband", "Proband"), ("mother", "Mother of proband")],
        max_length=7,
        default="proband",
    )
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    icd_code = models.ForeignKey(ICDCode, on_delete=models.CASCADE)
    is_chronic = models.BooleanField(default=False)
    medical_attention = models.CharField(
        blank=True,
        max_length=255,
        choices=MEDICAL_ATTENTION_CHOICES,
    )
    adverse_event = models.BooleanField(default=False)
    intensity = models.CharField(blank=True, max_length=255, choices=INTENSITY_CHOICES)
    action = models.CharField(blank=True, max_length=255, choices=ACTION_CHOICES)
    causality_dvitamin = models.CharField(
        blank=True,
        max_length=255,
        choices=CAUSALITY_CHOICES,
    )
    causality_h1n1 = models.CharField(
        blank=True,
        max_length=255,
        choices=CAUSALITY_CHOICES,
    )
    causality_antibiotics = models.CharField(
        blank=True,
        max_length=255,
        choices=CAUSALITY_CHOICES,
    )
    comments = models.CharField(blank=True, max_length=1000)

    lock_status = models.CharField(
        default="unlocked",
        choices=LOCK_STATUS_CHOICES,
        max_length=9,
    )
    is_deleted = models.BooleanField(default=False)

    # Django-simple-history package
    history = HistoricalRecords(table_name="zz_healthcare_records_diagnosis")

    def __str__(self):
        return f"{self.proband} - {self.icd_code} - {self.start_date}"

    class Meta:
        verbose_name_plural = "Diagnoses"


# Related to medication


class ATCCode(models.Model):
    code = models.CharField(max_length=16)
    description = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.code} - {self.description}"

    # Django-simple-history package
    history = HistoricalRecords(table_name="zz_healthcare_records_atccode")

    class Meta:
        verbose_name_plural = "ATC Codes"
        verbose_name = "ATC Code"


ORDINATION_COMMENT_CHOICES = [
    ("", ""),
    ("initiated_by_parents", "Initiated by parents"),
    ("initiated_by_external_physician", "Initiated by physicians outside COPSAC"),
    ("continued_past_ordination_by_parents", "Continued past ordination by parents"),
    ("prematurely_stopped_by_parents", "Prematurely stopped by parents"),
    (
        "prematurely_stopped_due_to_changes_in_algorithm",
        "Prematurely stopped due to changes in algorithm. Needs to pause.",
    ),
]

PERIOD_CHOICES = [
    ("", ""),
    ("day", "Day"),
    ("week", "Week"),
    ("month", "Month"),
]

FREQ_CHOICES = [
    ("", ""),
    ("prn", "Pro re nata"),
    ("1", "1"),
    ("2", "2"),
    ("3", "3"),
    ("4", "4"),
    ("5", "5"),
    ("6", "6"),
    ("7", "7"),
    ("8", "8"),
    ("9", "9"),
    ("10", "10"),
    ("11", "11"),
    ("12", "12"),
    ("13", "13"),
    ("14", "14"),
    ("15", "15"),
    ("16", "16"),
    ("17", "17"),
    ("18", "18"),
    ("19", "19"),
    ("20", "20"),
    ("21", "21"),
    ("22", "22"),
    ("23", "23"),
    ("24", "24"),
]

ROUTE_CHOICES = [
    ("", ""),
    ("nasal", "Nasal"),
    ("vaginal", "Vaginal"),
    ("oral", "Oral"),
    ("cutaneous", "Cutaneous"),
    ("oromucusal", "Oromucusal"),
    ("intravenous", "Intravenous"),
    ("inhaled", "Inhaled"),
    ("ocular", "Ocular"),
    ("intramuscular", "Intramuscular"),
    ("auricular", "Auricular"),
    ("rectal", "Rectal"),
    ("subcutaneous", "Subcutaneous"),
    ("not_applicable", "Not applicable"),
]

ROUTE_SPEC_CHOICES = [
    ("", ""),
    ("pmdi", "pMDI"),
    ("nebulized", "Nebulized"),
    ("turbohaler", "Turbohaler"),
    ("easyhaler", "Easyhaler"),
    ("autohaler", "Autohaler"),
]

UNIT_CHOICES = [
    ("", ""),
    ("g", "g"),
    ("mg", "mg"),
    ("mcg", "mcg"),
    ("ml", "ml"),
    ("U", "U"),
    ("mcmol", "mcmol"),
]


class Medication(models.Model):
    proband = models.ForeignKey("base.Proband", on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    atc_code = models.ForeignKey(ATCCode, on_delete=models.CASCADE)
    ordination_comment = models.CharField(
        blank=True,
        max_length=255,
        choices=ORDINATION_COMMENT_CHOICES,
    )
    pn = models.BooleanField(default=False)
    period = models.CharField(blank=True, max_length=255, choices=PERIOD_CHOICES)
    frequency = models.CharField(blank=True, max_length=255, choices=FREQ_CHOICES)
    route = models.CharField(blank=True, max_length=255, choices=ROUTE_CHOICES)
    route_spec = models.CharField(
        blank=True,
        max_length=255,
        choices=ROUTE_SPEC_CHOICES,
    )
    recipient = models.CharField(
        blank=False,
        choices=[("proband", "Proband"), ("mother", "Mother of proband")],
        max_length=7,
        default="proband",
    )
    unit = models.CharField(blank=True, max_length=255, choices=UNIT_CHOICES)
    dose = models.CharField(blank=True, null=True, max_length=255)
    comments = models.CharField(blank=True, max_length=1000)
    lock_status = models.CharField(
        default="unlocked",
        choices=LOCK_STATUS_CHOICES,
        max_length=9,
    )
    is_deleted = models.BooleanField(default=False)

    # Django-simple-history package
    history = HistoricalRecords(table_name="zz_healthcare_records_medication")

    def __str__(self):
        return f"{self.proband} - {self.atc_code} - {self.start_date}"
