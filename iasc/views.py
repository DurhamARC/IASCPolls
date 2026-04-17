import copy

import json

from django.contrib.auth import login, logout, get_user_model
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.db import transaction, IntegrityError
from django.db.models import Count, Q
from django.db.models.functions import TruncDate
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
from iasc.models import (
    ActiveLink,
    Result,
    Participant,
    Survey,
    SurveyTemplate,
    Discipline,
    Institution,
)
from iasc.utils import (
    get_error_message,
    request_has_keys,
    validate_string,
    validate_int,
    to_boolean,
)

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
        try:
            # Check data is not blank
            if not len(request.data["username"]) or not len(request.data["password"]):
                raise ValidationError("Username and password cannot be blank")

            # Validate user login
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

        except ValidationError as e:
            error_message = get_error_message(e)
            return Response(
                {"status": "error", "message": error_message},
                status=status.HTTP_400_BAD_REQUEST,
            )


class UserLogoutView(APIView):
    def get(self, request):
        logout(request)
        return HttpResponseRedirect("/")

    def handle_exception(self, exc):
        from rest_framework.exceptions import NotAuthenticated

        if isinstance(exc, NotAuthenticated):
            return HttpResponseRedirect("/")
        return super().handle_exception(exc)


class UserViewSet(viewsets.ModelViewSet):
    UserModel = get_user_model()
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)
    serializer_class = serializers.UserSerializer
    queryset = UserModel.objects.all()
    pagination_class = None


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
            request_has_keys(request, {"question", "expiry"})

            question = request.data["question"]
            expiry = request.data["expiry"]

            validate_string(question, "Question")
            validate_string(expiry, "Expiry")

            institution = None
            if "institution" in request.data.keys():
                institution = int(request.data["institution"])
                validate_int(institution, "institution", positive=True)

            create_survey_in_db(
                question,
                expiry,
                institution=institution,
                kind=request.data.get("kind", "LI"),
                active=request.data.get("active", True),
                create_active_links=request.data.get("create_active_links", True),
                questions=(
                    json.loads(request.data["questions"])
                    if "questions" in request.data
                    else None
                ),
            )

            return Response(
                {"status": "success", "message": "Survey created."},
                status=status.HTTP_200_OK,
            )

        except (KeyError, AttributeError, ValueError) as e:
            error_message = get_error_message(e)
            return Response(
                {"status": "error", "message": error_message},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        except ValidationError as e:
            error_message = get_error_message(e)
            return Response(
                {"status": "error", "message": error_message},
                status=status.HTTP_400_BAD_REQUEST,
            )


class CloseSurveyView(ViewSet):
    """
    Close/Deactivate Survey in Database
    """

    permission_classes = (permissions.IsAuthenticated,)

    @transaction.atomic
    def create(self, request):
        try:
            request_has_keys(request, {"survey"})
            survey = request.data["survey"]
            if type(survey) is str:
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

            raise ValidationError(f"Survey {survey} not active or not found")

        except (KeyError, AttributeError) as e:
            error_message = get_error_message(e)
            return Response(
                {"status": "error", "message": error_message},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        except ValidationError as e:
            error_message = get_error_message(e)
            return Response(
                {"status": "error", "message": error_message},
                status=status.HTTP_400_BAD_REQUEST,
            )


def _expected_vote_schema(slots):
    """
    Derive expected {vote_key: slot_type} from an ordered list of template slots.
    Returns None for the single-likert case (vote is a plain integer).
    Mirrors the key encoding in SurveyForm.jsx.
    """
    if len(slots) == 1 and slots[0].type == "likert":
        return None
    schema = {}
    likert_idx = 0
    for i, slot in enumerate(slots):
        if slot.type == "likert":
            schema[str(likert_idx)] = "likert"
            likert_idx += 1
        elif slot.type == "checkbox":
            schema[str(i)] = "checkbox"
    return schema


def _validate_vote(vote, slots):
    """
    Validate a parsed vote against the survey's template slots.
    Raises ValidationError if the vote structure or values are invalid.
    """
    schema = _expected_vote_schema(slots)
    if schema is None:
        # Single-likert survey: plain integer 1–5
        if not isinstance(vote, int) or isinstance(vote, bool):
            raise ValidationError(
                "Vote must be an integer for single-question surveys."
            )
        if not 1 <= vote <= 5:
            raise ValidationError(f"Likert vote must be between 1 and 5, got {vote}.")
        return
    if not isinstance(vote, dict):
        raise ValidationError("Vote must be a JSON object for multi-question surveys.")
    submitted = set(vote.keys())
    expected = set(schema.keys())
    if submitted != expected:
        raise ValidationError(
            f"Invalid vote keys {sorted(submitted)}; expected {sorted(expected)}."
        )
    for key, slot_type in schema.items():
        value = vote[key]
        if slot_type == "likert":
            if not isinstance(value, int) or isinstance(value, bool):
                raise ValidationError(
                    f"Vote['{key}'] must be an integer, got {type(value).__name__}."
                )
            if not 1 <= value <= 5:
                raise ValidationError(
                    f"Vote['{key}'] must be between 1 and 5, got {value}."
                )
        elif slot_type == "checkbox":
            if not isinstance(value, bool):
                raise ValidationError(
                    f"Vote['{key}'] must be a boolean, got {type(value).__name__}."
                )


class SubmitVoteView(ViewSet):
    """
    Take and ActiveLink and cast a vote
    """

    permission_classes = (permissions.AllowAny,)

    def retrieve(self, request, pk=None):
        """Check whether a token is still valid (i.e. has not yet been used)."""
        if not pk:
            return Response(
                {"status": "error", "message": "No token provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        exists = ActiveLink.objects.filter(unique_link=pk.strip()).exists()
        if exists:
            return Response({"status": "valid"}, status=status.HTTP_200_OK)
        return Response(
            {
                "status": "error",
                "message": "This voting link has already been used or does not exist.",
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    def create(self, request):
        try:
            request_has_keys(request, {"unique_id", "vote"})
            validate_string(request.data["unique_id"], "Unique_id")

            uid = request.data["unique_id"].strip()
            link = ActiveLink.objects.filter(unique_link=uid).get()
            raw_vote = request.data["vote"]
            if isinstance(raw_vote, str):
                try:
                    vote = json.loads(raw_vote)
                    if not isinstance(vote, dict):
                        vote = int(vote)
                except (json.JSONDecodeError, ValueError):
                    vote = int(raw_vote)
            else:
                vote = raw_vote
            try:
                template = SurveyTemplate.objects.get(slug=link.survey.kind)
            except SurveyTemplate.DoesNotExist:
                # Should not happen: template deletion is blocked while surveys
                # reference it, but guard against inconsistent state.
                raise ValidationError(
                    f"Survey template '{link.survey.kind}' not found."
                )
            slots = list(template.slot_set.order_by("order"))
            _validate_vote(vote, slots)
            link.vote(vote)

            return Response(
                {"status": "success", "message": "Voted"},
                status=status.HTTP_200_OK,
            )

        except (KeyError, AttributeError) as e:
            error_message = get_error_message(e)
            return Response(
                {"status": "error", "message": error_message},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        except (
            ValidationError,
            ActiveLink.DoesNotExist,
        ) as e:
            error_message = get_error_message(e)
            return Response(
                {"status": "error", "message": error_message},
                status=status.HTTP_400_BAD_REQUEST,
            )


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
            # Form validation
            request_has_keys(request, {"institution", "file"})

            # Read parameters into variables
            institution = request.data["institution"]
            file_obj = request.data["file"]

            validate_string(institution, "Institution")

            # Check upload is a file
            if not type(file_obj) is InMemoryUploadedFile:
                raise ValidationError("Request did not contain a valid file")

            # Check file type is Excel Spreadsheet
            extension = file_obj.name.split(".")[-1]
            if not (
                extension == "xlsx"
                and file_obj.content_type
                in [
                    "application/vnd.ms-excel",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ]
            ):
                raise ValidationError("Uploaded file was not an Excel Spreadsheet")

            # Read file content
            file_content = file_obj.read()

            # Parse additional optional settings to Booleans
            create_disciplines = to_boolean(request, "create_disciplines")
            create_institutions = to_boolean(request, "create_institutions")
            ignore_conflicts = to_boolean(request, "ignore_conflicts")

            parse_excel_sheet_to_db(
                file_content,
                institution=request.data["institution"],
                create_disciplines=create_disciplines,
                create_institutions=create_institutions,
                ignore_conflicts=ignore_conflicts,
            )

            return Response(
                {"status": "success", "message": "File uploaded."},
                status=status.HTTP_200_OK,
            )

        except (KeyError, AttributeError) as e:
            error_message = get_error_message(e)
            return Response(
                {"status": "error", "message": error_message},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        except (IntegrityError, ValidationError, ObjectDoesNotExist) as e:
            error_message = get_error_message(e)
            return Response(
                {"status": "error", "message": error_message},
                status=status.HTTP_400_BAD_REQUEST,
            )


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


class DisciplineViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = serializers.DisciplineSerializer
    queryset = Discipline.objects.order_by("id")
    pagination_class = None


class InstitutionViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = serializers.InstitutionSerializer
    queryset = Institution.objects.order_by("name")
    pagination_class = None


class SurveyViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    serializer_class = serializers.SurveySerializer
    queryset = Survey.objects.all().order_by("-id")
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = SurveyFilter


class SurveyResultsViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    queryset = (
        Result.objects.filter(survey__isnull=False)
        .select_related("survey")
        .distinct("survey_id")
    )

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
    queryset = ActiveLink.objects.none()
    pagination_class = None
    serializer_class = serializers.SurveyInstitutionSerializer
    filter_backends = ()

    def list(self, request, *args, **kwargs):
        """
        Override list method to add metadata
        """
        response = super(SurveyInstitutionViewSet, self).list(request, *args, **kwargs)
        response.data = {"count": len(response.data), "results": response.data}
        return response

    def get_queryset(self):
        sid = self.kwargs["survey_id"]
        # Include institutions that have active links OR results for this survey.
        # Active-only filtering excludes closed surveys where all links are deleted.
        from_links = Institution.objects.filter(
            participant__activelink__survey_id=sid
        ).values("id")
        from_results = Institution.objects.filter(result__survey_id=sid).values("id")
        institution_ids = from_links.union(from_results)
        return (
            Institution.objects.filter(id__in=institution_ids)
            .annotate(
                link_count=Count(
                    "participant__activelink",
                    filter=Q(participant__activelink__survey_id=sid),
                    distinct=True,
                )
            )
            .annotate(
                voted_count=Count(
                    "result", filter=Q(result__survey_id=sid), distinct=True
                )
            )
            .values("id", "name", "link_count", "voted_count")
            .order_by("name")
        )


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
        self.column_header["titles"] = ["First Name", "E-mail Address", "Unique Link"]
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

    serializer_class = serializers.XLSResultSerializer
    filename_string = "Results-{}-{}-{}.xlsx"

    def _get_vote_keys(self):
        """Return vote (key, value) pairs if the relevant results have dict votes, else None."""
        survey_id = self.request.GET.get("survey")
        if survey_id:
            first = Result.objects.filter(survey_id=survey_id).first()
        else:
            first = Result.objects.filter(survey__isnull=False).first()
        if first and isinstance(first.vote, dict):
            return list(first.vote.items())
        return None

    def get_serializer(self, *args, **kwargs):
        vote_keys = self._get_vote_keys()
        if vote_keys is not None:
            kwargs["vote_keys"] = vote_keys
        return super().get_serializer(*args, **kwargs)


class ZipResultViewSet(mixins.IASCZipFileMixin, XLSResultViewSet):
    """
    Retrieve Excel files as Zip file for multiple institutions
    """

    serializer_class = serializers.MultiXLSResultSerializer

    def get_filename(self, request=None, *args, **kwargs):
        return "all_results.zip"


class SurveyTemplateViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoints for SurveyTemplate.

    - GET  /api/survey/templates/         — list all templates
    - GET  /api/survey/templates/<slug>/  — retrieve a single template
    - POST /api/survey/templates/         — create a new template
    - PATCH/PUT /api/survey/templates/<slug>/  — update a template
    - DELETE /api/survey/templates/<slug>/     — delete a template (blocked if builtin or referenced)
    """

    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = serializers.SurveyTemplateSerializer
    queryset = SurveyTemplate.objects.prefetch_related("slot_set").order_by("id")
    pagination_class = None
    lookup_field = "slug"

    def destroy(self, request, *args, **kwargs):
        template = self.get_object()
        if template.is_builtin:
            return Response(
                {"status": "error", "message": "Built-in templates cannot be deleted."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if Survey.objects.filter(kind=template.slug).exists():
            return Response(
                {
                    "status": "error",
                    "message": "Cannot delete a template that has surveys associated with it.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().destroy(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        template = self.get_object()
        if template.is_builtin:
            return Response(
                {
                    "status": "error",
                    "message": "Built-in templates cannot be modified.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().update(request, *args, **kwargs)


class SurveyTimeseriesView(APIView):
    """
    GET /api/survey/<survey_id>/timeseries/
    Returns daily vote counts and cumulative totals for burn-up charting.
    """

    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, survey_id):
        try:
            survey = Survey.objects.get(pk=survey_id)
        except Survey.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        rows = (
            Result.objects.filter(survey_id=survey_id)
            .annotate(date=TruncDate("added"))
            .values("date")
            .annotate(count=Count("id"))
            .order_by("date")
        )

        series = []
        cumulative = 0
        for row in rows:
            cumulative += row["count"]
            series.append(
                {
                    "date": row["date"].isoformat(),
                    "count": row["count"],
                    "cumulative": cumulative,
                }
            )

        return Response(
            {
                "participants": survey.participants,
                "expiry": survey.expiry,
                "series": series,
            }
        )


class SurveyAggregateView(APIView):
    """
    GET /api/survey/<survey_id>/aggregate/
    Returns vote_counts for a survey, optionally filtered by institution and/or discipline.
    """

    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, survey_id):
        try:
            survey = Survey.objects.get(pk=survey_id)
        except Survey.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        results = Result.objects.filter(survey_id=survey_id)
        institution_param = request.query_params.get("institution")
        discipline_id = request.query_params.get("discipline")
        if institution_param:
            ids = [int(i) for i in institution_param.split(";") if i.strip().isdigit()]
            if ids:
                results = results.filter(institution_id__in=ids)
        if discipline_id:
            results = results.filter(discipline_id=discipline_id)

        vote_counts = serializers.compute_vote_counts(results)
        data = {
            "id": survey.id,
            "question": survey.question,
            "questions": survey.questions,
            "kind": survey.kind,
            "active": survey.active,
            "hide_title": survey.hide_title,
            "participants": survey.participants,
            "voted": survey.voted,
            "count": results.count(),
            "vote_counts": vote_counts,
        }
        return Response(serializers.SurveyAggregateSerializer(data).data)


# Azure Healthcheck route
class HealthCheck(ViewSet):
    permission_classes = (permissions.AllowAny,)
    pagination_class = None

    def list(self, request):
        return Response({"status": "healthy"}, status=status.HTTP_200_OK)
