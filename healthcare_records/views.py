# from django.shortcuts import render
from django import forms
from django.contrib.auth.decorators import login_required
from django.contrib.auth.decorators import user_passes_test
from django.db.models import Q
from django.http import Http404
from django.http import HttpResponseRedirect
from django.http import JsonResponse
from django.shortcuts import render
from django.template.response import TemplateResponse
from django.urls import reverse
from django.views.decorators.http import require_GET

from .models import ATCCode
from .models import Diagnosis
from .models import ICDCode
from .models import Medication
from base.models import Proband
from data.views.helpers import can_moderate

# Related to diagnosis


class DiagnosisForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Prevent preloading of ICD codes
        if hasattr(self.instance, "icd_code"):
            self.fields["icd_code"].choices = [
                (
                    self.instance.icd_code.id,
                    f"{self.instance.icd_code.code} {self.instance.icd_code.description}",
                ),
            ]
        else:
            self.fields["icd_code"].choices = []

    class Meta:
        model = Diagnosis
        exclude = ["proband", "is_deleted"]
        widgets = {
            "start_date": forms.DateInput(
                format=("%Y-%m-%d"),
                attrs={
                    "class": "form-control",
                    "placeholder": "Select a date",
                    "type": "date",
                },
            ),
            "end_date": forms.DateInput(
                format=("%Y-%m-%d"),
                attrs={
                    "class": "form-control",
                    "placeholder": "Select a date",
                    "type": "date",
                },
            ),
            "lock_status": forms.Select(attrs={"readonly": True}),
        }


@login_required
def diagnosis_view(request, copsac_id, diagnosis_id=None):
    proband = Proband.objects.filter(copsac_id=copsac_id).first()
    if not proband:
        raise Http404("Proband does not exist")
    instance = (
        Diagnosis.objects.get(id=diagnosis_id, proband=proband, is_deleted=False)
        if diagnosis_id
        else Diagnosis(proband=proband)
    )
    form = DiagnosisForm(request.POST or None, instance=instance)
    if form.is_valid():
        form.save()
        return HttpResponseRedirect(
            reverse("healthcare_records:diagnosis_overview", args=[copsac_id]),
        )
    context = {
        "copsac_id": copsac_id,
        "proband": proband,
        "form": form,
    }
    return render(request, "diagnosis_view.html", context)


@login_required
def diagnosis_overview(request, copsac_id):
    return TemplateResponse(
        request,
        "diagnosis_overview.html",
        {"copsac_id": copsac_id},
    )


@login_required
def get_diagnoses(request, copsac_id, current=False):
    response = {}
    proband = Proband.objects.filter(copsac_id=copsac_id).first()
    if not proband:
        raise Http404("Proband does not exist")
    filters = {"proband": proband, "is_deleted": False}
    if current:
        filters["end_date__isnull"] = True
    diagnoses = Diagnosis.objects.filter(**filters).order_by("-start_date")
    response["diagnoses"] = list(
        diagnoses.values(
            "id",
            "lock_status",
            "icd_code__code",
            "icd_code__description",
            "start_date",
            "end_date",
            "is_chronic",
            "medical_attention",
            "comments",
        ),
    )
    return JsonResponse(response)


@login_required
@require_GET
def lock_diagnosis(request, copsac_id, diagnosis_id):
    response = {}
    diagnosis = Diagnosis.objects.filter(
        id=diagnosis_id,
        proband__copsac_id=copsac_id,
    ).first()
    if diagnosis:
        if diagnosis.lock_status == "unlocked":
            diagnosis.lock_status = "locked"
        else:
            diagnosis.lock_status = "unlocked"
        diagnosis.save()
    return JsonResponse(response)


@login_required
@require_GET
@user_passes_test(can_moderate)
def delete_diagnosis(request, copsac_id, diagnosis_id):
    response = {}
    Diagnosis.objects.filter(id=diagnosis_id, proband__copsac_id=copsac_id).update(
        is_deleted=True,
    )
    return JsonResponse(response, status=200)


@login_required
def icd_code_search(request, term):
    response = {}
    response["icd_codes"] = list(
        ICDCode.objects.filter(
            Q(code__icontains=term) | Q(description__icontains=term),
        ).values_list("id", "code", "description"),
    )

    return JsonResponse(response)


# Related to medication


class MedicationForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Prevent preloading of atc codes
        if hasattr(self.instance, "atc_code"):
            self.fields["atc_code"].choices = [
                (
                    self.instance.atc_code.id,
                    f"{self.instance.atc_code.code} {self.instance.atc_code.description}",
                ),
            ]
        else:
            self.fields["atc_code"].choices = []

    class Meta:
        model = Medication
        exclude = ["proband", "is_deleted"]
        widgets = {
            "start_date": forms.DateInput(
                format=("%Y-%m-%d"),
                attrs={
                    "class": "form-control",
                    "placeholder": "Select a date",
                    "type": "date",
                },
            ),
            "end_date": forms.DateInput(
                format=("%Y-%m-%d"),
                attrs={
                    "class": "form-control",
                    "placeholder": "Select a date",
                    "type": "date",
                },
            ),
            "lock_status": forms.Select(attrs={"readonly": True}),
        }


@login_required
def medication_view(request, copsac_id, medication_id=None):
    proband = Proband.objects.filter(copsac_id=copsac_id).first()
    if not proband:
        raise Http404("Proband does not exist")
    instance = (
        Medication.objects.get(id=medication_id, proband=proband, is_deleted=False)
        if medication_id
        else Medication(proband=proband)
    )
    form = MedicationForm(request.POST or None, instance=instance)
    if form.is_valid():
        form.save()
        return HttpResponseRedirect(
            reverse("healthcare_records:medication_overview", args=[copsac_id]),
        )
    context = {
        "copsac_id": copsac_id,
        "proband": proband,
        "form": form,
    }
    return render(request, "medication_view.html", context)


@login_required
def medication_overview(request, copsac_id):
    return TemplateResponse(
        request,
        "medication_overview.html",
        {"copsac_id": copsac_id},
    )


@login_required
def get_medications(request, copsac_id, current=False):
    response = {}
    proband = Proband.objects.filter(copsac_id=copsac_id).first()
    if not proband:
        raise Http404("Proband does not exist")
    response["birthdate"] = (
        proband.birthdate
    )  # Used to calculate dates for missing vaccines (when vaccine should have been given)
    filters = {"proband": proband, "is_deleted": False}
    if current:
        filters["end_date__isnull"] = True
    medications = Medication.objects.filter(**filters).order_by("-start_date")
    response["medications"] = list(
        medications.values(
            "id",
            "lock_status",
            "atc_code__code",
            "atc_code__description",
            "start_date",
            "end_date",
            "dose",
            "unit",
            "frequency",
            "period",
            "route",
            "route_spec",
            "comments",
        ),
    )
    return JsonResponse(response)


@login_required
@require_GET
def lock_medication(request, copsac_id, medication_id):
    response = {}
    medication = Medication.objects.filter(
        id=medication_id,
        proband__copsac_id=copsac_id,
    ).first()
    if medication:
        if medication.lock_status == "unlocked":
            medication.lock_status = "locked"
        else:
            medication.lock_status = "unlocked"
        medication.save()
    return JsonResponse(response)


@login_required
@require_GET
@user_passes_test(can_moderate)
def delete_medication(request, copsac_id, medication_id):
    response = {}
    Medication.objects.filter(id=medication_id, proband__copsac_id=copsac_id).update(
        is_deleted=True,
    )
    return JsonResponse(response, status=200)


@login_required
def atc_code_search(request, term):
    response = {}
    response["atc_codes"] = list(
        ATCCode.objects.filter(
            Q(code__icontains=term) | Q(description__icontains=term),
        ).values_list("id", "code", "description"),
    )

    return JsonResponse(response)
