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
    (r"user", views.UserViewSet, "user"),
]

for v in api_views:
    router.register(*v)

urlpatterns = [
    path("", include("frontend.urls"), name="index"),
    path("login", views.UserLoginView.as_view(), name="login"),
    path("logout", views.UserLogoutView.as_view(), name="logout"),
    path("api/", include(router.urls)),
    path(
        "api/participants/upload", views.UploadParticipantsView.as_view(), name="upload"
    ),
    path("api/survey/create", views.CreateSurveyView.as_view(), name="create"),
    path("admin/", admin.site.urls),
]

urlpatterns += staticfiles_urlpatterns()
