from django.core.exceptions import BadRequest
from django.http import JsonResponse
from drf_excel.mixins import XLSXFileMixin
from drf_excel.renderers import XLSXRenderer
from rest_framework import status

from iasc.models import Institution, Survey


class IASCXLSXFileMixin(XLSXFileMixin):
    """
    Mixin class applied to classes using IASCFileMixin
    Overrides get_filename and finalize_response, and provides
    defaults for renderer_classes, column_header, body, and column_data_styles
    """

    filename_string = "IASC-{}-{}-{}.{}"
    renderer_classes = (XLSXRenderer,)
    pagination_class = None

    def get_filename(self, request):
        extension = ".xlsx"

        institution = "ALL"
        if "institution" in request.GET:
            institution = Institution.objects.filter(id=request.GET["institution"])
            institution = "_".join(institution.get().name.split(" "))

        if "survey" not in request.GET:
            raise BadRequest("Missing survey query parameter: ?survey=n")

        survey_id = request.GET["survey"]
        question = Survey.objects.filter(id=request.GET["survey"]).get().question
        question = "_".join(question.split(" ")[:3])

        return self.filename_string.format(survey_id, question, institution, extension)

    def finalize_response(self, request, response, *args, **kwargs):
        """
        Intercept response and return "HTTP 204 NO CONTENT" if no data returned from query
        (i.e. don't download empty Excel sheets)
        """
        response = super().finalize_response(request, response, *args, **kwargs)

        if len(response.data) == 0:
            return JsonResponse(
                {"status": "notfound", "message": "No data matched the request"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return response

    column_header = {
        "column_width": [30, 40, 70],
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
