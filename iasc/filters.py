from django_filters import rest_framework as filters

from iasc.models import Result, ActiveLink, Participant, Survey


class ResultFilter(filters.FilterSet):
    institution = filters.NumberFilter(field_name="institution_id")
    survey = filters.NumberFilter(field_name="survey_id")

    class Meta:
        model = Result
        fields = ["institution", "survey"]


class InstitutionFilter(filters.FilterSet):
    institution = filters.NumberFilter(field_name="participant__institution_id")

    class Meta:
        model = ActiveLink
        fields = ["institution", "survey"]


class ParticipantInstitutionFilter(filters.FilterSet):
    institution = filters.NumberFilter(field_name="institution_id")
    discipline = filters.NumberFilter(field_name="discipline_id")

    class Meta:
        model = Participant
        fields = ["institution", "discipline"]


class SurveyFilter(filters.FilterSet):
    active = filters.BooleanFilter(field_name="active")
    kind = filters.CharFilter(field_name="kind")

    class Meta:
        model = Survey
        fields = ["active", "kind"]
