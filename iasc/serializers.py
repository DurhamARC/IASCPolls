from django.contrib.auth import authenticate, get_user_model
from django.utils.text import slugify
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from iasc import models

UserModel = get_user_model()


class UserLoginSerializer(serializers.ModelSerializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def check_user(self, data):
        """
        Validate and log in user
        """
        user = authenticate(username=data["username"], password=data["password"])
        if not user:
            # Backend did not authenticate the credentials
            raise ValidationError("Username or password incorrect")
        return user

    class Meta:
        model = UserModel
        fields = ("username", "password")


class UserSerializer(serializers.ModelSerializer):
    """
    Serialize a user
    """

    class Meta:
        model = UserModel
        fields = ("username",)


disciplineSlug = serializers.SlugRelatedField(
    many=False, read_only=True, slug_field="name"
)

institutionSlug = serializers.SlugRelatedField(
    many=False, read_only=True, slug_field="name"
)


class ParticipantSerializer(serializers.ModelSerializer):
    discipline = disciplineSlug
    institution = institutionSlug

    class Meta:
        model = models.Participant
        fields = ["name", "email", "institution", "discipline"]


class DisciplineSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Discipline
        fields = "__all__"


class InstitutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Institution
        fields = "__all__"


class SurveySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Survey
        fields = ["id", "question", "active", "kind", "expiry", "participants", "voted"]


class SurveyInstitutionSerializer(serializers.ModelSerializer):
    institution = serializers.ReadOnlyField(source="participant.institution.name")
    id = serializers.ReadOnlyField(source="participant.institution.id")

    class Meta:
        model = models.ActiveLink
        fields = ["id", "institution"]


class SurveyResultSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="survey.id")
    count = serializers.SerializerMethodField()
    question = serializers.CharField(source="survey.question")
    kind = serializers.CharField(source="survey.kind")
    active = serializers.CharField(source="survey.active")

    def get_count(self, obj):
        return models.Result.objects.filter(survey_id=obj.survey.id).count()

    class Meta:
        model = models.Result
        fields = ["id", "kind", "active", "question", "count"]


class ActiveLinkSerializer(serializers.ModelSerializer):
    name = serializers.ReadOnlyField(source="participant.name")
    email = serializers.ReadOnlyField(source="participant.email")

    class Meta:
        model = models.ActiveLink
        fields = ["name", "email", "hyperlink"]


class ActiveLinkSurveySerializer(ActiveLinkSerializer):
    class Meta:
        model = models.ActiveLink
        fields = ["survey", "name", "email", "hyperlink"]


class ResultSerializer(serializers.ModelSerializer):
    discipline = disciplineSlug
    institution = institutionSlug

    class Meta:
        model = models.Result
        fields = ["vote", "institution", "discipline"]


class MultiLinkSerializer(ActiveLinkSerializer):
    filename = serializers.SerializerMethodField()

    def get_filename(self, obj):
        filename = (
            f"{obj.participant.institution.id}-{obj.participant.institution.name}"
        )
        return f"IASC-{slugify(filename, allow_unicode=True)}.xlsx"

    class Meta:
        model = models.ActiveLink
        fields = ["filename", "name", "email", "hyperlink"]


class MultiResultSerializer(ResultSerializer):
    filename = serializers.SerializerMethodField()

    def get_filename(self, obj):
        filename = f"{obj.survey.id}-{obj.survey.question}"
        return f"Results-{slugify(filename, allow_unicode=True)}.xlsx"

    class Meta:
        model = models.ActiveLink
        fields = ["filename", "survey", "vote", "institution", "discipline"]
