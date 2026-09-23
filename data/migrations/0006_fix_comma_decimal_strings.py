import re

from django.db import migrations

# A single comma between digits, e.g. "1,23" but not "1,2,3" or "a,b"
COMMA_NUMBER_RE = re.compile(r"^\d+,\d+$")


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

    def convert(queryset, update_history):
        for exam in queryset.iterator():
            fields = number_fields.get(exam.dataset_id)
            data = exam.data
            if not fields or not isinstance(data, dict):
                continue
            old_data = dict(data)
            changed = {}
            for field in fields:
                value = data.get(field)
                if isinstance(value, str) and COMMA_NUMBER_RE.match(value):
                    data[field] = float(value.replace(",", "."))
                    changed[field] = value
            if changed:
                exam.save(update_fields=["data"])
                # Signals are not active during migrations, so update the
                # latest history row manually to keep the audit trail in sync.
                if update_history:
                    latest = (
                        HistoricalExamination.objects.filter(
                            examination_id=exam.pk,
                        )
                        .order_by("-history_date", "-pk")
                        .first()
                    )
                    if latest is not None and latest.data == old_data:
                        latest.data = data
                        latest.save(update_fields=["data"])
                print(
                    f"Converted examination {exam.pk} (dataset {exam.dataset_id}, "
                    f"visit {exam.visit_id}): "
                    + ", ".join(f"{f}={v!r}" for f, v in changed.items()),
                )

    convert(Examination.objects.exclude(dataset=None), update_history=False)
    convert(
        HistoricalExamination.objects.exclude(dataset=None),
        update_history=False,
    )


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
