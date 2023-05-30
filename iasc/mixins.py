import json

from django.core.exceptions import BadRequest
from django.http import HttpResponse
from django.utils.encoding import escape_uri_path
from drf_excel.mixins import XLSXFileMixin
from drf_excel.renderers import XLSXRenderer
from rest_framework.response import Response
from rest_framework import status

from iasc import renderers
from iasc.models import Institution, Survey
from iasc.utils import get_error_message


def get_survey_detail(request):
    if "survey" not in request.GET:
        raise BadRequest("Missing survey query parameter: ?survey=n")

    survey_id = request.GET["survey"]
    question = Survey.objects.filter(id=request.GET["survey"]).get().question
    question = "_".join(question.split(" ")[:3])

    return survey_id, question


class IASCZipFileMixin(object):
    filename = "IASC-{}-{}-export.zip"
    renderer_classes = (renderers.ZipXLSRenderer,)
    pagination_class = None
    xlsx_ignore_headers = ["filename"]

    def get_filename(self, request=None, *args, **kwargs):
        survey_id, question = get_survey_detail(request)
        return self.filename.format(survey_id, question)

    def finalize_response(self, request, response, *args, **kwargs):
        """
        Return the response with the proper content disposition and the customized
        filename instead of the browser default (or lack thereof).
        """
        try:
            response = super().finalize_response(request, response, *args, **kwargs)
            is_zip = response.accepted_renderer.format == "zip"

            if is_zip and isinstance(response, Response):
                response["content-disposition"] = "attachment; filename={}".format(
                    escape_uri_path(
                        self.get_filename(request=request, *args, **kwargs)
                    ),
                )

            return response

        except BadRequest as e:
            error_message = get_error_message(e)
            return HttpResponse(
                json.JSONEncoder().encode(
                    {"status": "badrequest", "message": error_message}
                ),
                content_type="application/json",
                status=status.HTTP_400_BAD_REQUEST,
            )


class IASCXLSXFileMixin(XLSXFileMixin):
    """
    Mixin class applied to classes using IASCFileMixin
    Overrides get_filename and finalize_response, and provides
    defaults for renderer_classes, column_header, body, and column_data_styles
    """

    filename_string = "IASC-{}-{}-{}.xlsx"
    renderer_classes = (XLSXRenderer,)
    pagination_class = None

    def get_filename(self, request):
        institution = "ALL"
        if "institution" in request.GET:
            institution = Institution.objects.filter(id=request.GET["institution"])
            institution = "_".join(institution.get().name.split(" "))

        survey_id, question = get_survey_detail(request)

        return self.filename_string.format(survey_id, question, institution)

    def finalize_response(self, request, response, *args, **kwargs):
        """
        Intercept response and return "HTTP 204 NO CONTENT" if no data returned from query
        (i.e. don't download empty Excel sheets)
        """
        try:
            response = super().finalize_response(request, response, *args, **kwargs)

            if len(response.data) == 0:
                return HttpResponse(
                    {"status": "notfound", "message": "No data matched the request"},
                    status=status.HTTP_404_NOT_FOUND,
                )

        except BadRequest as e:
            error_message = get_error_message(e)
            return HttpResponse(
                json.JSONEncoder().encode(
                    {"status": "badrequest", "message": error_message}
                ),
                content_type="application/json",
                status=status.HTTP_400_BAD_REQUEST,
            )

        return response

    column_header = {
        "height": 25,
        "style": {
            "fill": {
                "fill_type": "solid",
                "start_color": "FF702465",
            },
            "alignment": {
                "horizontal": "left",
                "vertical": "top",
                "wrapText": True,
                "shrink_to_fit": True,
            },
            "border_side": {
                "border_style": "thin",
                "color": "FF000000",
            },
            "font": {
                "name": "Arial",
                "size": 14,
                "bold": True,
                "color": "FFFFFFFF",
            },
        },
    }

    body = {
        "style": {
            "fill": {
                "fill_type": "none",
            },
            "alignment": {
                "horizontal": "left",
                "vertical": "top",
                "wrapText": True,
                "shrink_to_fit": True,
            },
            "border_side": {
                "border_style": "thin",
                "color": "FF000000",
            },
            "font": {
                "name": "Arial",
                "size": 14,
                "bold": False,
                "color": "FF000000",
            },
        },
        "height": 40,
    }

    column_data_styles = {
        "distance": {
            "alignment": {
                "horizontal": "left",
                "vertical": "top",
            },
            "format": "0.00E+00",
        },
        "created_at": {
            "format": "d.m.y h:mm",
        },
    }
