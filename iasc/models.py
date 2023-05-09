from django.db import models
from django.utils.translation import gettext_lazy
import datetime


class Institution(models.Model):
    """
    Institutions by name and ID
    Instead of storing strings on every participant, instead normalise the database and prevent redundant data
    """

    name = models.CharField(
        max_length=255,
        db_index=True,
        help_text="Institution Name, e.g. Durham University",
    )
    # Could use `django-countries` https://github.com/SmileyChris/django-countries/ to normalise this further
    country = models.CharField(max_length=255, help_text="Host Country")

    def __str__(self):
        return f"{self.name} ({self.id})"


class Discipline(models.Model):
    """
    Table storing a collection of scientific disciplines
    Linked to from the Participants and Results tables
    """

    name = models.CharField(
        max_length=255,
        db_index=True,
        help_text="Scientific Discipline, e.g. 'Physicist'",
    )

    def __str__(self):
        return f"{self.name} ({self.id})"


class Participant(models.Model):
    """
    Participants' data model, storing scientist details and demographics
    Data is imported from Excel spreadsheets
    """

    # ID is automatically added by Django using DEFAULT_AUTO_FIELD
    # id = models.BigAutoField(primary_key=True, null=False)
    name = models.CharField(max_length=255, help_text="First & Family/Surname")
    title = models.CharField(
        max_length=32, null=True, blank=True, help_text="Participant Title"
    )
    email = models.CharField(max_length=255, help_text="Participant Email")
    institution = models.ForeignKey("Institution", on_delete=models.RESTRICT)
    discipline = models.ForeignKey("Discipline", on_delete=models.RESTRICT)

    # If we decide to split name into first name/surname, we will need two things:
    # Firstly, we should store name order (e.g. Eastern or Western style)
    # Secondly, a method to join them up again:
    #    @property
    #    def full_name(self):
    #        "Returns the person's full name."
    #        return (name_order == 'EA')
    #               ? f"{self.first_name} {self.last_name}"
    #               : f"{self.first_name} {self.last_name}"

    class Meta:
        ordering = ["-email"]

    def __str__(self):
        return f"{self.title} {self.name} <{self.email}>"


class Survey(models.Model):
    """
    Surveys data model, storing active surveys.
    There may be more than one survey at any given time
    """

    class SurveyKind(models.TextChoices):
        """
        Survey kinds. Provided to extend tool to different kinds of survey. Just add options to list
        https://stackoverflow.com/questions/54802616/how-can-one-use-enums-as-a-choice-field-in-a-django-model
        """

        LIKERT = "LI", gettext_lazy("Likert")

    question = models.TextField()
    active = models.BooleanField()
    kind = models.CharField(
        max_length=2, choices=SurveyKind.choices, default=SurveyKind.LIKERT
    )
    expiry = models.DateTimeField(
        null=False, default=datetime.datetime(2000, 1, 1, 0, 0)
    )
    participants = models.IntegerField(null=False, default=0)
    voted = models.IntegerField(null=False, default=0)

    def get_survey_kind(self) -> SurveyKind:
        # Get value from choices enum
        return self.SurveyKind[self.kind]

    def __str__(self):
        return f"{self.id}: {self.question[:75] if len(self.question) > 75 else self.question}"


class ActiveLink(models.Model):
    """
    ActiveLink temporarily links participant responses to identities in the database, while the survey is running
    """

    # Composite key
    # https://stackoverflow.com/questions/16800375/how-can-i-set-two-primary-key-fields-for-my-models-in-django
    participant_id = models.ForeignKey("Participant", on_delete=models.CASCADE)
    survey_id = models.ForeignKey("Survey", null=True, on_delete=models.SET_NULL)
    unique_link = models.CharField(
        max_length=255, help_text="Per-participant / survey unique voting link"
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["participant_id", "survey_id"],
                name="unique_migration_host_combination",
            )
        ]
        indexes = [models.Index(fields=["unique_link"])]

    def vote(self, vote: models.JSONField):
        participant = Participant.objects.get(id=self.participant_id.id)
        result = Result.objects.create(
            unique_link=self,
            survey_id=self.survey_id,
            vote=vote,
            institution=participant.institution,
            discipline=participant.discipline,
        )
        self.delete()
        return result

    def __str__(self):
        return f"{self.unique_link}"


class Result(models.Model):
    """
    Results table is populated when a vote is cast.

    Demographic information is copied from the Participant table, but is not linked directly to the participant.
    References to identities must be broken when an entry in the Active Links table is deleted. We therefore copy
    the demographic data into the Results table at the time when that link is broken (i.e., when a vote is cast).
    """

    unique_link = models.ForeignKey("ActiveLink", null=True, on_delete=models.SET_NULL)
    survey_id = models.ForeignKey("Survey", null=True, on_delete=models.SET_NULL)
    vote = models.JSONField(null=False, blank=False)
    institution = models.ForeignKey("Institution", null=True, on_delete=models.SET_NULL)
    discipline = models.ForeignKey("Discipline", null=True, on_delete=models.SET_NULL)

    def save(self, *args, **kwargs):
        if not self.unique_link:
            self.unique_link = None
        super(Result, self).save(*args, **kwargs)
