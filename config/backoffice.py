from django.contrib import admin


class BackOffice(admin.AdminSite):
    site_header = "Back Office"
    site_title = "Back Office"
    index_title = "Welcome to the Back Office"

    def has_permission(self, request):
        if hasattr(request.user, "can_moderate"):
            return request.user.can_moderate()
        return False


backoffice = BackOffice(name="backoffice")
