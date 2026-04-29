from django.contrib.auth.decorators import login_required
from django.http import Http404, JsonResponse
from django.views.decorators.http import require_GET

from base.models import Proband

from ..models import Cell, Dataset, Examination


def _resolve_display_value(value, choices):
    """
    Resolve a stored value to its display label using a schema choices list.

    Each entry in choices is either:
      - a plain string/value  → the label and stored value are identical
      - a [label, stored_value] two-element list → label differs from stored value

    Returns the original value unchanged if no matching choice is found or if
    the value is not a scalar (e.g. a list from an array property).
    """
    if not choices or not isinstance(value, (str, int, float)):
        return value
    str_value = str(value)
    for choice in choices:
        if isinstance(choice, list) and len(choice) == 2:
            label, stored = choice
            if str(stored) == str_value:
                return label
        elif str(choice) == str_value:
            return choice
    return value


@login_required
@require_GET
def get_cells(request, copsac_id, ds_name):
    response = {}
    proband = Proband.objects.filter(copsac_id=copsac_id).first()
    if not proband:
        raise Http404("Proband does not exist")
    cohort = proband.cohort
    ds = Dataset.objects.filter(name=ds_name.lower(), cohort=cohort).first()

    if (
        ds.data_schema and "properties" in ds.data_schema
    ):  # No data schema, we use cell data instead
        # There is a data schema. We use data from the Examination.data.
        examination_filter = {
            "dataset_id": ds.id,
            "visit__proband__copsac_id": copsac_id,
            "visit__is_deleted": False,
            "is_deleted": False,
        }
        field_order = [
            "-visit__visit_date",
            "visit__visit_type",
            "id",
        ]
        examinations = Examination.objects.filter(**examination_filter).order_by(
            *field_order,
        )
        records = []
        headings = [
            "ID",
            "Lock Status",
            "Examination",
            "Visit id",
            "Visit",
            "Status",
            "Start date",
            "Comments",
        ]
        for examination in examinations:
            record = {
                "ID": examination.id,
                "Lock Status": examination.lock_status,
                "Examination": examination.dataset.name,
                "Visit id": examination.visit.id,
                "Visit": examination.visit.visit_type.name,
                "Status": examination.get_status_display(),
                "Start date": examination.startdate,
                "Comments": examination.comments,
            }
            records.append(record)
            properties = examination.dataset.data_schema["properties"]
            for name in properties:
                # Not all Examinations have data for all data schemas.
                # We need to check if the data exists before accessing it.
                value = examination.data.get(name)
                if value is None:
                    continue
                definition = properties[name]
                title = definition["title"]
                choices = definition.get("choices")
                if choices:
                    value = _resolve_display_value(value, choices)
                record[title] = value
                if title not in headings:
                    headings.append(title)
    else:
        cell_filter = {
            "examination__dataset_id": ds.id,
            "examination__visit__proband__copsac_id": copsac_id,
            "examination__visit__is_deleted": False,
            "examination__is_deleted": False,
        }
        field_order = [
            "-examination__visit__visit_date",
            "examination__visit__visit_type",
            "examination__id",
        ]
        if ds.column_set.filter(display_order__isnull=False).count():
            cell_filter["column__display_order__isnull"] = False
            field_order.append("column__display_order")
        else:
            field_order.append("column__title")
        cells = (
            Cell.objects.select_related("examination")
            .filter(**cell_filter)
            .order_by(*field_order)
        )
        records = []
        record = None
        examination_id = None
        headings = [
            "ID",
            "Lock Status",
            "Examination",
            "Visit id",
            "Visit",
            "Status",
            "Start date",
            "Comments",
        ]
        # Not all cells with exist for every column, therefore we first need to build
        # a dict and then convert it into a list.
        for cell in cells:
            if not record or examination_id != cell.examination_id:
                examination = cell.examination
                examination_id = examination.id
                record = {
                    "ID": examination.id,
                    "Lock Status": examination.lock_status,
                    "Examination": examination.dataset.name,
                    "Visit id": examination.visit.id,
                    "Visit": examination.visit.visit_type.name,
                    "Status": examination.get_status_display(),
                    "Start date": examination.startdate,
                    "Comments": examination.comments,
                }
                records.append(record)
            record[cell.column.title] = cell.value
            if cell.column.title not in headings:
                headings.append(cell.column.title)
    # Move comments to end
    headings.remove("Comments")
    headings.append("Comments")
    response["data"] = [
        [record.get(heading, "") for heading in headings] for record in records
    ]
    response["headings"] = headings
    return JsonResponse(response, status=200)
