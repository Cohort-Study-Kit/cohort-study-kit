from django.contrib.auth.decorators import login_required
from django.template.response import TemplateResponse


@login_required
def home(request, copsac_id=False, visit_id=False, examination_name=False):
    context = {}
    if copsac_id:
        context["copsac_id"] = copsac_id
    return TemplateResponse(request, "home.html", context)
