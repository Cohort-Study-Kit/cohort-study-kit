from django.contrib import admin
from django.contrib import messages
from django.utils.translation import ngettext
from simple_history.admin import SimpleHistoryAdmin

from .admin_filters import ProbandFilter
from .admin_mixins import SoftDeleteAdminMixin
from .backoffice_admin_mixins import BackOfficeAdminMixin
from .models import Address
from .models import Cohort
from .models import Consent
from .models import ConsentType
from .models import EducationalInstitution
from .models import EducationalInstitutionStats
from .models import Note
from .models import Proband
from .models import RecruitingCenter
from .models import Relative
from .models import Site
from config.backoffice import backoffice


@admin.register(Relative)
class RelativeAdmin(SoftDeleteAdminMixin, SimpleHistoryAdmin):
    list_select_related = ["fk_proband"]
    list_display = ["fk_proband", "name", "relation_type", "get_deleted_status"]
    search_fields = ["fk_proband__copsac_id", "firstname", "lastname"]
    list_filter = [("fk_proband__copsac_id", ProbandFilter)]


# Backoffice-specific admin classes for models with is_deleted field
class RelativeBackOffice(
    SoftDeleteAdminMixin,
    BackOfficeAdminMixin,
    SimpleHistoryAdmin,
):
    list_select_related = ["fk_proband"]
    list_display = ["fk_proband", "name", "relation_type", "get_deleted_status"]
    search_fields = ["fk_proband__copsac_id", "firstname", "lastname"]
    list_filter = [("fk_proband__copsac_id", ProbandFilter)]


backoffice.register(Relative, RelativeBackOffice)


@admin.register(Note)
class NoteAdmin(SoftDeleteAdminMixin, SimpleHistoryAdmin):
    list_display = ["fk_proband", "date", "get_deleted_status"]
    list_filter = [("fk_proband__copsac_id", ProbandFilter), "date"]


class NoteBackOffice(SoftDeleteAdminMixin, BackOfficeAdminMixin, SimpleHistoryAdmin):
    list_display = ["fk_proband", "date", "get_deleted_status"]
    list_filter = [("fk_proband__copsac_id", ProbandFilter), "date"]


backoffice.register(Note, NoteBackOffice)


@admin.register(ConsentType)
class ConsentTypeAdmin(SimpleHistoryAdmin):
    list_display = ["name", "cohort"]
    search_fields = ["name"]
    list_filter = ["cohort"]
    actions = [
        "rollout_consent",
    ]

    @admin.action(description="Roll-out selected")
    def rollout_consent(self, request, queryset):
        counter = 0
        for consent_type in queryset:
            cohort = consent_type.cohort
            for proband in Proband.objects.filter(
                cohort=cohort,
                status__in=["active", "resting"],
            ):
                _consent, created = Consent.objects.get_or_create(
                    fk_proband=proband,
                    fk_consent_type=consent_type,
                    defaults={"status": "none"},
                )
                if created:
                    counter += 1
            self.message_user(
                request,
                ngettext(
                    "%d consent type was successfully rolled out.",
                    "%d consent types were successfully rolled out.",
                    counter,
                )
                % counter,
                messages.SUCCESS,
            )


class ConsentTypeBackoffice(BackOfficeAdminMixin, SimpleHistoryAdmin):
    list_display = ["name", "cohort"]
    search_fields = ["name"]
    list_filter = ["cohort"]
    actions = [
        "rollout_consent",
    ]

    @admin.action(description="Roll-out selected")
    def rollout_consent(self, request, queryset):
        counter = 0
        for consent_type in queryset:
            cohort = consent_type.cohort
            for proband in Proband.objects.filter(
                cohort=cohort,
                status__in=["active", "resting"],
            ):
                _consent, created = Consent.objects.get_or_create(
                    fk_proband=proband,
                    fk_consent_type=consent_type,
                    defaults={"status": "none"},
                )
                if created:
                    counter += 1
            self.message_user(
                request,
                ngettext(
                    "%d consent type was successfully rolled out.",
                    "%d consent types were successfully rolled out.",
                    counter,
                )
                % counter,
                messages.SUCCESS,
            )


backoffice.register(ConsentType, ConsentTypeBackoffice)


@admin.register(Consent)
class ConsentAdmin(SoftDeleteAdminMixin, SimpleHistoryAdmin):
    list_display = ["fk_proband", "fk_consent_type", "status", "get_deleted_status"]
    search_fields = ["fk_consent_type__name"]
    list_filter = [
        ("fk_proband__copsac_id", ProbandFilter),
        "status",
        "fk_consent_type",
    ]


class ConsentBackOffice(SoftDeleteAdminMixin, BackOfficeAdminMixin, SimpleHistoryAdmin):
    list_display = ["fk_proband", "fk_consent_type", "status", "get_deleted_status"]
    search_fields = ["fk_consent_type__name"]
    list_filter = [
        ("fk_proband__copsac_id", ProbandFilter),
        "status",
        "fk_consent_type",
    ]


backoffice.register(Consent, ConsentBackOffice)


@admin.register(Proband)
class ProbandAdmin(SimpleHistoryAdmin):
    list_display = ["copsac_id", "name", "cohort"]
    search_fields = ["cpr", "copsac_id", "firstname", "lastname"]
    list_filter = [
        "race",
        "sex",
        "status",
        "birthaddress",
        "site",
        "recruitingcenter",
        "cohort",
    ]


class ProbandBackoffice(BackOfficeAdminMixin, SimpleHistoryAdmin):
    list_display = ["copsac_id", "name", "cohort"]
    search_fields = ["cpr", "copsac_id", "firstname", "lastname"]
    list_filter = [
        "race",
        "sex",
        "status",
        "birthaddress",
        "site",
        "recruitingcenter",
        "cohort",
    ]


backoffice.register(Proband, ProbandBackoffice)

admin.site.register(RecruitingCenter, SimpleHistoryAdmin)


class RecruitingCenterBackoffice(BackOfficeAdminMixin, SimpleHistoryAdmin):
    pass


backoffice.register(RecruitingCenter, RecruitingCenterBackoffice)

admin.site.register(Site, SimpleHistoryAdmin)


class SiteBackoffice(BackOfficeAdminMixin, SimpleHistoryAdmin):
    pass


backoffice.register(Site, SiteBackoffice)

admin.site.register(Cohort, SimpleHistoryAdmin)


class CohortBackoffice(BackOfficeAdminMixin, SimpleHistoryAdmin):
    pass


backoffice.register(Cohort, CohortBackoffice)


@admin.register(Address)
class AddressAdmin(SoftDeleteAdminMixin, SimpleHistoryAdmin):
    list_display = [
        "proband",
        "start_date",
        "end_date",
        "street",
        "city",
        "country",
        "get_deleted_status",
    ]
    search_fields = ["street", "city", "country", "comments"]
    list_filter = [("proband__copsac_id", ProbandFilter), "start_date", "end_date"]


class AddressBackOffice(SoftDeleteAdminMixin, BackOfficeAdminMixin, SimpleHistoryAdmin):
    list_display = [
        "proband",
        "start_date",
        "end_date",
        "street",
        "city",
        "country",
        "get_deleted_status",
    ]
    search_fields = ["street", "city", "country", "comments"]
    list_filter = [("proband__copsac_id", ProbandFilter), "start_date", "end_date"]


backoffice.register(Address, AddressBackOffice)


@admin.register(EducationalInstitution)
class EducationalInstitutionAdmin(SoftDeleteAdminMixin, SimpleHistoryAdmin):
    list_display = [
        "type",
        "name",
        "start_date",
        "end_date",
        "street",
        "city",
        "country",
        "get_deleted_status",
    ]
    search_fields = ["name", "street", "city", "country", "comments"]
    list_filter = [
        ("proband__copsac_id", ProbandFilter),
        "start_date",
        "end_date",
        "type",
    ]


class EducationalInstitutionBackOffice(
    SoftDeleteAdminMixin,
    BackOfficeAdminMixin,
    SimpleHistoryAdmin,
):
    list_display = [
        "type",
        "name",
        "start_date",
        "end_date",
        "street",
        "city",
        "country",
        "get_deleted_status",
    ]
    search_fields = ["name", "street", "city", "country", "comments"]
    list_filter = [
        ("proband__copsac_id", ProbandFilter),
        "start_date",
        "end_date",
        "type",
    ]


backoffice.register(EducationalInstitution, EducationalInstitutionBackOffice)
admin.site.register(EducationalInstitutionStats, SimpleHistoryAdmin)


class EducationalInstitutionStatsBackOffice(
    SoftDeleteAdminMixin,
    BackOfficeAdminMixin,
    SimpleHistoryAdmin,
):
    pass


backoffice.register(EducationalInstitutionStats, EducationalInstitutionStatsBackOffice)
