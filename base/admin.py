from django.contrib import admin
from django.contrib import messages
from django.utils.translation import ngettext
from simple_history.admin import SimpleHistoryAdmin

from .models import Address
from .models import Cohort
from .models import Consent
from .models import ConsentType
from .models import EducationalInstitution
from .models import Note
from .models import Proband
from .models import RecruitingCenter
from .models import Relative
from .models import Site
from config.backoffice import backoffice


@admin.register(Relative)
class RelativeAdmin(SimpleHistoryAdmin):
    list_select_related = ["fk_proband"]
    list_display = ["fk_proband", "name", "relation_type", "is_deleted"]
    search_fields = ["fk_proband__copsac_id", "firstname", "lastname"]


backoffice.register(Relative, RelativeAdmin)


admin.site.register(Note, SimpleHistoryAdmin)
backoffice.register(Note, SimpleHistoryAdmin)


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


backoffice.register(ConsentType, ConsentTypeAdmin)
admin.site.register(Consent, SimpleHistoryAdmin)
backoffice.register(Consent, SimpleHistoryAdmin)


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


backoffice.register(Proband, ProbandAdmin)

admin.site.register(RecruitingCenter, SimpleHistoryAdmin)
backoffice.register(RecruitingCenter, SimpleHistoryAdmin)

admin.site.register(Site, SimpleHistoryAdmin)
backoffice.register(Site, SimpleHistoryAdmin)

admin.site.register(Cohort, SimpleHistoryAdmin)
backoffice.register(Cohort, SimpleHistoryAdmin)


@admin.register(Address)
class AddressAdmin(SimpleHistoryAdmin):
    list_display = ["proband", "start_date", "end_date", "street", "city", "country"]
    search_fields = ["street", "city", "country", "comments"]
    list_filter = ["start_date", "end_date", "proband__copsac_id", "is_deleted"]


backoffice.register(Address, AddressAdmin)


@admin.register(EducationalInstitution)
class EducationalInstitutionAdmin(SimpleHistoryAdmin):
    list_display = [
        "type",
        "name",
        "start_date",
        "end_date",
        "street",
        "city",
        "country",
    ]
    search_fields = ["name", "street", "city", "country", "comments"]
    list_filter = ["start_date", "end_date", "type", "proband__copsac_id", "is_deleted"]


backoffice.register(EducationalInstitution, EducationalInstitutionAdmin)
