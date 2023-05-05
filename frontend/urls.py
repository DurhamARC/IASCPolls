from django.urls import path
from . import views

urlpatterns = [
    path("", views.index),
    path("about", views.index),
    path("ethics", views.index),
    path("poll-temp", views.index),
    path("poll", views.index),
    path("dashboard", views.index),
]
