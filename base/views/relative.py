import re

from django.contrib.auth.decorators import login_required
from django.contrib.auth.decorators import user_passes_test
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from django.shortcuts import redirect
from django.template.response import TemplateResponse
from django.urls import reverse
from django.views.decorators.http import require_GET
from django.views.generic import TemplateView

from .helpers import can_moderate
from base.models import Proband
from base.models import Relative
from base.models import RelativeTypes


class RelativeView(TemplateView, LoginRequiredMixin):
    template_name = "RelativeView.html"

    def get(self, request, copsac_id, rel_id=0):
        proband = Proband.objects.filter(copsac_id=copsac_id).first()
        context = {
            "copsac_id": copsac_id,
            "proband": proband,
            "relation_type_options": RelativeTypes.choices,
        }

        if rel_id > 0:  # Update relative
            rel_fields = Relative.objects.filter(id=rel_id).values().first()
            if rel_fields and "fk_proband_id" in rel_fields:
                context["proband"] = Proband.objects.filter(
                    id=rel_fields["fk_proband_id"],
                ).first()
            context["relative"] = Relative.objects.filter(id=rel_id).first()
        return TemplateResponse(request, self.template_name, context)

    def post(self, request, rel_id=0, *args, **kwargs):
        data = request.POST
        copsac_id = data["copsac_id"]
        deathdate = None
        if "dead" in data:
            deathdate = data["deathdate"]

        relative_dict = {
            "atopic_father": None,
            "allfood": None,
            "allinh": None,
            "alliv": None,
            "asthist": None,
            "astdoc": None,
            "asthmamedication": None,
            "rhinhist": None,
            "rhinmed": None,
            "rhindoctor": None,
            "dermhist": None,
            "dermmed": None,
            "dermdoctor": None,
        }
        for item in relative_dict:
            if item in data:
                relative_dict[item] = 1

        if rel_id > 0:  # Update relative
            relative = Relative.objects.filter(id=rel_id).first()
            relative.firstname = data["firstname"]
            relative.lastname = data["lastname"]
            relative.cpr = re.sub(r"\D", "", data["cpr"])
            relative.birthdate = data["birthdate"]
            relative.relation_type = data["relation_type"]
            relative.deathdate = deathdate
            relative.comments = data["comments"]
            relative.atopic_father = relative_dict["atopic_father"]
            relative.allfood = relative_dict["allfood"]
            relative.allinh = relative_dict["allinh"]
            relative.alliv = relative_dict["alliv"]
            relative.asthist = relative_dict["asthist"]
            relative.astdoc = relative_dict["astdoc"]
            relative.asthmamedication = relative_dict["asthmamedication"]
            relative.rhinhist = relative_dict["rhinhist"]
            relative.rhinmed = relative_dict["rhinmed"]
            relative.rhindoctor = relative_dict["rhindoctor"]
            relative.dermhist = relative_dict["dermhist"]
            relative.dermmed = relative_dict["dermmed"]
            relative.dermdoctor = relative_dict["dermdoctor"]
            relative.twin = data["twin"]

            relative.save()
        else:  # Create new relative
            proband = Proband.objects.filter(copsac_id=copsac_id).first()
            Relative.objects.create(
                fk_proband=proband,
                relation_type=data["relation_type"],
                deathdate=deathdate,
                firstname=data["firstname"],
                lastname=data["lastname"],
                comments=data["comments"],
                cpr=re.sub(r"\D", "", data["cpr"]),
                birthdate=data["birthdate"],
                atopic_father=relative_dict["atopic_father"],
                allfood=relative_dict["allfood"],
                allinh=relative_dict["allinh"],
                alliv=relative_dict["alliv"],
                asthist=relative_dict["asthist"],
                astdoc=relative_dict["astdoc"],
                asthmamedication=relative_dict["asthmamedication"],
                rhinhist=relative_dict["rhinhist"],
                rhinmed=relative_dict["rhinmed"],
                rhindoctor=relative_dict["rhindoctor"],
                dermhist=relative_dict["dermhist"],
                dermmed=relative_dict["dermmed"],
                dermdoctor=relative_dict["dermdoctor"],
                twin=data["twin"],
            )

        return redirect(
            reverse("base:proband_home", kwargs={"copsac_id": copsac_id}),
        )


@login_required
@require_GET
def get_relatives(self, copsac_id):
    response = {}
    relatives_query = (
        Relative.objects.filter(fk_proband__copsac_id=copsac_id, is_deleted=False)
        .values(
            "id",
            "firstname",
            "lastname",
            "relation_type",
            "twin",
            "deathdate",
            "comments",
        )
        .order_by("relation_type")
    )
    response["relatives"] = [
        [
            relative["id"],
            f'{relative["firstname"]} {relative["lastname"]}',
            relative["relation_type"],
            relative["twin"] or "",
            relative["deathdate"] or "",
            relative["comments"] or "",
        ]
        for relative in relatives_query
    ]
    return JsonResponse(response)


@login_required
@require_GET
@user_passes_test(can_moderate)
def delete_relative(request, relative_id):
    response = {}
    rel = Relative.objects.get(id=relative_id)
    rel.is_deleted = True
    rel.save()
    return JsonResponse(response)
