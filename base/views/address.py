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

from ..models import Address
from ..models import Proband
from data.views.helpers import can_moderate


class AddressForm(forms.ModelForm):
    class Meta:
        model = Address
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
def address_view(request, copsac_id, address_id=None):
    proband = Proband.objects.filter(copsac_id=copsac_id).first()
    if not proband:
        raise Http404("Proband does not exist")
    instance = (
        Address.objects.get(id=address_id, proband=proband, is_deleted=False)
        if address_id
        else Address(proband=proband)
    )
    form = AddressForm(request.POST or None, instance=instance)
    if form.is_valid():
        form.save()
        return HttpResponseRedirect(reverse("base:address_overview", args=[copsac_id]))
    context = {
        "copsac_id": copsac_id,
        "proband": proband,
        "form": form,
    }
    return render(request, "address_view.html", context)


@login_required
def address_overview(request, copsac_id):
    return TemplateResponse(request, "address_overview.html", {"copsac_id": copsac_id})


@login_required
def get_addresses(request, copsac_id, current=False):
    response = {}
    proband = Proband.objects.filter(copsac_id=copsac_id).first()
    if not proband:
        raise Http404("Proband does not exist")
    filters = {"proband": proband, "is_deleted": False}
    if current:
        filters["end_date__isnull"] = True
    addresses = Address.objects.filter(**filters).order_by("-start_date")
    response["addresses"] = list(addresses.values())
    return JsonResponse(response)


@login_required
@require_GET
@user_passes_test(can_moderate)
def delete_address(request, copsac_id, address_id):
    response = {}
    Address.objects.filter(id=address_id, proband__copsac_id=copsac_id).update(
        is_deleted=True,
    )
    return JsonResponse(response, status=200)
