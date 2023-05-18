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

        def index(self):
            """
            Render index page for test pages
            """
            return render(self, "test/index.html")

        def upload(self):
            """
            Render the test upload form (if in DEBUG mode)
            """
            return render(self, "test/upload.html")

        def survey(self):
            """
            Render the test survey creation form (if in DEBUG mode)
            """
            return render(self, "test/survey.html")

        def download(self):
            """
            Render the test link download form (if in DEBUG mode)
            """
            return render(self, "test/links.html")

        def vote(self):
            """
            Render the test voting form (if in DEBUG mode)
            """
            return render(self, "test/vote.html")

        def close(self):
            """
            Render the test survey closure form (if in DEBUG mode)
            """
            return render(self, "test/close.html")

        def results(self):
            """
            Render the test voting form (if in DEBUG mode)
            """
            return render(self, "test/results.html")
