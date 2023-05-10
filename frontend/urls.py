from django.urls import path
from . import views
from django.views.generic import RedirectView
from django.conf import settings

urlpatterns = [
    path("", views.index),
    path("about", views.index),
    path("ethics", views.index),
    path("poll-temp", views.index),
    path("poll", views.index),
    path("dashboard", views.index),
    path("favicon.ico", RedirectView.as_view(url=settings.STATIC_URL + "favicon.ico")),
]
