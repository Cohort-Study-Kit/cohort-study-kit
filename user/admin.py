from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DefaultUserAdmin
from django.contrib.auth.models import Group
from django.utils.translation import gettext_lazy as _

from .models import User
from base.admin_pagination import AdminDynPaginationMixin
from config.backoffice import backoffice


@admin.register(User)
class UserAdmin(AdminDynPaginationMixin, DefaultUserAdmin):
    list_display = (
        "username",
        "email",
        "first_name",
        "last_name",
        "is_active",
        "is_staff",
        "is_moderator",
        "date_joined",
    )
    list_filter = (
        "is_active",
        "is_staff",
        "is_moderator",
        "is_superuser",
        "date_joined",
    )
    search_fields = ("username", "first_name", "last_name", "email")
    ordering = ("-date_joined",)

    fieldsets = (
        (None, {"fields": ("username", "password")}),
        (_("Personal info"), {"fields": ("first_name", "last_name", "email")}),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_moderator",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )


backoffice.register(User, UserAdmin)

admin.site.unregister(Group)
