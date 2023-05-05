"""iasc URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path, include
from django.views.generic import RedirectView
from django.conf import settings
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from rest_framework import routers
from iasc import views


router = routers.DefaultRouter()
api_views = [
    (r"participants", views.ParticipantViewSet, "participants"),
    (r"survey", views.SurveyViewSet, "survey"),
    (r"links", views.ActiveLinkViewSet, "links"),
    (r"result", views.ResultViewSet, "result"),
]

for v in api_views:
    router.register(*v)

urlpatterns = [
    path("", include("frontend.urls"), name="index"),
    path("login", views.UserLoginView.as_view(), name="login"),
    path("api/", include(router.urls)),
    path("api/login", views.UserLoginView.as_view(), name="api/login"),
    path("admin/", admin.site.urls),
    path("favicon.ico", RedirectView.as_view(url=settings.STATIC_URL + "favicon.ico")),
]

urlpatterns += staticfiles_urlpatterns()
