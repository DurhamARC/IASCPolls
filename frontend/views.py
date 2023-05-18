from django.shortcuts import render

from iasc import settings


def index(request):
    """
    Render the React App on the / index route
    """
    return render(request, "index.html")


if settings.DEBUG:

    class TestViews:
        """
        Container for test view render methods. Note: used as raw functions, not django.View object.
        """

        def index(self, request):
            """
            Render index page for test pages
            """
            return render(request, "test/index.html")

        def upload(self, request):
            """
            Render the test upload form (if in DEBUG mode)
            """
            return render(request, "test/upload.html")

        def survey(self, request):
            """
            Render the test survey creation form (if in DEBUG mode)
            """
            return render(request, "test/survey.html")

        def download(self, request):
            """
            Render the test link download form (if in DEBUG mode)
            """
            return render(request, "test/download.html")

        def vote(self, request):
            """
            Render the test voting form (if in DEBUG mode)
            """
            return render(request, "test/vote.html")

        def close(self, request):
            """
            Render the test survey closure form (if in DEBUG mode)
            """
            return render(request, "test/close.html")

        def results(self, request):
            """
            Render the test voting form (if in DEBUG mode)
            """
            return render(request, "test/results.html")
