import json
from unittest.mock import patch

from django.test import TestCase
from django.test import Client

from frontend import urls


class HTTPTestCase(TestCase):
    """
    Superclass for HTTP Test cases, providing some nice helper functions
    """

    def setUp(self):
        # Client instance to test routes
        self.client = Client()

    def GET(
        self,
        url,
        status=200,
        mimetype="text/html",
        startswith=b"<!DOCTYPE html>",
        contains=None,
    ):
        """
        Make GET request and test response for status, mimetype, start, and content
        """
        response = self.client.get(url)
        self.assertEqual(response.status_code, status)

        if mimetype:
            self.assertTrue(response.headers["Content-Type"].startswith(mimetype))
        if startswith:
            self.assertTrue(response.content.startswith(startswith))
        if contains:
            self.assertContains(response, contains)

        if response.headers["Content-Type"].startswith("application/json"):
            return json.loads(response.content)

        return response

    def POST(self, url, params, status=200, mimetype="text/html", contains=None):
        """
        Make POST request and test response
        """
        response = self.client.post(url, params)

        try:
            self.assertEqual(response.status_code, status)
            self.assertTrue(response.headers["Content-Type"].startswith(mimetype))
            if contains:
                self.assertContains(response, contains)

            if response.headers["Content-Type"].startswith("application/json"):
                return json.loads(response.content)
        except Exception as e:
            try:
                # Handle API exceptions and report reason
                ret = json.loads(response.content)
                if "message" in ret:
                    raise e.__class__(ret["message"]) from e
                raise e.__class__(ret[:100]) from e
            finally:
                raise e

        return response


class FrontendViewsTestCase(HTTPTestCase):
    @patch("webpack_loader.loader.WebpackLoader.get_bundle")
    def test_index(self, mock_wpl):
        mock_wpl.return_value = []
        self.GET("/")


class TestViewsTestCase(HTTPTestCase):
    urls = "frontend.urls"

    def setUp(self):
        super(TestViewsTestCase, self).setUp()
        self.original_urls = urls.urlpatterns
        urls.urlpatterns += urls.testpatterns

    def test_views_test(self):
        self.GET(
            "/test/",
            contains="<h1>Test Pages</h1>",
        )

    def test_views_upload(self):
        self.GET(
            "/test/upload/",
            contains="<h1>Upload Participants</h1>",
        )

    def test_views_survey(self):
        self.GET(
            "/test/survey/",
            contains="<h1>Create Survey</h1>",
        )

    def test_views_links(self):
        self.GET(
            "/test/links/",
            contains="<h1>Download Links</h1>",
        )

    def test_views_vote(self):
        self.GET(
            "/test/vote/",
            contains="<h1>Vote</h1>",
        )

    def test_views_close(self):
        self.GET(
            "/test/close/",
            contains="<h1>Close Survey</h1>",
        )

    def test_views_results(self):
        self.GET(
            "/test/results/",
            contains="<h1>Download Results</h1>",
        )

    def tearDown(self):
        super(TestViewsTestCase, self).tearDown()
        urls.urlpatterns = self.original_urls
