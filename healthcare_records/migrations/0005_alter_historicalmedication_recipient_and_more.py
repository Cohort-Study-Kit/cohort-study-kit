# Generated by Django 5.1.6 on 2025-02-17 16:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("healthcare_records", "0004_remove_historicalmedication_source_type_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="historicalmedication",
            name="recipient",
            field=models.CharField(
                choices=[("proband", "Proband"), ("mother", "Proband's mother")],
                default="proband",
                max_length=7,
            ),
        ),
        migrations.AlterField(
            model_name="medication",
            name="recipient",
            field=models.CharField(
                choices=[("proband", "Proband"), ("mother", "Proband's mother")],
                default="proband",
                max_length=7,
            ),
        ),
    ]
