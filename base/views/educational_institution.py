from django import forms
from django.contrib.auth.decorators import login_required
from django.contrib.auth.decorators import user_passes_test
from django.http import Http404
from django.http import HttpResponseRedirect
from django.http import JsonResponse
from django.shortcuts import render
from django.template.response import TemplateResponse
from django.urls import reverse
from django.views.decorators.http import require_GET

from ..models import EducationalInstitution
from ..models import Proband
from data.views.helpers import can_moderate


class EducationalInstitutionForm(forms.ModelForm):
    class Meta:
        model = EducationalInstitution
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
        }


@login_required
def educational_institution_view(request, copsac_id, educational_institution_id=None):
    proband = Proband.objects.filter(copsac_id=copsac_id).first()
    if not proband:
        raise Http404("Proband does not exist")
    instance = (
        EducationalInstitution.objects.get(
            id=educational_institution_id,
            proband=proband,
            is_deleted=False,
        )
        if educational_institution_id
        else EducationalInstitution(proband=proband)
    )
    form = EducationalInstitutionForm(request.POST or None, instance=instance)
    if form.is_valid():
        form.save()
        return HttpResponseRedirect(
            reverse("base:educational_institution_overview", args=[copsac_id]),
        )
    context = {
        "copsac_id": copsac_id,
        "proband": proband,
        "form": form,
    }
    return render(request, "educational_institution_view.html", context)


def educational_institution_overview(request, copsac_id):
    return TemplateResponse(
        request,
        "educational_institution_overview.html",
        {"copsac_id": copsac_id},
    )


def get_educational_institutions(request, copsac_id, current=False):
    response = {}
    proband = Proband.objects.filter(copsac_id=copsac_id).first()
    if not proband:
        raise Http404("Proband does not exist")
    filters = {"proband": proband, "is_deleted": False}
    if current:
        filters["end_date__isnull"] = True
    educational_institutions = EducationalInstitution.objects.filter(
        **filters,
    ).order_by("-start_date")
    response["educational_institutions"] = list(educational_institutions.values())
    return JsonResponse(response)


@login_required
@require_GET
@user_passes_test(can_moderate)
def delete_educational_institution(request, copsac_id, educational_institution_id):
    response = {}
    EducationalInstitution.objects.filter(
        id=educational_institution_id,
        proband__copsac_id=copsac_id,
    ).update(is_deleted=True)
    return JsonResponse(response, status=200)
