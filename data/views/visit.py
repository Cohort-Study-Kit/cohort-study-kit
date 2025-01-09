import logging
from datetime import date
from datetime import datetime

from django.contrib.auth.decorators import login_required
from django.contrib.auth.decorators import user_passes_test
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from django.shortcuts import redirect
from django.template.response import TemplateResponse
from django.urls import reverse
from django.views.decorators.http import require_GET
from django.views.generic import TemplateView

from ..models import Examination
from ..models import Visit
from ..models import VisitType
from .helpers import can_moderate
from base.models import Proband

logger = logging.getLogger(__name__)


class VisitView(TemplateView, LoginRequiredMixin):
    template_name = "VisitView.html"

    def get(self, request, copsac_id=0, visit_id=0):
        proband = Proband.objects.filter(copsac_id=copsac_id).first()
        visit_type_options = list(VisitType.objects.filter(adhoc=True))
        status_options = Visit.STATUS_CHOICES
        context = {
            "proband": proband,
            "visit_type_options": visit_type_options,
            "status_options": status_options,
            "copsac_id": copsac_id,
        }

        if visit_id > 0:  # Update Visit
            visit = Visit.objects.filter(id=visit_id).first()
            proband = Proband.objects.get(id=visit.fk_proband_id)
            fk_visit_type = visit.fk_visit_type
            fk_secondary_visit_type = visit.fk_secondary_visit_type or ""
            context["copsac_id"] = copsac_id
            context["proband"] = proband
            context["fk_visit_type"] = fk_visit_type
            context["fk_secondary_visit_type"] = fk_secondary_visit_type
            context["visit"] = visit

        return TemplateResponse(request, self.template_name, context)

    def post(self, request, copsac_id=0, visit_id=0, *args, **kwargs):
        data = request.POST
        if data["visit_date"] < str(date.today()) and data["visit_date"] != "":
            # Mayhaps process such instances
            logger.warning(f'Visit date before today: {data["visit_date"]}')
        proband = Proband.objects.filter(copsac_id=copsac_id).first()
        visit_type = VisitType.objects.get(id=data["fk_visit_type"])
        secondary_visit_type = None
        if data["fk_secondary_visit_type"]:
            secondary_visit_type = VisitType.objects.get(
                id=data["fk_secondary_visit_type"],
            )
        status = data["status"]
        visit_date = data["visit_date"]
        comments = data["comments"]

        if visit_id > 0:  # Update Visit
            visit = Visit.objects.get(id=visit_id)
            proband = visit.fk_proband
            visit.fk_visit_type = visit_type
            visit.fk_secondary_visit_type = secondary_visit_type
            visit.status = data["status"]
            visit_date = datetime.strptime(data["visit_date"], "%Y-%m-%d").date()
            if visit.visit_date != visit_date:
                visit.visit_date = visit_date
                # Also update the startdate of all connected events that are
                # planned.
                for planned_event in visit.examination_set.filter(status="planned"):
                    planned_event.startdate = visit_date
                    if (
                        planned_event.finishdate
                        and visit_date > planned_event.finishdate
                    ):
                        planned_event.finishdate = visit_date
                    planned_event.save()
            visit.comments = data["comments"]
            visit.save()

        else:  # Create new Visit
            new_visit = Visit.objects.create(
                fk_proband=proband,
                fk_visit_type=visit_type,
                fk_secondary_visit_type=secondary_visit_type,
                status=status,
                visit_date=visit_date,
                comments=comments,
            )
            for dataset_id in list(
                visit_type.datasetvisittyperel_set.all()
                .values_list("fk_dataset", flat=True)
                .distinct(),
            ):
                Examination.objects.create(
                    fk_visit=new_visit,
                    fk_dataset_id=dataset_id,
                    startdate=new_visit.visit_date,
                )

        return redirect(
            reverse("base:proband_home", kwargs={"copsac_id": proband.copsac_id}),
        )


@login_required
@require_GET
@user_passes_test(can_moderate)
def delete_visit(request, visit_id):
    response = {}
    v = Visit.objects.get(id=visit_id)
    v.is_deleted = True
    v.save()
    return JsonResponse(response)


@login_required
@require_GET
def get_visits(self, copsac_id):
    response = {}
    response["visits"] = [
        (
            v.id,
            v.fk_visit_type.name,
            v.fk_secondary_visit_type.name if v.fk_secondary_visit_type else "",
            v.get_status_display(),
            v.visit_date,
            v.fk_visit_type.adhoc,
            v.comments,
        )
        for v in Visit.objects.filter(
            fk_proband__copsac_id=copsac_id,
            is_deleted=False,
        ).order_by("fk_visit_type__status", "-visit_date", "fk_visit_type__name")
    ]
    return JsonResponse(response)
