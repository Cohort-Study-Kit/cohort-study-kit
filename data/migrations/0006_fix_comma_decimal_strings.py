import re
from decimal import Decimal, InvalidOperation

from django.db import migrations

# Whitespace around the value is ignored. Covers plain integers ("-5", "007")
# and numbers with a single decimal separator (period or comma), where the
# fractional part must have at least one digit: "1.23", "1,23", "-1.23",
# ",5", "-.5" -- but not "1,2,3", "1.2.3", "5," or "1,5x". A value is only
# converted when its float representation preserves the exact numeric value.
# Empty and whitespace-only strings become null -- the representation the
# frontend itself produces for a cleared number field. Anything else that
# cannot be converted is left untouched.
DECIMAL_RE = re.compile(r"^(-?)(\d*)([.,])(\d+)$")
INTEGER_RE = re.compile(r"^-?\d+$")


def to_number(value):
    value = value.strip()
    match = DECIMAL_RE.match(value)
    if match:
        sign, integer_part, _, fraction_part = match.groups()
        if not integer_part:
            integer_part = "0"
        text = f"{sign}{integer_part}.{fraction_part}"
    elif INTEGER_RE.match(value):
        text = value
    else:
        return None
    try:
        decimal_value = Decimal(text)
    except InvalidOperation:
        return None
    number = float(text)
    if Decimal(str(number)) != decimal_value:
        # More significant digits than a float can represent; converting
        # would silently change the numeric value.
        return None
    return number


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
                    elif not value.strip():
                        data[field] = None
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
