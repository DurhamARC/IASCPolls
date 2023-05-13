import datetime
import secrets

from django.db import models
from django.test import TestCase
from django.core.exceptions import ObjectDoesNotExist
from iasc.models import Institution, Discipline, Participant, ActiveLink, Survey, Result


class DatabaseModelTestCase(TestCase):
    def setUp(self):
        super().setUp()
        institution = Institution.objects.create(name="Durham University", country="GB")
        discipline = Discipline.objects.create(name="Research Software Engineer")
        participant = Participant.objects.create(
            name="Jane Doe",
            title="Dr",
            email="jane.doe@example.invalid",
            institution=institution,
            discipline=discipline,
        )

        survey = Survey.objects.create(
            question="What is the causative factor in Bovine Lunar Springing (BLS)?",
            active=True,
            kind="LI",
            expiry=datetime.datetime(2099, 1, 1, 0, 0),
            participants=1,
            voted=0,
        )

        ActiveLink.objects.create(
            participant=participant,
            survey=survey,
            unique_link=secrets.token_hex(16),
        )

    def test_database_models(self):
        link = ActiveLink.objects.get(id=1)
        uid = str(link.unique_link)
        vote = str({"vote": 5})
        link.vote(vote)

        # After voting, the unique link *must not exist* in the database
        # Check that we raise ObjectDoesNotExist looking up the uid:
        self.assertRaises(ObjectDoesNotExist, ActiveLink.objects.get, unique_link=uid)
