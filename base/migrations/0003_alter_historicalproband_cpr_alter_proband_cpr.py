# Generated by Django 5.1.6 on 2025-04-25 20:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("base", "0002_rename_lives_with_address_parental_presence_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="historicalproband",
            name="cpr",
            field=models.CharField(blank=True, default=None, max_length=10, null=True),
        ),
        migrations.AlterField(
            model_name="proband",
            name="cpr",
            field=models.CharField(blank=True, default=None, max_length=10, null=True),
        ),
    ]
