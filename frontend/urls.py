from django.urls import path, include
from . import views
from django.contrib import admin

urlpatterns = [
    path("", views.index),
    path("about", views.index),
    path("ethics", views.index),
    path("login", views.index),
    path("poll-temp", views.index),
    path("admin/", admin.site.urls),
    path("accounts/", include("django.contrib.auth.urls")),
    path("poll", views.index),
]
