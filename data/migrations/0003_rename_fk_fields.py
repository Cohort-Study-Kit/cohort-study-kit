from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("data", "0002_alter_dataset_mtm_visit"),
        ("base", "0012_rename_fk_fields"),
    ]

    operations = [
        # --- Column: remove constraint, rename field, re-add constraint ---
        migrations.RemoveConstraint(
            model_name="column",
            name="unique_dataset_column",
        ),
        migrations.RenameField(
            model_name="column",
            old_name="fk_dataset",
            new_name="dataset",
        ),
        migrations.AddConstraint(
            model_name="column",
            constraint=models.UniqueConstraint(
                fields=["dataset", "name"],
                name="unique_dataset_column",
            ),
        ),
        # --- DatasetVisitTypeRel: remove constraint, rename fields, re-add constraint ---
        migrations.RemoveConstraint(
            model_name="datasetvisittyperel",
            name="unique_dataset_visit_type",
        ),
        migrations.RenameField(
            model_name="datasetvisittyperel",
            old_name="fk_dataset",
            new_name="dataset",
        ),
        migrations.RenameField(
            model_name="datasetvisittyperel",
            old_name="fk_visit_type",
            new_name="visit_type",
        ),
        migrations.RenameField(
            model_name="datasetvisittyperel",
            old_name="fk_helpdoc",
            new_name="helpdoc",
        ),
        migrations.AddConstraint(
            model_name="datasetvisittyperel",
            constraint=models.UniqueConstraint(
                fields=["dataset", "visit_type"],
                name="unique_dataset_visit_type",
            ),
        ),
        # --- Examination: remove index, rename fields, re-add index ---
        migrations.RemoveIndex(
            model_name="examination",
            name="data_examin_fk_visi_86163e_idx",
        ),
        migrations.RenameField(
            model_name="examination",
            old_name="fk_dataset",
            new_name="dataset",
        ),
        migrations.RenameField(
            model_name="examination",
            old_name="fk_visit",
            new_name="visit",
        ),
        migrations.AddIndex(
            model_name="examination",
            index=models.Index(
                fields=["visit"],
                name="data_examin_fk_visi_86163e_idx",
            ),
        ),
        # --- Cell: remove constraint and index, rename fields, re-add constraint and index ---
        migrations.RemoveConstraint(
            model_name="cell",
            name="unique_column_and_examination",
        ),
        migrations.RemoveIndex(
            model_name="cell",
            name="main_datapoint",
        ),
        migrations.RenameField(
            model_name="cell",
            old_name="fk_column",
            new_name="column",
        ),
        migrations.RenameField(
            model_name="cell",
            old_name="fk_examination",
            new_name="examination",
        ),
        migrations.AddConstraint(
            model_name="cell",
            constraint=models.UniqueConstraint(
                fields=["column", "examination"],
                name="unique_column_and_examination",
            ),
        ),
        migrations.AddIndex(
            model_name="cell",
            index=models.Index(
                fields=["column", "examination"],
                name="main_datapoint",
            ),
        ),
        # --- HelpData: rename field ---
        migrations.RenameField(
            model_name="helpdata",
            old_name="fk_dataset",
            new_name="dataset",
        ),
        # --- Visit: rename fields ---
        migrations.RenameField(
            model_name="visit",
            old_name="fk_proband",
            new_name="proband",
        ),
        migrations.RenameField(
            model_name="visit",
            old_name="fk_visit_type",
            new_name="visit_type",
        ),
        migrations.RenameField(
            model_name="visit",
            old_name="fk_secondary_visit_type",
            new_name="secondary_visit_type",
        ),
        # --- Dataset.mtm_visit: update through_fields to use renamed field names ---
        migrations.AlterField(
            model_name="dataset",
            name="mtm_visit",
            field=models.ManyToManyField(
                through="data.DatasetVisitTypeRel",
                through_fields=("dataset", "visit_type"),
                to="data.visittype",
            ),
        ),
    ]
