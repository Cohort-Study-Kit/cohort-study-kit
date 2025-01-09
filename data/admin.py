from inspect import signature

from django import forms
from django.contrib import admin
from django.contrib import messages
from django.db.models import CharField
from django.db.models import F
from django.forms import TextInput
from django.urls import reverse
from django.utils.translation import ngettext
from django_json_widget.widgets import JSONEditorWidget
from simple_history.admin import SimpleHistoryAdmin

from .models import Cell
from .models import Column
from .models import Dataset
from .models import DatasetVisitTypeRel
from .models import Examination
from .models import HelpData
from .models import HelpDoc
from .models import Visit
from .models import VisitType
from .widgets import DatasetFormWidget
from base.models import Proband
from config.backoffice import backoffice


@admin.register(Column)
class ColumnAdmin(SimpleHistoryAdmin):
    list_display = ["fk_dataset", "name"]
    search_fields = ["name"]
    list_filter = ["fk_dataset"]


backoffice.register(Column, ColumnAdmin)


class DatasetVisitTypeRelInline(admin.TabularInline):
    model = DatasetVisitTypeRel


@admin.register(VisitType)
class VisitTypeAdmin(SimpleHistoryAdmin):
    inlines = [
        DatasetVisitTypeRelInline,
    ]
    actions = [
        "rollout_visit",
    ]

    @admin.action(description="Roll-out selected")
    def rollout_visit(self, request, queryset):
        counter = 0
        for visit_type in queryset:
            cohort = visit_type.cohort
            visit_created = False
            for proband in Proband.objects.filter(
                cohort=cohort,
                status__in=["active", "resting"],
            ):
                visit, created = Visit.objects.get_or_create(
                    fk_proband=proband,
                    fk_visit_type=visit_type,
                    defaults={"status": "planned"},
                )
                if not created:
                    continue
                visit_created = True
                for dataset in visit_type.dataset_set.all():
                    Examination.objects.create(
                        fk_visit=visit,
                        fk_dataset=dataset,
                        status="planned",
                    )
            if visit_created:
                counter += 1
        self.message_user(
            request,
            ngettext(
                "%d visit was successfully rolled out.",
                "%d visits were successfully rolled out.",
                counter,
            )
            % counter,
            messages.SUCCESS,
        )


backoffice.register(VisitType, VisitTypeAdmin)
admin.site.register(DatasetVisitTypeRel, SimpleHistoryAdmin)
backoffice.register(DatasetVisitTypeRel, SimpleHistoryAdmin)

admin.site.register(HelpDoc, SimpleHistoryAdmin)
backoffice.register(HelpDoc, SimpleHistoryAdmin)


@admin.register(HelpData)
class HelpDataAdmin(SimpleHistoryAdmin):
    list_display = ["fk_dataset", "col_1", "col_2", "lookup_value"]
    search_fields = ["col_1", "col_2", "lookup_value"]
    list_filter = ["fk_dataset"]


backoffice.register(HelpData, HelpDataAdmin)


class ColumnInline(admin.TabularInline):
    model = Column
    ordering = [F("display_order").asc(nulls_last=True), "name"]
    formfield_overrides = {
        CharField: {"widget": TextInput(attrs={"size": "15"})},
    }

    def get_formset(self, request, obj=None, **kwargs):
        formset = super().get_formset(request, obj, **kwargs)
        formset.form.base_fields["display_order"].widget.attrs["style"] = "width: 30px;"
        formset.form.base_fields["name"].widget.attrs["style"] = "width: 150px;"
        return formset


class JSONEditorSchemaReplacementWidget(JSONEditorWidget):
    def __init__(
        self,
        schema=None,
        model_name="",
        file_handler="",
        validate_on_submit=False,
        mode="code",
        options=None,
        width=None,
        height=None,
        attrs=None,
    ):
        default_options = {
            "modes": ["text", "code", "tree", "form", "view"],
            "mode": mode,
            "search": True,
        }
        if options:
            default_options.update(options)

        self.options = default_options
        self.width = width
        self.height = height

        super().__init__(attrs=attrs)
        if schema:
            self.schema = schema
        else:
            self.schema = {"type": "dict"}
        self.model_name = model_name
        self.file_handler = file_handler
        self.validate_on_submit = validate_on_submit

    def get_schema(self):
        """Returns the schema attached to this widget.

        If the schema is a callable, it will return the result of the callable.
        """
        if callable(self.schema):
            if hasattr(self, "instance") and len(signature(self.schema).parameters):
                schema = self.schema(self.instance)
            else:
                schema = self.schema()
        else:
            schema = self.schema

        return schema

    def add_error(self, error_map):
        pass


class DatasetAdminForm(forms.ModelForm):
    class Meta:
        model = Dataset
        widgets = {
            "data_schema": JSONEditorWidget,
            "form": JSONEditorWidget,
            "status_choices": JSONEditorSchemaReplacementWidget,
        }
        fields = "__all__"


@admin.register(Dataset)
class DatasetAdmin(admin.ModelAdmin):
    list_display = ["name", "cohort"]
    search_fields = ["name"]
    list_filter = ["cohort"]
    inlines = [
        ColumnInline,
        DatasetVisitTypeRelInline,
    ]
    actions = [
        "duplicate_dataset",
    ]
    form = DatasetAdminForm

    @admin.action(description="Duplicate selected")
    def duplicate_dataset(self, request, queryset):
        counter = 0
        for dataset in queryset:
            columns = list(dataset.column_set.all())
            dataset.id = None
            dataset.name = f"Copy of {dataset.name}"
            dataset.save()
            for column in columns:
                column.fk_dataset_id = dataset.id
                column.id = None
                column.save()
            counter += 1
        self.message_user(
            request,
            ngettext(
                "%d dataset was successfully duplicated.",
                "%d datasets were successfully duplicated.",
                counter,
            )
            % counter,
            messages.SUCCESS,
        )


class DatasetBackOfficeForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["form"].widget.instance = self.instance

    class Meta:
        model = Dataset
        widgets = {
            "data_schema": JSONEditorWidget,
            "form": DatasetFormWidget,
        }
        fields = "__all__"


class DatasetBackoffice(admin.ModelAdmin):
    list_display = ["name", "cohort"]
    search_fields = ["name"]
    list_filter = ["cohort"]
    inlines = [
        ColumnInline,
        DatasetVisitTypeRelInline,
    ]
    actions = [
        "duplicate_dataset",
    ]
    form = DatasetBackOfficeForm

    @admin.action(description="Duplicate selected")
    def duplicate_dataset(self, request, queryset):
        counter = 0
        for dataset in queryset:
            columns = list(dataset.column_set.all())
            dataset.id = None
            dataset.name = f"Copy of {dataset.name}"
            dataset.save()
            for column in columns:
                column.fk_dataset_id = dataset.id
                column.id = None
                column.save()
            counter += 1
        self.message_user(
            request,
            ngettext(
                "%d dataset was successfully duplicated.",
                "%d datasets were successfully duplicated.",
                counter,
            )
            % counter,
            messages.SUCCESS,
        )

    def save_formset(self, request, form, formset, change):
        super().save_formset(request, form, formset, change)
        obj = form.instance
        if obj.pk:
            for order, column in enumerate(
                obj.column_set.filter(display_order__isnull=False).order_by(
                    "display_order",
                ),
            ):
                if column.display_order != (order + 1):
                    column.display_order = order + 1
                    column.save()

    def save_model(self, request, obj, form, change):
        obj.name = obj.name.lower().strip()
        super().save_model(request, obj, form, change)


backoffice.register(Dataset, DatasetBackoffice)


@admin.register(Cell)
class CellAdmin(admin.ModelAdmin):
    search_fields = ["fk_column__name"]
    list_select_related = ["fk_examination", "fk_column"]
    list_display = ["fk_examination", "fk_column", "value"]
    raw_id_fields = ["fk_examination"]


backoffice.register(Cell, CellAdmin)


class ExaminationBackOfficeForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["status"].choices = self.instance.get_status_choices()
        self.fields["data"].widget.instance = self.instance

    class Meta:
        model = Examination
        widgets = {"data": JSONEditorSchemaReplacementWidget}
        fields = "__all__"


class CellInline(admin.TabularInline):
    model = Cell
    ordering = [F("fk_column__display_order").asc(nulls_last=True), "fk_column__name"]


class ExaminationBackOffice(admin.ModelAdmin):
    list_select_related = [
        "fk_visit",
        "fk_visit__fk_visit_type",
        "fk_dataset",
    ]
    list_display = [
        "fk_visit",
        "fk_dataset",
    ]
    raw_id_fields = [
        "fk_visit",
        "fk_dataset",
    ]
    inlines = [
        CellInline,
    ]

    list_filter = ["fk_dataset"]
    form = ExaminationBackOfficeForm

    def view_on_site(self, obj):
        return reverse("data:examination-form", args=(obj.pk,))

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        if (
            hasattr(obj, "fk_dataset")
            and obj.fk_dataset
            and not obj.fk_dataset.use_finishdate
            and "finishdate" in form.base_fields
        ):
            del form.base_fields["finishdate"]
        return form


backoffice.register(Examination, ExaminationBackOffice)


class ExaminationAdminForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["status"].choices = self.instance.get_status_choices()
        self.fields["data"].widget.instance = self.instance

    class Meta:
        model = Examination
        widgets = {"data": JSONEditorSchemaReplacementWidget}
        fields = "__all__"


@admin.register(Examination)
class ExaminationAdmin(admin.ModelAdmin):
    list_select_related = [
        "fk_visit",
        "fk_visit__fk_visit_type",
        "fk_dataset",
    ]
    list_display = [
        "fk_visit",
        "fk_dataset",
    ]
    raw_id_fields = [
        "fk_visit",
        "fk_dataset",
    ]
    inlines = [
        CellInline,
    ]

    list_filter = ["fk_dataset"]
    form = ExaminationAdminForm

    def view_on_site(self, obj):
        return reverse("data:examination-form", args=(obj.pk,))


class ExaminationInline(admin.TabularInline):
    model = Examination


@admin.register(Visit)
class VisitAdmin(admin.ModelAdmin):
    list_select_related = [
        "fk_proband",
        "fk_visit_type",
    ]
    list_display = [
        "fk_proband",
        "fk_visit_type",
    ]
    inlines = [
        ExaminationInline,
    ]


backoffice.register(Visit, VisitAdmin)
