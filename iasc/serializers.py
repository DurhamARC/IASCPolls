from django.contrib.auth import authenticate, get_user_model
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


class SurveySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Survey
        fields = ["id", "question", "active", "kind", "expiry", "participants", "voted"]


class SurveyInstitutionSerializer(serializers.ModelSerializer):
    institution = serializers.ReadOnlyField(source="participant.institution.name")

    class Meta:
        model = models.ActiveLink
        fields = ["institution"]


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
        fields = ["survey", "vote", "institution", "discipline"]


class MultiFileSerializer(ActiveLinkSerializer):
    filename = serializers.SerializerMethodField()

    def get_filename(self, obj):
        return f"{obj.participant.institution.id}-{'_'.join(obj.participant.institution.name.strip().split(' '))}.xlsx"

    class Meta:
        model = models.ActiveLink
        fields = ["filename", "name", "email", "hyperlink"]
