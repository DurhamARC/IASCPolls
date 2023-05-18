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
    path("create", views.index),
    path("favicon.ico", RedirectView.as_view(url=settings.STATIC_URL + "favicon.ico")),
]

if settings.DEBUG:
    urlpatterns += [
        path("test/upload", views.TestViews.upload),
        path("test/survey", views.TestViews.survey),
        path("test/download", views.TestViews.download),
        path("test/vote", views.TestViews.vote),
        path("test/close", views.TestViews.close),
        path("test/results", views.TestViews.results),
    ]
