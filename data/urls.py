from django.urls import path

from .views.cell import get_cells
from .views.examination import create_examination_form
from .views.examination import delete_examination
from .views.examination import examination_form
from .views.examination import get_examinations
from .views.examination import get_external_values
from .views.examination import lock_examination
from .views.examination import save_examination
from .views.visit import delete_visit
from .views.visit import get_visits
from .views.visit import VisitView


app_name = "data"

urlpatterns = [
    path(
        r"data/examination/create/<int:copsac_id>/",
        create_examination_form,
        name="examination_form",
    ),
    path(
        r"data/examination/create/<int:copsac_id>/<int:visit_id>/",
        create_examination_form,
        name="examination_form",
    ),
    path(
        r"data/visit/create/<int:copsac_id>/",
        VisitView.as_view(),
        name="Visit_create_view",
    ),
    path(
        r"data/visit/update/<int:visit_id>/",
        VisitView.as_view(),
        name="Visit_update_view",
    ),
    path(
        r"data/examination/<int:examination_id>/",
        examination_form,
        name="examination-form",
    ),
    path(
        r"api/save_examination/",
        save_examination,
        name="save-examination",
    ),
    path(
        r"api/external_values/<int:examination_id>/<str:startdate>/",
        get_external_values,
        name="get_external_values",
    ),
    path(
        r"api/lock_examination/<int:examination_id>/",
        lock_examination,
        name="lock_examination",
    ),
    path(
        r"api/delete_examination/<int:examination_id>/",
        delete_examination,
        name="delete_examination",
    ),
    path(r"api/get_visits/<int:copsac_id>/", get_visits, name="get_visits"),
    path(r"api/delete_visit/<int:visit_id>/", delete_visit, name="delete_visit"),
    path(
        r"api/get_examinations/<int:visit_id>/",
        get_examinations,
        name="get_examinations",
    ),
    path(
        r"api/get_cells/<int:copsac_id>/<str:ds_name>/",
        get_cells,
        name="get_cells",
    ),
]
