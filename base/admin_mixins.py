from django.contrib import admin
from django.forms.widgets import Media
from django.utils.html import format_html


class SoftDeleteAdminMixin:
    """
    Admin mixin that provides default filtering for soft-deleted records.
    By default, hides deleted records. Provides option to show them.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Add mark_as_deleted to actions if model has is_deleted field
        if hasattr(self.model, "_meta") and "is_deleted" in [
            f.name for f in self.model._meta.get_fields()
        ]:
            if not hasattr(self, "actions") or self.actions is None:
                self.actions = []
            elif not isinstance(self.actions, list):
                self.actions = list(self.actions)

            # Only add the action if it's not already there
            if "mark_as_deleted" not in self.actions:
                self.actions.append("mark_as_deleted")

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
        ) and "is_deleted" in [f.name for f in self.model._meta.get_fields()]

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

    @admin.action(description="Mark selected items as deleted")
    def mark_as_deleted(self, request, queryset):
        """Mark selected objects as deleted by setting is_deleted=True"""
        updated_count = queryset.update(is_deleted=True)
        self.message_user(
            request,
            f"Successfully marked {updated_count} {self.model._meta.verbose_name_plural} as deleted.",
        )

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
