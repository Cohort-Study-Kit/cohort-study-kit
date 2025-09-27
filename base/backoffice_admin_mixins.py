class BackOfficeAdminMixin:
    """
    Admin mixin for backoffice that disables actual deletion
    and only allows soft deletion via the mark_as_deleted action.
    """

    def has_delete_permission(self, request, obj=None):
        """
        Disable delete permission in backoffice.
        This prevents both individual object deletion and bulk deletion.
        """
        return False

    def get_actions(self, request):
        """
        Remove the default delete action from the actions list
        and ensure mark_as_deleted is available for models with is_deleted field.
        """
        actions = super().get_actions(request)

        # Remove the default delete_selected action
        if "delete_selected" in actions:
            del actions["delete_selected"]

        # Add mark_as_deleted if model has is_deleted field
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

        return actions
