from django.urls import path

from .views import atc_code_search
from .views import delete_diagnosis
from .views import delete_medication
from .views import diagnosis_overview
from .views import diagnosis_view
from .views import get_diagnoses
from .views import get_medications
from .views import icd_code_search
from .views import lock_diagnosis
from .views import lock_medication
from .views import medication_overview
from .views import medication_view

app_name = "healthcare_records"

urlpatterns = [
    path(
        r"diagnosis/<int:copsac_id>/",
        diagnosis_overview,
        name="diagnosis_overview",
    ),
    path(
        r"diagnosis/create/<int:copsac_id>/",
        diagnosis_view,
        name="diagnosis_create_view",
    ),
    path(
        r"diagnosis/update/<int:copsac_id>/<int:diagnosis_id>/",
        diagnosis_view,
        name="diagnosis_update_view",
    ),
    path(
        r"api/diagnosis/delete/<int:copsac_id>/<int:diagnosis_id>/",
        delete_diagnosis,
        name="diagnosis_delete_view",
    ),
    path(
        r"api/diagnosis/lock/<int:copsac_id>/<int:diagnosis_id>/",
        lock_diagnosis,
        name="diagnosis_lock_view",
    ),
    path(
        r"api/diagnosis/get/<int:copsac_id>/",
        get_diagnoses,
        name="diagnosis_get_view",
    ),
    path(
        r"api/diagnosis/get_current/<int:copsac_id>/",
        get_diagnoses,
        {"current": True},
        name="diagnosis_get_current_view",
    ),
    path(
        r"api/icd_code/search/<str:term>/",
        icd_code_search,
        name="icd_code_search",
    ),
    path(
        r"medication/<int:copsac_id>/",
        medication_overview,
        name="medication_overview",
    ),
    path(
        r"medication/create/<int:copsac_id>/",
        medication_view,
        name="medication_create_view",
    ),
    path(
        r"medication/update/<int:copsac_id>/<int:medication_id>/",
        medication_view,
        name="medication_update_view",
    ),
    path(
        r"api/medication/delete/<int:copsac_id>/<int:medication_id>/",
        delete_medication,
        name="medication_delete_view",
    ),
    path(
        r"api/medication/lock/<int:copsac_id>/<int:medication_id>/",
        lock_medication,
        name="medication_lock_view",
    ),
    path(
        r"api/medication/get/<int:copsac_id>/",
        get_medications,
        name="medication_get_view",
    ),
    path(
        r"api/medication/get_current/<int:copsac_id>/",
        get_medications,
        {"current": True},
        name="medication_get_current_view",
    ),
    path(
        r"api/atc_code/search/<str:term>/",
        atc_code_search,
        name="atc_code_search",
    ),
]
