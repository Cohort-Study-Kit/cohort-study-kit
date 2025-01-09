import logging

from django.contrib.auth.decorators import login_required
from django.http import Http404
from django.http import JsonResponse

from ..models import Proband

logger = logging.getLogger(__name__)


@login_required
def get_proband(request, copsac_id):
    response = {}
    proband = Proband.objects.filter(copsac_id=copsac_id).first()
    if not proband:
        raise Http404("Proband does not exist")
    response["proband"] = {
        "name": proband.name,
        "age": proband.age,
        "cpr": proband.formatted_cpr,
        "status": proband.status,
        "divorced": proband.parents_divorced,
        "legal_guardian": proband.legal_guardian if proband.legal_guardian else "",
    }
    return JsonResponse(response)


@login_required
def get_probands(request):
    q = request.GET.get("term", "")
    response = {}
    if q.isdigit():
        probands = list(Proband.objects.filter(copsac_id__startswith=q))
    elif len(q) == 0:
        probands = Proband.objects.all()
    else:
        q = q[0].upper() + q[1:]
        probands = Proband.objects.filter(firstname__startswith=q)
    results = []
    for pb in probands:
        place_json = pb.copsac_id + " " + pb.name
        results.append(place_json)
    response["probands"] = results
    return JsonResponse(response)
