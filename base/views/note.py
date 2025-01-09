from django.contrib.auth.decorators import login_required
from django.http import Http404
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.views.decorators.http import require_POST

from base.models import Note
from base.models import Proband


@login_required
@require_POST
def save_note(request, copsac_id, note_id):
    note = request.POST.get("note")
    date = request.POST.get("date", None)
    response = {}
    if note_id == 0:
        proband = Proband.objects.filter(copsac_id=copsac_id).first()
        if not proband:
            raise Http404("Proband does not exist")
        p_note = Note.objects.create(fk_proband=proband, note=note)
        status = 201
    else:
        p_note = Note.objects.get(pk=note_id)
        if note == "":
            p_note.is_deleted = True
            p_note.save()
            status = 200
        elif note == p_note.note and date == p_note.date:
            status = 304
        else:
            p_note.note = note
            if date:
                p_note.date = date
            p_note.save()
            status = 200
    response["id"] = p_note.id
    response["date"] = p_note.date
    return JsonResponse(response, status=status)


@login_required
@require_GET
def get_notes(request, copsac_id):
    response = {}
    notes = []
    for note in Note.objects.filter(
        fk_proband__copsac_id=copsac_id,
        is_deleted=False,
    ).order_by("-date", "-id"):
        notes.append(
            {
                "id": note.id,
                "date": note.date,
                "note": note.note,
            },
        )
    response["notes"] = notes
    return JsonResponse(response)
