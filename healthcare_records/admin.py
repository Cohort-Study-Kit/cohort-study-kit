from django.contrib import admin

from base.admin_filters import ProbandFilter
from base.admin_mixins import SoftDeleteAdminMixin
from base.admin_pagination import AdminDynPaginationMixin
from base.backoffice_admin_mixins import BackOfficeAdminMixin
from config.backoffice import backoffice
from healthcare_records.models import ATCCode
from healthcare_records.models import Diagnosis
from healthcare_records.models import ICDCode
from healthcare_records.models import Medication


@admin.register(Diagnosis)
class DiagnosisAdmin(AdminDynPaginationMixin, SoftDeleteAdminMixin, admin.ModelAdmin):
    list_display = [
        "proband",
        "start_date",
        "end_date",
        "icd_code",
        "get_deleted_status",
    ]
    search_fields = ["proband__copsac_id", "icd_code__code", "icd_code__description"]
    list_filter = [("proband__copsac_id", ProbandFilter), "is_chronic", "adverse_event"]
    date_hierarchy = "start_date"


# Backoffice-specific class
class DiagnosisBackOffice(
    AdminDynPaginationMixin,
    SoftDeleteAdminMixin,
    BackOfficeAdminMixin,
    admin.ModelAdmin,
):
    list_display = [
        "proband",
        "start_date",
        "end_date",
        "icd_code",
        "get_deleted_status",
    ]
    search_fields = ["proband__copsac_id", "icd_code__code", "icd_code__description"]
    list_filter = [("proband__copsac_id", ProbandFilter), "is_chronic", "adverse_event"]
    date_hierarchy = "start_date"


backoffice.register(Diagnosis, DiagnosisBackOffice)


@admin.register(ICDCode)
class ICDCodeAdmin(AdminDynPaginationMixin, admin.ModelAdmin):
    list_display = ["code", "description"]
    search_fields = ["code", "description"]


class ICDCodeBackOffice(
    AdminDynPaginationMixin,
    BackOfficeAdminMixin,
    admin.ModelAdmin,
):
    list_display = ["code", "description"]
    search_fields = ["code", "description"]


backoffice.register(ICDCode, ICDCodeBackOffice)


@admin.register(ATCCode)
class ATCCodeAdmin(AdminDynPaginationMixin, admin.ModelAdmin):
    list_display = ["code", "description"]
    search_fields = ["code", "description"]


class ATCCodeBackOffice(
    AdminDynPaginationMixin,
    BackOfficeAdminMixin,
    admin.ModelAdmin,
):
    list_display = ["code", "description"]
    search_fields = ["code", "description"]


backoffice.register(ATCCode, ATCCodeBackOffice)


@admin.register(Medication)
class MedicationAdmin(AdminDynPaginationMixin, SoftDeleteAdminMixin, admin.ModelAdmin):
    list_display = [
        "atc_code",
        "proband",
        "start_date",
        "end_date",
        "get_deleted_status",
    ]
    search_fields = ["atc_code__code", "proband__copsac_id"]
    list_filter = [("proband__copsac_id", ProbandFilter)]


# Backoffice-specific class
class MedicationBackOffice(
    AdminDynPaginationMixin,
    SoftDeleteAdminMixin,
    BackOfficeAdminMixin,
    admin.ModelAdmin,
):
    list_display = [
        "atc_code",
        "proband",
        "start_date",
        "end_date",
        "get_deleted_status",
    ]
    search_fields = ["atc_code__code", "proband__copsac_id"]
    list_filter = [("proband__copsac_id", ProbandFilter)]


backoffice.register(Medication, MedicationBackOffice)
