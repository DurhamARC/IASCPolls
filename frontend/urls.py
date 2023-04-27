from django.urls import path, include
from . import views
from django.contrib import admin

urlpatterns = [
    path("", views.index),
    path("about", views.index),
    path("ethics", views.index),
    path("login", views.index),
    path("poll-temp", views.index),
    path("poll", views.index),
    path("dashboard", views.index),
    path("admin/", admin.site.urls),
]
