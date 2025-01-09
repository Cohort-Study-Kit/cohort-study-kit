import json
import logging

from django.contrib.auth.decorators import login_required
from django.contrib.auth.decorators import user_passes_test
from django.core.serializers.json import DjangoJSONEncoder
from django.db.models import Q
from django.db.models import TextField
from django.db.models.functions import Cast
from django.http import Http404
from django.http import HttpRequest
from django.http import HttpResponse
from django.http import JsonResponse
from django.shortcuts import redirect
from django.shortcuts import render
from django.template.response import TemplateResponse
from django.urls import reverse
from django.views.decorators.http import require_GET

from ..models import Cell
from ..models import Column
from ..models import Dataset
from ..models import Examination
from ..models import Visit
from .helpers import can_moderate
from base.models import Proband
from healthcare_records.models import Diagnosis
from healthcare_records.models import Medication

logger = logging.getLogger(__name__)


def check_healthcare_record(record_type, code, proband, date):
    "Check whether a proband has a specific diagnosis or medication on a given date."
    if record_type == "diagnose":
        return Diagnosis.objects.filter(
            Q(
                start_date__lte=date,
                end_date__gte=date,
                proband=proband,
                icd_code__code=code,
            )
            | Q(
                start_date__lte=date,
                end_date__isnull=True,
                proband=proband,
                icd_code__code=code,
            ),
        ).exists()
    if record_type == "medication":
        return Medication.objects.filter(
            Q(
                start_date__lte=date,
                end_date__gte=date,
                proband=proband,
                atc_code__code=code,
            )
            | Q(
                start_date__lte=date,
                end_date__isnull=True,
                proband=proband,
                atc_code__code=code,
            ),
        ).exists()
    return False


def retrieve_external_values(examination, startdate):
    "Get external values for an examination given startdate."
    external_values = {}
    for external_value in (
        examination.fk_dataset.form["external_values"]
        if "external_values" in examination.fk_dataset.form
        else []
    ):
        if external_value["type"] == "column":
            visit = examination.fk_visit
            other_examination = visit.examination_set.filter(
                fk_dataset__name=external_value["dataset"],
            ).first()
            value = ""
            if other_examination:
                cell = other_examination.cell_set.filter(
                    fk_column__name=external_value["column"],
                ).first()
                if cell:
                    value = cell.value
            dataset_name = external_value["dataset"]
            column_name = external_value["column"]
            external_values[f"column${dataset_name}${column_name}"] = value
        elif external_value["type"] == "property":
            visit = examination.fk_visit
            other_examination = visit.examination_set.filter(
                fk_dataset__name=external_value["dataset"],
            ).first()
            value = ""
            if other_examination:
                value = other_examination.data[external_value["property"]]
            dataset_name = external_value["dataset"]
            property_name = external_value["property"]
            external_values[f"property${dataset_name}${property_name}"] = value
        else:
            treatment_type = external_value["type"]
            code = external_value["code"]
            external_values[f"{treatment_type}${code}"] = check_healthcare_record(
                treatment_type,
                code,
                examination.fk_visit.fk_proband,
                startdate,
            )
    return external_values


@login_required
def get_external_values(
    request: HttpRequest,
    examination_id: int,
    startdate: str,
) -> HttpResponse:
    examination = (
        Examination.objects.filter(id=examination_id)
        .select_related("fk_dataset")
        .annotate(dataset_form_json=Cast("fk_dataset__form", TextField()))
        .first()
    )
    if not examination:
        raise Http404("Examination does not exist")
    external_values = retrieve_external_values(examination, startdate)
    return JsonResponse(external_values, status=200)


@login_required
def examination_form(
    request: HttpRequest,
    examination_id: int,
) -> HttpResponse:
    examination = (
        Examination.objects.filter(id=examination_id)
        .select_related("fk_dataset")
        .annotate(dataset_form_json=Cast("fk_dataset__form", TextField()))
        .first()
    )
    if not examination:
        raise Http404("Examination does not exist")
    latest_examination = None
    if (
        examination.fk_dataset.data_schema == {}
    ):  # If no data schema, we use columns instead
        latest_cell = (
            Cell.objects.filter(
                (~Q(value__exact="") & Q(value__isnull=False)),
                fk_examination__fk_dataset=examination.fk_dataset,
                fk_examination__fk_visit__fk_proband=examination.fk_visit.fk_proband,
            )
            .order_by("-fk_examination__startdate")
            .first()
        )
        if latest_cell:
            latest_examination = latest_cell.fk_examination
    else:
        latest_examination = (
            Examination.objects.filter(
                (~Q(data__exact={})),
                fk_dataset=examination.fk_dataset,
                fk_visit__fk_proband=examination.fk_visit.fk_proband,
            )
            .order_by("-startdate")
            .first()
        )
    if not examination:
        raise Http404("Examination does not exist")
    title = (
        f"{examination.fk_dataset.title}"
        f" - {examination.fk_visit.fk_visit_type.name}"
        f" - {examination.fk_visit.fk_proband.name}"
        f" - Copsac ID: {examination.fk_visit.fk_proband.copsac_id}"
    )
    breadcrumbs = []
    if latest_examination:
        if latest_examination == examination:
            breadcrumbs.append("Showing latest data")
        else:
            breadcrumbs.append(
                f"<a href='/data/event/{latest_examination.id}/'>"
                f"Latest data: {latest_examination.startdate}"
                "</a>",
            )
    context = {
        "copsac_id": examination.fk_visit.fk_proband.copsac_id,
        "visit_id": examination.fk_visit.id,
        "examination_name": examination.fk_dataset.name,
        "form_json": examination.dataset_form_json,
        "id": examination.id,
        "form_options_json": json.dumps(
            {
                "use_finishdate": examination.fk_dataset.use_finishdate,
                "status_choices": examination.fk_dataset.status_choices,
                "columns": {
                    column.name: {
                        "format": column.col_format,
                        "title": column.title,
                    }
                    for column in examination.fk_dataset.column_set.all()
                },
                "data_schema": examination.fk_dataset.data_schema,
                "external_values": retrieve_external_values(
                    examination,
                    examination.startdate,
                ),
            },
            cls=DjangoJSONEncoder,
        ),
        "examination_json": json.dumps(
            {
                "id": examination.id,
                "data": examination.data,
                "column_data": {
                    column.name: getattr(
                        examination.cell_set.filter(fk_column=column).first(),
                        "value",
                        "",
                    )
                    for column in examination.fk_dataset.column_set.all()
                },
                "startdate": examination.startdate,
                "finishdate": examination.finishdate,
                "status": examination.status,
                "lock_status": examination.lock_status,
                "comments": examination.comments,
                "exceptional_values": examination.exceptional_values,
            },
            cls=DjangoJSONEncoder,
        ),
        "proband": examination.fk_visit.fk_proband,
        "title": title,
        "breadcrumbs": breadcrumbs,
        "version_time": examination.fk_dataset.updated,
    }

    return render(
        request,
        template_name="examination_form.html",
        context=context,
    )


def save_examination(
    request: HttpRequest,
):
    response = {}
    examination_data = json.loads(request.POST.get("examination"))
    examination = Examination.objects.filter(id=examination_data["id"]).first()
    if not examination:
        raise Http404("Examination does not exist")
    if examination.lock_status > 0:
        raise Http404("Examination is locked")
    examination.startdate = examination_data["startdate"]
    examination.finishdate = examination_data["finishdate"]
    examination.comments = examination_data["comments"]
    examination.status = examination_data["status"]
    examination.exceptional_values = examination_data["exceptional_values"]
    examination.data = examination_data["data"]
    examination.save()
    for column_name in examination_data["column_data"]:
        value = examination_data["column_data"][column_name]
        column = Column.objects.filter(
            name=column_name,
            fk_dataset=examination.fk_dataset,
        ).first()
        if not column:
            raise Http404("Column does not exist")
        Cell.objects.update_or_create(
            fk_column=column,
            fk_examination=examination,
            defaults={"value": value},
        )
    return JsonResponse(response, status=201)


@login_required
def create_examination_form(request, copsac_id=0, visit_id=0):
    if request.method == "POST":
        data = request.POST
        # Insert some sort of data check and only save if valid
        # below could be one such validity check
        if data["end_date"] < data["start_date"] and not data["end_date"] == "":
            logger.warning(
                f'End date {data["end_date"]} before start date {data["start_date"]}',
            )

        if visit_id == 0:
            visit = (
                Visit.objects.filter(
                    fk_proband__copsac_id=copsac_id,
                    is_deleted=0,
                )
                .order_by("-visit_date", "status", "fk_visit_type__name")
                .first()
            )
            visit_id = visit.id
        else:
            visit = Visit.objects.filter(id=visit_id).first()

        dataset = Dataset.objects.get(id=data["fk_dataset"])
        startdate = data["start_date"]
        enddate = None
        if data["end_date"]:
            enddate = data["end_date"]

        new_mdv = Examination.objects.create(
            fk_dataset=dataset,
            startdate=startdate,
            finishdate=enddate,
            status=data["status"],
            comments=data["comments"],
            fk_visit=visit,
        )
        cols_to_add = Column.objects.filter(fk_dataset=dataset)
        for col in cols_to_add:
            Cell.objects.create(fk_column=col, fk_examination=new_mdv)

        return redirect(
            reverse(
                "base:proband_home",
                kwargs={
                    "copsac_id": copsac_id,
                    "visit_id": visit_id,
                    "examination_name": dataset.name,
                },
            ),
        )
    else:
        if visit_id == 0:
            visit_id = (
                Visit.objects.filter(
                    fk_proband__copsac_id=copsac_id,
                    is_deleted=0,
                )
                .order_by("-visit_date", "status", "fk_visit_type__name")
                .first()
                .id
            )

        proband = Proband.objects.filter(copsac_id=copsac_id).first()
        if not proband:
            raise Http404("Proband does not exist")
        cohort = proband.cohort
        visit = Visit.objects.get(id=visit_id)
        dataset_options = list(Dataset.objects.filter(cohort=cohort).order_by("name"))
        context = {
            "copsac_id": copsac_id,
            "proband": proband,
            "fk_visit": visit,
            "dataset_options": dataset_options,
            "status_choices": Examination.STATUS_CHOICES,
        }

        return TemplateResponse(request, "create_examination_form.html", context)


@login_required
@require_GET
@user_passes_test(can_moderate)
def delete_examination(request, examination_id):
    response = {}
    mdv = Examination.objects.get(id=examination_id)
    mdv.is_deleted = True
    mdv.save()
    return JsonResponse(response)


@login_required
@require_GET
def lock_examination(request, examination_id):
    response = {}
    examination = Examination.objects.get(id=examination_id)
    if examination.lock_status > 0:
        examination.lock_status = 0
    else:
        examination.lock_status = 1
    examination.save()
    return JsonResponse(response)


@login_required
@require_GET
def get_examinations(self, visit_id):
    response = {}
    response["examinations"] = [
        [
            reverse(
                "data:examination-form",
                kwargs={"examination_id": examination.id},
            ),
            examination.id,
            examination.lock_status,
            examination.fk_dataset.name,
            examination.fk_dataset.title,
            examination.fk_visit.fk_visit_type.name,
            examination.get_status_display(),
            examination.startdate,
            examination.comments,
        ]
        for examination in Examination.objects.filter(
            fk_visit_id=visit_id,
            is_deleted=False,
            fk_dataset__isnull=False,
        )
        .exclude(fk_dataset__name__exact="")
        .order_by("fk_dataset__name", "-startdate", "status")
    ]
    return JsonResponse(response)
