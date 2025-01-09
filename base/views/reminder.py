from django.contrib.auth.decorators import login_required
from django.http import Http404
from django.http import JsonResponse
from django.views.decorators.http import require_POST

from ..models import Proband


def get_reminder(request, copsac_id):
    response = {}
    proband = Proband.objects.filter(copsac_id=copsac_id).first()
    if not proband:
        raise Http404("Proband does not exist")
    response["reminder"] = proband.reminder if proband.reminder else ""
    return JsonResponse(response)


@login_required
@require_POST
def save_reminder(request, copsac_id):
    response = {}
    proband = Proband.objects.filter(copsac_id=copsac_id).first()
    proband.reminder = request.POST.get("value")
    proband.save()
    return JsonResponse(response)
