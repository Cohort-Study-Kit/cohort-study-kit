from django.contrib.admin.views.main import ChangeList


class DynPaginationChangeList(ChangeList):
    """
    Custom ChangeList that supports dynamic pagination via URL parameter.
    """

    def __init__(
        self,
        request,
        model,
        list_display,
        list_display_links,
        list_filter,
        date_hierarchy,
        search_fields,
        list_select_related,
        list_per_page,
        list_max_show_all,
        list_editable,
        model_admin,
        sortable_by,
        search_help_text,
    ):
        # Override list_per_page if present in URL parameter
        page_param = request.GET.get("list_per_page")
        if page_param is not None and page_param.isdigit():
            list_per_page = int(page_param)

        super().__init__(
            request,
            model,
            list_display,
            list_display_links,
            list_filter,
            date_hierarchy,
            search_fields,
            list_select_related,
            list_per_page,
            list_max_show_all,
            list_editable,
            model_admin,
            sortable_by,
            search_help_text,
        )

    def get_filters_params(self, params=None):
        """
        Return all params except IGNORED_PARAMS and 'list_per_page' to avoid
        including pagination parameter in filter links.
        """
        lookup_params = super().get_filters_params(params)
        if "list_per_page" in lookup_params:
            del lookup_params["list_per_page"]
        return lookup_params


class AdminDynPaginationMixin:
    """
    Mixin for ModelAdmin classes to enable dynamic pagination.
    """

    def get_changelist(self, request, **kwargs):
        return DynPaginationChangeList

    def changelist_view(self, request, extra_context=None):
        # Set default list_per_page if not already set
        if not hasattr(self, "list_per_page") or self.list_per_page is None:
            self.list_per_page = 100

        # Dynamically set the list_per_page based on query parameter
        page_param = request.GET.get("list_per_page")
        if page_param is not None and page_param.isdigit():
            self.list_per_page = int(page_param)

        return super().changelist_view(request, extra_context)
