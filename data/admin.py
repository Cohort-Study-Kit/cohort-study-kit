from inspect import signature

from django import forms
from django.contrib import admin
from django.contrib import messages
from django.contrib.admin import helpers
from django.db import transaction
from django.db.models import CharField
from django.db.models import F
from django.forms import TextInput
from django.http import HttpResponseRedirect
from django.shortcuts import render, get_object_or_404
from django.urls import reverse
from django.utils.translation import ngettext
from django_json_widget.widgets import JSONEditorWidget
from simple_history.admin import SimpleHistoryAdmin

from base.admin_mixins import SoftDeleteAdminMixin
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


class ExaminationBackOffice(SoftDeleteAdminMixin, admin.ModelAdmin):
    list_select_related = [
        "fk_visit",
        "fk_visit__fk_visit_type",
        "fk_dataset",
    ]
    list_display = [
        "fk_visit",
        "fk_dataset",
        "get_deleted_status",
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
class ExaminationAdmin(SoftDeleteAdminMixin, admin.ModelAdmin):
    list_select_related = [
        "fk_visit",
        "fk_visit__fk_visit_type",
        "fk_dataset",
    ]
    list_display = [
        "fk_visit",
        "fk_dataset",
        "get_deleted_status",
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


class MergeVisitsForm(forms.Form):
    keep_visit = forms.ModelChoiceField(
        queryset=Visit.objects.none(),
        widget=forms.RadioSelect,
        empty_label=None,
        label="Select the visit to keep",
    )

    def __init__(self, *args, visits=None, **kwargs):
        super().__init__(*args, **kwargs)
        if visits is not None:
            # Convert list to queryset if needed
            if isinstance(visits, list):
                visit_ids = [visit.pk for visit in visits]
                self.fields['keep_visit'].queryset = Visit.objects.filter(pk__in=visit_ids)
            else:
                self.fields['keep_visit'].queryset = visits
            # Set initial value to the first visit
            if visits:
                if isinstance(visits, list):
                    self.fields['keep_visit'].initial = visits[0].pk
                else:
                    first_visit = visits.first()
                    if first_visit:
                        self.fields['keep_visit'].initial = first_visit.pk


@admin.register(Visit)
class VisitAdmin(SoftDeleteAdminMixin, admin.ModelAdmin):
    # Add the custom URL for the merge form
    def get_urls(self):
        from django.urls import path
        urls = super().get_urls()
        custom_urls = [
            path('merge/', self.merge_form_view, name='data_visit_merge'),
        ]
        return custom_urls + urls
    list_select_related = [
        "fk_proband",
        "fk_visit_type",
    ]
    list_display = [
        "fk_proband",
        "fk_visit_type",
        "get_deleted_status",
    ]
    inlines = [
        ExaminationInline,
    ]
    actions = ["merge_visits"]

    @admin.action(description="Merge selected visits")
    def merge_visits(self, request, queryset):
        visits = list(queryset)

        # Check if we have at least 2 visits
        if len(visits) < 2:
            self.message_user(
                request,
                "You need to select at least 2 visits to merge.",
                messages.WARNING,
            )
            return

        # Check if all visits belong to the same proband
        probands = {visit.fk_proband for visit in visits}
        if len(probands) > 1:
            self.message_user(
                request,
                "All selected visits must belong to the same proband.",
                messages.ERROR,
            )
            return

        # Store the selected visit IDs in the session
        request.session['merge_visit_ids'] = [visit.pk for visit in visits]

        # Redirect to the merge form view
        return HttpResponseRedirect(reverse('admin:data_visit_merge'))

    # Custom view for merge form
    def merge_form_view(self, request):
        # Get the visit IDs from the session
        visit_ids = request.session.get('merge_visit_ids', [])
        if not visit_ids:
            self.message_user(request, "No visits selected for merging.", messages.ERROR)
            return HttpResponseRedirect(reverse('admin:data_visit_changelist'))

        # Get the visits
        visits = list(Visit.objects.filter(pk__in=visit_ids))

        # Check if we have at least 2 visits
        if len(visits) < 2:
            self.message_user(request, "You need to select at least 2 visits to merge.", messages.WARNING)
            return HttpResponseRedirect(reverse('admin:data_visit_changelist'))

        # Check if all visits belong to the same proband
        probands = {visit.fk_proband for visit in visits}
        if len(probands) > 1:
            self.message_user(request, "All selected visits must belong to the same proband.", messages.ERROR)
            return HttpResponseRedirect(reverse('admin:data_visit_changelist'))

        if request.method == 'POST':
            form = MergeVisitsForm(request.POST, visits=visits)
            if form.is_valid():
                keep_visit = form.cleaned_data['keep_visit']

                # Get visits to delete (all except the one we're keeping)
                delete_visits = [v for v in visits if v.pk != keep_visit.pk]

                # Perform the merge in a transaction
                with transaction.atomic():
                    # Reassign all examinations from delete_visits to keep_visit
                    Examination.objects.filter(fk_visit__in=delete_visits).update(fk_visit=keep_visit)

                    # Mark delete_visits as deleted
                    Visit.objects.filter(pk__in=[v.pk for v in delete_visits]).update(is_deleted=True)

                self.message_user(
                    request,
                    f"Successfully merged {len(delete_visits)} visits into {keep_visit}.",
                    messages.SUCCESS,
                )
                # Clean up session
                if 'merge_visit_ids' in request.session:
                    del request.session['merge_visit_ids']
                return HttpResponseRedirect(reverse('admin:data_visit_changelist'))
            else:
                # Form is not valid, show errors
                pass
        else:
            form = MergeVisitsForm(visits=visits)

        context = {
            'form': form,
            'visits': visits,
            'title': 'Merge Visits',
            'opts': self.model._meta,
        }

        return render(request, 'admin/data/visit/merge_visits.html', context)



backoffice.register(Visit, VisitAdmin)
