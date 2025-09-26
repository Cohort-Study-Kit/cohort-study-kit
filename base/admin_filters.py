import logging

from django.contrib import admin
from django.utils.translation import gettext_lazy as _

# Set up logging
logger = logging.getLogger(__name__)


class ProbandFilter(admin.FieldListFilter):
    """Custom filter for probands that uses copsac_id for efficient lookup."""

    title = _("proband (by COPSAC ID)")
    template = "admin/proband_filter.html"

    def __init__(self, field, request, params, model, model_admin, field_path):
        self.field = field
        self.field_path = field_path
        self.lookup_val = params.get(self.field_path, [""])[0]
        super().__init__(field, request, params, model, model_admin, field_path)

    def has_output(self):
        # Always show the filter
        return True

    def choices(self, changelist):
        # Provide a simple choice for our custom template
        yield {
            "selected": bool(self.lookup_val),
            "query_string": changelist.get_query_string(),
            "display": _("Filter by COPSAC ID"),
        }

    def expected_parameters(self):
        return [self.field_path]

    def has_active(self):
        """
        Return True if the filter is active (i.e., has a value).
        """
        return bool(self.lookup_val)
