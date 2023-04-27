from rest_framework import serializers
from iasc import models

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
