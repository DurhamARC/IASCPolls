from django.contrib.auth import authenticate, get_user_model
from django.core.exceptions import ValidationError
from django.utils.text import slugify
from rest_framework import serializers

from iasc import models

VALID_SLOT_TYPES = {"likert", "checkbox"}

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


class SurveyTemplateSerializer(serializers.ModelSerializer):
    survey_count = serializers.SerializerMethodField()

    def get_survey_count(self, obj):
        return models.Survey.objects.filter(kind=obj.slug).count()

    def validate_slots(self, value):
        if not isinstance(value, list) or len(value) == 0:
            raise serializers.ValidationError("slots must be a non-empty list.")
        for i, slot in enumerate(value):
            if not isinstance(slot, dict):
                raise serializers.ValidationError(f"Slot {i} must be an object.")
            if "id" not in slot or "type" not in slot:
                raise serializers.ValidationError(
                    f"Slot {i} must have 'id' and 'type' fields."
                )
            if slot["type"] not in VALID_SLOT_TYPES:
                raise serializers.ValidationError(
                    f"Slot {i} type '{slot['type']}' is not valid. "
                    f"Valid types: {sorted(VALID_SLOT_TYPES)}"
                )
        ids = [s["id"] for s in value]
        if len(ids) != len(set(ids)):
            raise serializers.ValidationError(
                "Slot ids must be unique within a template."
            )
        return value

    def validate(self, data):
        # Block structural edits on templates that already have surveys
        if self.instance is not None:
            existing_slots = self.instance.slots
            new_slots = data.get("slots", existing_slots)
            if new_slots != existing_slots:
                survey_count = models.Survey.objects.filter(
                    kind=self.instance.slug
                ).count()
                if survey_count > 0:
                    raise serializers.ValidationError(
                        "Cannot change slot structure: surveys already exist using "
                        "this template. You may only update the label or slot "
                        "placeholder text."
                    )
        return data

    class Meta:
        model = models.SurveyTemplate
        fields = [
            "id",
            "label",
            "slug",
            "slots",
            "is_builtin",
            "survey_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["is_builtin", "created_at", "updated_at"]


class SurveySerializer(serializers.ModelSerializer):
    template_slots = serializers.SerializerMethodField()

    def get_template_slots(self, obj):
        try:
            template = models.SurveyTemplate.objects.get(slug=obj.kind)
            return template.slots
        except models.SurveyTemplate.DoesNotExist:
            return None

    class Meta:
        model = models.Survey
        fields = [
            "id",
            "question",
            "questions",
            "active",
            "kind",
            "template_slots",
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
    template_slots = serializers.SerializerMethodField()

    def get_template_slots(self, obj):
        try:
            template = models.SurveyTemplate.objects.get(slug=obj.survey.kind)
            return template.slots
        except models.SurveyTemplate.DoesNotExist:
            return None

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
            "template_slots",
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
