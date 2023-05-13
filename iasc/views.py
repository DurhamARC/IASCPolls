from django.contrib.auth import login, logout, get_user_model
from django.core.exceptions import ValidationError
from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.authentication import SessionAuthentication
from rest_framework.renderers import TemplateHTMLRenderer, JSONRenderer
from rest_framework.views import APIView
from rest_framework.response import Response

from iasc import models, serializers, settings
from frontend import views as frontend_views

from iasc.logic import parse_excel_sheet_to_db, create_survey_in_db


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
    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_200_OK)


class UserView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    def get(self, request):
        serializer = serializers.UserSerializer(request.user)
        return Response({"user": serializer.data}, status=status.HTTP_200_OK)


class UserViewSet(viewsets.ModelViewSet):
    UserModel = get_user_model()
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)
    serializer_class = serializers.UserSerializer
    queryset = UserModel.objects.all()


class CreateSurveyView(APIView):
    """
    Create Survey in Database
    """

    permission_classes = (permissions.IsAuthenticated,)

    if settings.DEBUG:

        def get(self, request):
            """
            Render the test survey creation form (if in DEBUG mode)
            """
            return render(request, "testsurvey.html")

    def post(self, request):
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


class UploadParticipantsView(APIView):
    """
    Upload Excel file of participants
    """

    permission_classes = (permissions.IsAuthenticated,)

    if settings.DEBUG:

        def get(self, request):
            """
            Render the test upload form (if in DEBUG mode)
            """
            return render(request, "testupload.html")

    def post(self, request):
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


class ParticipantViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = serializers.ParticipantSerializer
    queryset = (
        models.Participant.objects.prefetch_related("institution", "discipline")
        .all()
        .order_by("-email")
    )


class SurveyViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    serializer_class = serializers.SurveySerializer
    queryset = models.Survey.objects.all().order_by("-expiry")


class ActiveLinkViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = serializers.ActiveLinkSerializer
    queryset = (
        models.ActiveLink.objects.prefetch_related("participant").all().order_by("-id")
    )


class ResultViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = serializers.ResultSerializer
    queryset = (
        models.Result.objects.prefetch_related("institution", "discipline")
        .all()
        .order_by("-id")
    )
