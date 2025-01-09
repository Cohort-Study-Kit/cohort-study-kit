import json
from copy import copy

from django import forms

from .models import Column
from .models import Dataset


class DatasetFormWidget(forms.Widget):
    class Media:
        js = ("js/dataset_form_widget.js",)
        css = {
            "all": (
                "css/dataset_form.css",
                "css/dataset_form_widget.css",
            ),
        }

    template_name = "dataset_form_widget.html"

    def __init__(self, attrs=None, mode="code", options=None, width=None, height=None):
        default_options = {
            "rowHeight": 7,
            "columnWidth": 12,
            "scale": 0.70,
        }
        if options:
            default_options.update(options)

        self.options = default_options
        self.width = width
        self.height = height

        super().__init__(attrs=attrs)

    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        options = copy(self.options)
        context["widget"]["width"] = self.width
        context["widget"]["height"] = self.height
        column_query = Column.objects.order_by("fk_dataset__name", "name")
        properties_query = Dataset.objects.filter(data_schema__properties__isnull=False)
        if hasattr(self, "instance"):
            options["dataset_name"] = self.instance.name
            options["data_schema"] = self.instance.data_schema
            options["columns"] = list(
                self.instance.column_set.all().values_list(
                    "name",
                    "title",
                    "col_format",
                ),
            )
            column_query = column_query.exclude(fk_dataset=self.instance)
            properties_query = properties_query.exclude(id=self.instance.id)
        options["external_columns"] = [
            {"dataset": column["fk_dataset__name"], "column": column["name"]}
            for column in column_query.values("fk_dataset__name", "name")
        ]
        options["external_properties"] = [
            {
                "dataset": ds["name"],
                "properties": list(ds["data_schema__properties"].keys()),
            }
            for ds in properties_query.values("name", "data_schema__properties")
        ]
        context["widget"]["options"] = json.dumps(options)

        return context
