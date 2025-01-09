from django.contrib import admin

from config.backoffice import backoffice
from healthcare_records.models import ATCCode
from healthcare_records.models import Diagnosis
from healthcare_records.models import ICDCode
from healthcare_records.models import Medication


@admin.register(Diagnosis)
class DiagnosisAdmin(admin.ModelAdmin):
    list_display = ["proband", "start_date", "end_date", "icd_code"]
    search_fields = ["proband__copsac_id", "icd_code__code", "icd_code__description"]
    list_filter = ["is_chronic", "adverse_event", "is_deleted"]
    date_hierarchy = "start_date"
    actions = ["mark_as_deleted"]

    @admin.action(
        description="Mark selected diagnoses as deleted",
    )
    def mark_as_deleted(self, request, queryset):
        queryset.update(is_deleted=True)


backoffice.register(Diagnosis, DiagnosisAdmin)


@admin.register(ICDCode)
class ICDCodeAdmin(admin.ModelAdmin):
    list_display = ["code", "description"]
    search_fields = ["code", "description"]


backoffice.register(ICDCode, ICDCodeAdmin)


@admin.register(ATCCode)
class ATCCodeAdmin(admin.ModelAdmin):
    list_display = ["code", "description"]
    search_fields = ["code", "description"]


backoffice.register(ATCCode, ATCCodeAdmin)


@admin.register(Medication)
class MedicationAdmin(admin.ModelAdmin):
    list_display = ["atc_code", "proband", "start_date", "end_date"]
    search_fields = ["atc_code__code", "proband__copsac_id"]
    list_filter = ["is_deleted"]
    actions = ["mark_as_deleted"]

    @admin.action(
        description="Mark selected medications as deleted",
    )
    def mark_as_deleted(self, request, queryset):
        queryset.update(is_deleted=True)


backoffice.register(Medication, MedicationAdmin)
