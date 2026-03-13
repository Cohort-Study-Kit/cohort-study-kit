from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("base", "0011_cpr_make_len10"),
    ]

    operations = [
        # Remove the unique_consent constraint before renaming its referenced fields
        migrations.RemoveConstraint(
            model_name="consent",
            name="unique_consent",
        ),
        migrations.RenameField(
            model_name="consent",
            old_name="fk_consent_type",
            new_name="consent_type",
        ),
        migrations.RenameField(
            model_name="consent",
            old_name="fk_proband",
            new_name="proband",
        ),
        # Re-add the unique_consent constraint with the new field names
        migrations.AddConstraint(
            model_name="consent",
            constraint=models.UniqueConstraint(
                fields=["consent_type", "proband"],
                name="unique_consent",
            ),
        ),
        migrations.RenameField(
            model_name="note",
            old_name="fk_proband",
            new_name="proband",
        ),
        migrations.RenameField(
            model_name="relative",
            old_name="fk_proband",
            new_name="proband",
        ),
    ]
