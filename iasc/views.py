from rest_framework import viewsets
from iasc import models, serializers


class ParticipantViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.ParticipantSerializer
    queryset = (
        models.Participant.objects.prefetch_related("institution", "discipline")
        .all()
        .order_by("-email")
    )


class SurveyViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.SurveySerializer
    queryset = models.Survey.objects.all().order_by("-expiry")


class ActiveLinkViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.ActiveLinkSerializer
    queryset = (
        models.ActiveLink.objects.prefetch_related("participant_id")
        .all()
        .order_by("-id")
    )


class ResultViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.ResultSerializer
    queryset = (
        models.Result.objects.prefetch_related("institution", "discipline")
        .all()
        .order_by("-id")
    )
