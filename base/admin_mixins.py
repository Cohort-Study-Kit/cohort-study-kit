from django.contrib import admin
from django.utils.html import format_html


class SoftDeleteAdminMixin:
    """
    Admin mixin that provides default filtering for soft-deleted records.
    By default, hides deleted records. Provides option to show them.
    """
    
    # Override get_queryset to exclude deleted records by default
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # Only filter out deleted records if user hasn't explicitly requested to see them
        if 'is_deleted__exact' not in request.GET:
            return qs.filter(is_deleted=False)
        return qs
    
    # Add deleted filter to list_filter if not already present
    def get_list_filter(self, request):
        list_filter = super().get_list_filter(request) or []
        if isinstance(list_filter, tuple):
            list_filter = list(list_filter)
        
        # Check if 'is_deleted' is already in list_filter
        has_is_deleted_filter = any(
            filter_field == 'is_deleted' or 
            (isinstance(filter_field, type) and issubclass(filter_field, admin.SimpleListFilter) and
             getattr(filter_field, 'parameter_name', None) == 'is_deleted')
            for filter_field in list_filter
        )
        
        # Check if model has is_deleted field
        model_has_is_deleted = False
        try:
            model_has_is_deleted = hasattr(self.model, '_meta') and \
                                  self.model._meta.get_field('is_deleted')
        except:
            pass
        
        if not has_is_deleted_filter and model_has_is_deleted:
            list_filter.append('is_deleted')
        
        return list_filter
    
    # Add visual indication for deleted records in list view
    def get_deleted_status(self, obj):
        if hasattr(obj, 'is_deleted') and obj.is_deleted:
            return format_html(
                '<span style="color: #dc3545; font-weight: bold;">Deleted</span>'
            )
        return format_html(
            '<span style="color: #28a745;">Active</span>'
        )
    get_deleted_status.short_description = 'Status'
    get_deleted_status.admin_order_field = 'is_deleted'
    
    # Override to add CSS for styling deleted rows
    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        # Add CSS to style deleted rows
        css = '''
        <style>
        .deleted-row { background-color: #f8d7da !important; }
        .deleted-row td { color: #dc3545 !important; }
        </style>
        '''
        
        # Inject our CSS into the media
        if 'media' not in extra_context:
            extra_context['media'] = {'css': {'all': (css,)}}
        else:
            existing_media = extra_context['media']
            if 'css' not in existing_media:
                existing_media['css'] = {'all': (css,)}
            elif 'all' not in existing_media['css']:
                existing_media['css']['all'] = (css,)
            else:
                existing_css = existing_media['css']['all']
                if isinstance(existing_css, (list, tuple)):
                    existing_media['css']['all'] = existing_css + (css,)
                else:
                    existing_media['css']['all'] = (existing_css, css)
        
        return super().changelist_view(request, extra_context)