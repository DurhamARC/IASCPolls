from django.contrib.auth import authenticate, get_user_model
from django.core.exceptions import ValidationError
from django.utils.text import slugify
from rest_framework import serializers

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
        fields = ["username", "first_name"]


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
        fields = [
            "id",
            "question",
            "questions",
            "active",
            "kind",
            "hide_title",
            "expiry",
            "participants",
            "voted",
        ]


class SurveyInstitutionSerializer(serializers.ModelSerializer):
    link_count = serializers.IntegerField()
    total_count = serializers.SerializerMethodField()

    def get_total_count(self, obj):
        return obj["link_count"] + obj["voted_count"]

    class Meta:
        model = models.Institution
        fields = ["id", "name", "link_count", "total_count"]


class SurveyResultSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="survey.id")
    count = serializers.SerializerMethodField()
    vote_counts = serializers.SerializerMethodField()
    question = serializers.CharField(source="survey.question")
    questions = serializers.JSONField(source="survey.questions")
    kind = serializers.CharField(source="survey.kind")
    active = serializers.CharField(source="survey.active")
    hide_title = serializers.BooleanField(source="survey.hide_title")

    def get_count(self, obj):
        return models.Result.objects.filter(survey_id=obj.survey.id).count()

    def get_vote_counts(self, obj):
        results = models.Result.objects.filter(survey_id=obj.survey.id)
        counts = {}
        for result in results:
            if isinstance(result.vote, dict):
                # multi-question vote: {"0": 3, "1": 2, ..., "expertise": true}
                for sub_key, sub_val in result.vote.items():
                    if sub_key not in counts:
                        counts[sub_key] = {}
                    val_key = str(sub_val)
                    counts[sub_key][val_key] = counts[sub_key].get(val_key, 0) + 1
            else:
                # LI: vote is a plain integer
                key = str(result.vote)
                counts[key] = counts.get(key, 0) + 1
        return counts

    class Meta:
        model = models.Result
        fields = [
            "id",
            "kind",
            "active",
            "question",
            "questions",
            "hide_title",
            "count",
            "vote_counts",
        ]


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


class _VoteSubkeyBase:
    """
    Mixin: makes a DRF field extract a single sub-key from instance.vote (a dict).
    Must appear before the DRF field class in the MRO.
    """

    def __init__(self, vote_key, **kwargs):
        self.vote_key = vote_key
        super().__init__(**kwargs)

    def get_attribute(self, instance):
        vote = getattr(instance, "vote", None)
        if isinstance(vote, dict):
            return vote.get(self.vote_key)
        return None


class _VoteIntField(_VoteSubkeyBase, serializers.IntegerField):
    """Vote sub-key field for integer (Likert) values — rendered as a number in Excel."""

    pass


class _VoteBoolField(_VoteSubkeyBase, serializers.BooleanField):
    """Vote sub-key field for boolean (expertise checkbox) values — rendered as bool in Excel."""

    pass


class _VoteStrField(_VoteSubkeyBase, serializers.CharField):
    """Vote sub-key field for any other value type."""

    pass


def _sort_vote_items(items):
    """Sort (key, value) pairs: numeric keys (ascending) first, then alphabetical."""
    numeric = sorted(((k, v) for k, v in items if k.isdigit()), key=lambda x: int(x[0]))
    non_numeric = sorted((k, v) for k, v in items if not k.isdigit())
    return numeric + non_numeric


def _vote_field_for_value(vote_key, value):
    """Return the appropriate typed sub-key field for a given vote value."""
    if isinstance(value, bool):
        return _VoteBoolField(vote_key=vote_key, read_only=True)
    if isinstance(value, int):
        return _VoteIntField(vote_key=vote_key, read_only=True)
    return _VoteStrField(vote_key=vote_key, read_only=True)


class VoteExpandMixin:
    """
    Mixin for result serializers used in Excel export.
    When instantiated with vote_keys (a list of (key, value) pairs from a sample
    vote dict), replaces the single 'vote' field with individual typed fields:
    vote_0, vote_1, ..., vote_expertise etc.
    """

    def __init__(self, *args, vote_keys=None, **kwargs):
        super().__init__(*args, **kwargs)
        if vote_keys is not None:
            self.fields.pop("vote", None)
            for key, value in _sort_vote_items(vote_keys):
                self.fields[f"vote_{key}"] = _vote_field_for_value(key, value)


class ResultSerializer(serializers.ModelSerializer):
    discipline = disciplineSlug
    institution = institutionSlug

    class Meta:
        model = models.Result
        fields = ["vote", "institution", "discipline", "added"]


class MultiLinkSerializer(ActiveLinkSerializer):
    filename = serializers.SerializerMethodField()

    def get_filename(self, obj):
        filename = (
            f"{obj.participant.institution.id}-{obj.participant.institution.name}"
        )
        return f"CSCOPE-{slugify(filename, allow_unicode=True)}.xlsx"

    class Meta:
        model = models.ActiveLink
        fields = ["filename", "name", "email", "hyperlink"]


class MultiResultSerializer(ResultSerializer):
    filename = serializers.SerializerMethodField()

    def get_filename(self, obj):
        filename = f"{obj.survey.id}-{obj.survey.question}"
        return f"Results-{slugify(filename, allow_unicode=True)}.xlsx"

    class Meta:
        model = models.Result
        fields = ["filename", "survey", "vote", "institution", "discipline", "added"]


class XLSResultSerializer(VoteExpandMixin, ResultSerializer):
    """ResultSerializer for Excel export: expands dict votes into individual columns."""

    pass


class MultiXLSResultSerializer(VoteExpandMixin, MultiResultSerializer):
    """MultiResultSerializer for zip Excel export: expands dict votes into individual columns."""

    pass
