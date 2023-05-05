from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from iasc import models

UserModel = get_user_model()


class UserLoginSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()
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
        fields = ["question", "active", "kind", "expiry", "participants", "voted"]


class ActiveLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.ActiveLink
        fields = ["participant_id", "survey_id", "unique_link"]


class ResultSerializer(serializers.ModelSerializer):
    discipline = disciplineSlug
    institution = institutionSlug

    class Meta:
        model = models.Result
        fields = ["survey_id", "vote", "institution", "discipline"]
