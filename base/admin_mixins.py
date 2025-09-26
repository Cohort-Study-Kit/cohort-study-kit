from django.contrib import admin
from django.forms.widgets import Media
from django.utils.html import format_html


class SoftDeleteAdminMixin:
    """
    Admin mixin that provides default filtering for soft-deleted records.
    By default, hides deleted records. Provides option to show them.
    """

    # Override get_queryset to exclude deleted records by default
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # Handle our custom filter values
        is_deleted_value = request.GET.get("is_deleted")
        if is_deleted_value == "active":
            return qs.filter(is_deleted=False)
        elif is_deleted_value == "deleted":
            return qs.filter(is_deleted=True)
        elif is_deleted_value == "all":
            return qs
        # Default behavior - show only active
        return qs.filter(is_deleted=False)

    # Add deleted filter to list_filter if not already present
    def get_list_filter(self, request):
        list_filter = super().get_list_filter(request) or []
        if isinstance(list_filter, tuple):
            list_filter = list(list_filter)

        # Check if our custom filter is already in list_filter
        has_custom_filter = any(
            isinstance(filter_field, type) and issubclass(filter_field, IsDeletedFilter)
            for filter_field in list_filter
        )

        # Check if model has is_deleted field
        model_has_is_deleted = hasattr(
            self.model,
            "_meta",
        ) and self.model._meta.get_field("is_deleted")

        if not has_custom_filter and model_has_is_deleted:
            list_filter.append(IsDeletedFilter)

        return list_filter

    # Add visual indication for deleted records in list view
    @admin.display(
        description="Status",
        ordering="is_deleted",
    )
    def get_deleted_status(self, obj):
        if hasattr(obj, "is_deleted") and obj.is_deleted:
            return format_html('<span class="deleted-status">Deleted</span>')
        return format_html('<span class="active-status">Active</span>')

    # Override to inject our CSS and JavaScript
    @property
    def media(self):
        # Get the parent media
        media = super().media
        # Add our custom CSS and JavaScript
        media = media + Media(
            css={"all": ("/static/base/css/admin_soft_delete.css",)},
        )
        return media


# Custom filter for is_deleted with better labels
class IsDeletedFilter(admin.SimpleListFilter):
    title = "deletion status"
    parameter_name = "is_deleted"

    def lookups(self, request, model_admin):
        return (
            ("active", "Active only"),
            ("deleted", "Deleted only"),
            ("all", "All records"),
        )

    def queryset(self, request, queryset):
        if self.value() == "active":
            return queryset.filter(is_deleted=False)
        if self.value() == "deleted":
            return queryset.filter(is_deleted=True)
        if self.value() == "all":
            return queryset
        # Default behavior - show only active
        return queryset.filter(is_deleted=False)

    def choices(self, changelist):
        # Handle default selection
        current_value = self.value()
        # If no value is set, default to 'active'
        if current_value is None:
            current_value = "active"

        for lookup, title in self.lookup_choices:
            yield {
                "selected": current_value == lookup,
                "query_string": changelist.get_query_string(
                    {self.parameter_name: lookup},
                ),
                "display": title,
            }
