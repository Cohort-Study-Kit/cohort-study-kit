from django.conf import settings
from django.contrib import admin
from django.contrib.auth.views import LoginView
from django.urls import include
from django.urls import path
from django.views.i18n import JavaScriptCatalog

from .backoffice import backoffice

urlpatterns = [
    path("", include("data.urls", namespace="data")),
    path("", include("healthcare_records.urls", namespace="healthcare_records")),
    path("", include("base.urls", namespace="base")),
    path(r"accounts/", include("django.contrib.auth.urls")),
    path(
        "api/jsi18n/",
        JavaScriptCatalog.as_view(),
        name="javascript-catalog",
    ),
    path("login/", LoginView.as_view(), name="login"),
    path("admin/", admin.site.urls),
    path("backoffice/", backoffice.urls),
]

if settings.DEBUG:
    urlpatterns += [
        path("__reload__/", include("django_browser_reload.urls")),
    ]
