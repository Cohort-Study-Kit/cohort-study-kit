from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import Http404
from django.http import JsonResponse
from django.shortcuts import redirect
from django.template.response import TemplateResponse
from django.urls import reverse
from django.views.decorators.http import require_GET
from django.views.generic import TemplateView

from base.models import Consent
from base.models import Proband


def consent_overview(request, copsac_id):
    return TemplateResponse(request, "consent_overview.html", {"copsac_id": copsac_id})


class ConsentView(TemplateView, LoginRequiredMixin):
    template_name = "ConsentView.html"

    def get(self, request, copsac_id, consent_id, *args, **kwargs):
        consent = Consent.objects.filter(
            fk_proband__copsac_id=copsac_id,
            id=consent_id,
        ).first()
        if not consent:
            raise Http404("Consent does not exist")
        context = {
            "copsac_id": copsac_id,
            "proband": consent.fk_proband,
            "consent_type": consent.fk_consent_type,
            "consent": consent,
        }
        return TemplateResponse(request, self.template_name, context)

    def post(self, request, copsac_id, consent_id, *args, **kwargs):
        consent = Consent.objects.filter(
            fk_proband__copsac_id=copsac_id,
            id=consent_id,
        ).first()
        if not consent:
            raise Http404("Consent does not exist")
        consent.comments = request.POST["comments"]
        consent.status = request.POST["status"]
        consent.date = request.POST["date"]
        consent.save()
        return redirect(
            reverse("base:proband_home", kwargs={"copsac_id": copsac_id}),
        )


@require_GET
@login_required
def get_consents(request, copsac_id, only_missing=False):
    response = {}
    proband = Proband.objects.filter(copsac_id=copsac_id).first()
    if not proband:
        raise Http404("Proband does not exist")
    response["consents"] = []
    query = Consent.objects.filter(fk_proband=proband, is_deleted=False)
    if only_missing:
        query = query.filter(status__in=["none", "ongoing"])
    for consent in query:
        response["consents"].append(
            {
                "id": consent.id,
                "name": consent.fk_consent_type.name,
                "date": consent.date,
                "status": consent.get_status_display(),
            },
        )
    return JsonResponse(response)
