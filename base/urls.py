from django.urls import path

from .views.address import address_overview
from .views.address import address_view
from .views.address import delete_address
from .views.address import get_addresses
from .views.consent import consent_overview
from .views.consent import ConsentView
from .views.consent import get_consents
from .views.educational_institution import delete_educational_institution
from .views.educational_institution import educational_institution_overview
from .views.educational_institution import educational_institution_view
from .views.educational_institution import get_educational_institutions
from .views.home import home
from .views.note import get_notes
from .views.note import save_note
from .views.proband import get_proband
from .views.proband import get_probands
from .views.relative import delete_relative
from .views.relative import get_relatives
from .views.relative import RelativeView
from .views.reminder import get_reminder
from .views.reminder import save_reminder
from .views.user import logout_user

app_name = "base"

urlpatterns = [
    path(
        r"address/<int:copsac_id>/",
        address_overview,
        name="address_overview",
    ),
    path(
        r"address/create/<int:copsac_id>/",
        address_view,
        name="address_create_view",
    ),
    path(
        r"address/update/<int:copsac_id>/<int:address_id>/",
        address_view,
        name="address_update_view",
    ),
    path(
        r"api/address/delete/<int:copsac_id>/<int:address_id>/",
        delete_address,
        name="address_delete_view",
    ),
    path(
        r"api/address/get/<int:copsac_id>/",
        get_addresses,
        name="address_get_view",
    ),
    path(
        r"api/address/get_current/<int:copsac_id>/",
        get_addresses,
        {"current": True},
        name="address_get_current_view",
    ),
    path(
        r"educational_institution/<int:copsac_id>/",
        educational_institution_overview,
        name="educational_institution_overview",
    ),
    path(
        r"educational_institution/create/<int:copsac_id>/",
        educational_institution_view,
        name="educational_institution_create_view",
    ),
    path(
        r"educational_institution/update/<int:copsac_id>/<int:educational_institution_id>/",
        educational_institution_view,
        name="educational_institution_update_view",
    ),
    path(
        r"api/educational_institution/delete/<int:copsac_id>/<int:educational_institution_id>/",
        delete_educational_institution,
        name="educational_institution_delete_view",
    ),
    path(
        r"api/educational_institution/get/<int:copsac_id>/",
        get_educational_institutions,
        name="educational_institution_get_view",
    ),
    path(
        r"api/educational_institution/get_current/<int:copsac_id>/",
        get_educational_institutions,
        {"current": True},
        name="educational_institution_get_current_view",
    ),
    path("", home, name="copsac_home"),
    path(r"proband/<int:copsac_id>/", home, name="proband_home"),
    path(r"proband/<int:copsac_id>/<int:visit_id>/", home, name="proband_home"),
    path(
        r"proband/<int:copsac_id>/<int:visit_id>/<str:examination_name>/",
        home,
        name="proband_home",
    ),
    path(
        r"base/consent/<int:copsac_id>/",
        consent_overview,
        name="consent_overview",
    ),
    path(
        r"base/consent/update/<int:copsac_id>/<int:consent_id>/",
        ConsentView.as_view(),
        name="Consent_update_view",
    ),
    path(
        r"base/relative/create/<int:copsac_id>/",
        RelativeView.as_view(),
        name="Relative_create_view",
    ),
    path(
        r"base/relative/update/<int:copsac_id>/<int:rel_id>/",
        RelativeView.as_view(),
        name="Relative_update_view",
    ),
    path(r"api/get_notes/<int:copsac_id>/", get_notes, name="get_notes"),
    path(r"api/save_note/<int:copsac_id>/<int:note_id>/", save_note, name="save_note"),
    path(r"api/get_relatives/<int:copsac_id>/", get_relatives, name="get_relatives"),
    path(
        r"api/delete_relative/<int:relative_id>/",
        delete_relative,
        name="delete_relative",
    ),
    path(r"api/get_consents/<int:copsac_id>/", get_consents, name="get_consents"),
    path(
        r"api/get_missing_consents/<int:copsac_id>/",
        get_consents,
        {"only_missing": True},
        name="get_missing_consents",
    ),
    path(r"api/get_proband/<int:copsac_id>/", get_proband, name="get_proband"),
    path(r"api/get_probands/", get_probands, name="get_probands"),
    path(r"api/logout_user/", logout_user, name="logout_user"),
    path(r"api/get_reminder/<int:copsac_id>/", get_reminder, name="get_reminder"),
    path(
        r"api/save_reminder/<int:copsac_id>/",
        save_reminder,
        name="save_reminder",
    ),
]
