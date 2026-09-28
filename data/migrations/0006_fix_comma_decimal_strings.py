import re

from django.db import migrations

# One comma separating an optional integer part and fractional digits, with an
# optional minus sign: "1,23", "-1,23", ",5" and "-,5" -- but not "1,2,3"
# or "1,5x". ",5" and "-,5" get a "0" inserted after the sign/comma.
COMMA_NUMBER_RE = re.compile(r"^(-?)(\d*),(\d+)$")


def to_number(value):
    match = COMMA_NUMBER_RE.match(value)
    if match is None:
        return None
    sign, integer_part, fraction_part = match.groups()
    if not integer_part:
        integer_part = "0"
    return float(f"{sign}{integer_part}.{fraction_part}")


def convert_comma_numbers(apps, schema_editor):
    Examination = apps.get_model("data", "Examination")
    Dataset = apps.get_model("data", "Dataset")
    HistoricalExamination = apps.get_model("data", "Historicalexamination")

    number_fields = {
        ds.pk: {
            field
            for section in ("properties", "keys")
            for field, spec in (ds.data_schema or {}).get(section, {}).items()
            if isinstance(spec, dict) and spec.get("type") == "number"
        }
        for ds in Dataset.objects.all()
    }

    def convert(queryset):
        for exam in queryset.iterator():
            fields = number_fields.get(exam.dataset_id)
            data = exam.data
            if not fields or not isinstance(data, dict):
                continue
            changed = {}
            for field in fields:
                value = data.get(field)
                if isinstance(value, str):
                    number = to_number(value)
                    if number is not None:
                        data[field] = number
                        changed[field] = value
            if changed:
                # Signals are not active during migrations, so saving the live
                # examination does not touch the history table; history rows
                # are converted directly by the second convert() call below.
                exam.save(update_fields=["data"])
                print(
                    f"Converted examination {exam.pk} (dataset {exam.dataset_id}, "
                    f"visit {exam.visit_id}): "
                    + ", ".join(f"{f}={v!r}" for f, v in changed.items()),
                )

    convert(Examination.objects.exclude(dataset=None))
    convert(HistoricalExamination.objects.exclude(dataset=None))


def revert_comma_numbers(apps, schema_editor):
    # Cannot reliably revert: numeric values that were originally comma
    # strings are indistinguishable from values entered with a period.
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("data", "0005_remove_cell_main_datapoint_and_more"),
    ]

    operations = [
        migrations.RunPython(convert_comma_numbers, revert_comma_numbers),
    ]
