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
    (r"participants/upload", views.UploadParticipantsView, "participants/upload"),
    (r"participants", views.ParticipantViewSet, "participants"),
    (
        r"survey/(?P<survey_id>.+)/institutions",
        views.SurveyInstitutionViewSet,
        "survey/survey_id/institutions",
    ),
    (r"institutions", views.InstitutionViewSet, "institutions"),
    (r"disciplines", views.DisciplineViewSet, "disciplines"),
    (r"survey/create", views.CreateSurveyView, "survey/create"),
    (r"survey/close", views.CloseSurveyView, "survey/close"),
    (r"survey/results", views.SurveyResultsViewSet, "survey/results"),
    (r"survey", views.SurveyViewSet, "survey"),
    (r"vote", views.SubmitVoteView, "vote"),
    (r"links/xls", views.XLSActiveLinkViewSet, "links/xls"),
    (r"links/zip", views.ZipActiveLinkViewSet, "links/zip"),
    (r"links", views.ActiveLinkViewSet, "links"),
    (r"result/xls", views.XLSResultViewSet, "result/xls"),
    (r"result/zip", views.ZipResultViewSet, "result/zip"),
    (r"result", views.ResultViewSet, "result"),
    (r"user", views.UserViewSet, "user"),
    (r"health", views.HealthCheck, "health"),
]

for v in api_views:
    router.register(*v)

urlpatterns = [
    path("", include("frontend.urls"), name="index"),
    path("login", views.UserLoginView.as_view(), name="login"),
    path("logout", views.UserLogoutView.as_view(), name="logout"),
    path("api/", include(router.urls)),
    path("admin/", admin.site.urls),
]

urlpatterns += staticfiles_urlpatterns()
