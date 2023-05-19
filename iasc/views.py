import copy

from django.contrib.auth import login, logout, get_user_model
from django.core.exceptions import ValidationError
from django.db import transaction
from django.http import HttpResponseRedirect
from django_filters import rest_framework as filters
from rest_framework import viewsets, permissions, status
from rest_framework.authentication import SessionAuthentication
from rest_framework.renderers import TemplateHTMLRenderer, JSONRenderer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from iasc import serializers, mixins
from frontend import views as frontend_views
from iasc.filters import (
    InstitutionFilter,
    ResultFilter,
    ParticipantInstitutionFilter,
    SurveyFilter,
)

from iasc.logic import parse_excel_sheet_to_db, create_survey_in_db
from iasc.models import ActiveLink, Result, Participant, Survey


#
# User management and login functionality


class UserLoginView(APIView):
    """
    Manage user logins
    """

    UserModel = get_user_model()
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (SessionAuthentication,)
    renderer_classes = (TemplateHTMLRenderer, JSONRenderer)
    queryset = UserModel.objects.all()

    def get(self, request):
        """
        Render the front-end React site on GET
        """
        return frontend_views.index(request)

    def post(self, request):
        """
        POST request for user login
        @param request: {"username": "", "password": ""}
        @return: {"first_name": ""}
        """

        # Check data is not blank
        assert len(request.data["username"])
        assert len(request.data["password"])

        serializer = serializers.UserLoginSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.check_user(request.data)
            login(request, user)
            return Response(
                {
                    "first_name": user.first_name,
                },
                status=status.HTTP_200_OK,
            )


class UserLogoutView(APIView):
    def get(self, request):
        logout(request)
        return HttpResponseRedirect("/")


class UserViewSet(viewsets.ModelViewSet):
    UserModel = get_user_model()
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)
    serializer_class = serializers.UserSerializer
    queryset = UserModel.objects.all()


#
# Survey management


class CreateSurveyView(ViewSet):
    """
    Create Survey in Database
    """

    permission_classes = (permissions.IsAuthenticated,)

    def create(self, request):
        """
        Create survey in database and associate participants with ActiveLinks
        """
        try:
            fields = {"question", "expiry"}
            if not fields <= set(request.data.keys()):
                raise ValidationError(f"Upload form missing required fields: {fields}")

            create_survey_in_db(
                request.data["question"],
                request.data["expiry"],
                kind=request.data.get("kind", True),
                active=request.data.get("active", True),
                create_active_links=request.data.get("create_active_links", True),
            )

            return Response(
                {"status": "success", "message": "Survey created."},
                status=status.HTTP_200_OK,
            )

        except ValidationError as e:
            error_message = str(e)
            return Response({"status": "error", "message": error_message})


class CloseSurveyView(ViewSet):
    """
    Close/Deactivate Survey in Database
    """

    permission_classes = (permissions.IsAuthenticated,)

    @transaction.atomic
    def create(self, request):
        survey = int(request.data["survey"].strip())
        survey = Survey.objects.filter(id=survey).get()

        if survey.active:
            survey.active = False
            survey.save()

            links = ActiveLink.objects.filter(survey=survey)
            total = links.delete()

            return Response(
                {
                    "status": "success",
                    "message": f"Closed survey {survey}: {survey.question}",
                    "deleted": total[0],
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "status": "failure",
                "message": f"Survey {survey} not active or not found",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


class SubmitVoteView(ViewSet):
    """
    Take and ActiveLink and cast a vote
    """

    permission_classes = (permissions.AllowAny,)

    def create(self, request):
        try:
            uid = request.data["unique_id"].strip()
            link = ActiveLink.objects.filter(unique_link=uid).get()
            vote = request.data["vote"].strip()
            link.vote(vote)

            return Response(
                {"status": "success", "message": "Voted"},
                status=status.HTTP_200_OK,
            )

        except (ValidationError, ActiveLink.DoesNotExist) as e:
            error_message = str(e)
            return Response({"status": "error", "message": error_message})


#
# Participant management


class UploadParticipantsView(ViewSet):
    """
    Upload Excel file of participants
    """

    permission_classes = (permissions.IsAuthenticated,)

    def create(self, request):
        """
        Upload Excel Spreadsheet with participant data
        """
        try:
            fields = {"institution", "file"}
            if not fields <= set(request.data.keys()):
                raise ValidationError(f"Upload form missing required fields: {fields}")

            # Read file into variable
            file_obj = request.data["file"]
            file_content = file_obj.read()

            parse_excel_sheet_to_db(
                file_content,
                institution=request.data["institution"],
                create_disciplines=request.data.get("create_disciplines", False),
                create_institutions=request.data.get("create_institutions", False),
                ignore_conflicts=request.data.get("ignore_conflicts", False),
            )

            return Response(
                {"status": "success", "message": "File uploaded."},
                status=status.HTTP_200_OK,
            )

        except ValidationError as e:
            error_message = str(e)
            return Response({"status": "error", "message": error_message})


#
# DRF ViewSets for getting various data


class ParticipantViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = serializers.ParticipantSerializer
    queryset = (
        Participant.objects.prefetch_related("institution", "discipline")
        .all()
        .order_by("-email")
    )
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = ParticipantInstitutionFilter


class SurveyViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    serializer_class = serializers.SurveySerializer
    queryset = Survey.objects.all().order_by("-expiry")
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = SurveyFilter


class SurveyResultsViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    queryset = Result.objects.distinct("survey_id")

    pagination_class = None
    serializer_class = serializers.SurveyResultSerializer

    def list(self, request, *args, **kwargs):
        """
        Override list method to add metadata
        """
        response = super(SurveyResultsViewSet, self).list(request, *args, **kwargs)
        response.data = {"count": len(response.data), "results": response.data}
        return response


class SurveyInstitutionViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    queryset = ActiveLink.objects.select_related("participant").distinct(
        "survey_id", "participant__institution_id"
    )
    pagination_class = None
    serializer_class = serializers.SurveyInstitutionSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = InstitutionFilter

    def list(self, request, *args, **kwargs):
        """
        Override list method to add metadata
        """
        response = super(SurveyInstitutionViewSet, self).list(request, *args, **kwargs)
        response.data = {"count": len(response.data), "results": response.data}
        return response

    def get_queryset(self):
        sid = self.kwargs["survey_id"]
        return self.queryset.filter(survey_id=sid)


class ActiveLinkViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Retrieve ActiveLinks as JSON  on route /api/links/?survey=1&institution=1
    """

    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = serializers.ActiveLinkSurveySerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = InstitutionFilter
    queryset = (
        ActiveLink.objects.prefetch_related("participant", "survey")
        .all()
        .order_by("-participant_id")
    )


class XLSActiveLinkViewSet(mixins.IASCXLSXFileMixin, ActiveLinkViewSet):
    """
    Get ActiveLinks as Excel Spreadsheet on route /api/links/xls/?survey=1&institution=1
    """

    serializer_class = serializers.ActiveLinkSerializer

    def __init__(self, **kwargs):
        super()
        self.column_header = copy.copy(self.column_header)
        self.column_header["titles"] = ["Name", "E-mail Address", "Unique Link"]
        self.column_header["column_width"] = [30, 40, 70]


class ZipActiveLinkViewSet(mixins.IASCZipFileMixin, XLSActiveLinkViewSet):
    """
    Retrieve Excel files as Zip file for multiple institutions
    """

    serializer_class = serializers.MultiLinkSerializer


class ResultViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Retrieve results as JSON on route /api/result/?survey=1&institution=1
    """

    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = serializers.ResultSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = ResultFilter

    queryset = (
        Result.objects.prefetch_related("institution", "discipline")
        .all()
        .order_by("-id")
    )


class XLSResultViewSet(mixins.IASCXLSXFileMixin, ResultViewSet):
    """
    Retrieve results as Excel Spreadsheet on route /api/result/xls/?survey=1&institution=1
    """

    filename_string = "Results-{}-{}-{}.xlsx"


class ZipResultViewSet(mixins.IASCZipFileMixin, XLSResultViewSet):
    """
    Retrieve Excel files as Zip file for multiple institutions
    """

    serializer_class = serializers.MultiResultSerializer

    def get_filename(self, request=None, *args, **kwargs):
        return "all_results.zip"
