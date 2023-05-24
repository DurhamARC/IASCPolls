import datetime
import io
from random import randrange
from tempfile import NamedTemporaryFile

from django.utils import timezone
from django.contrib.auth.models import User
from django.test import TestCase
from django.core.exceptions import ObjectDoesNotExist
from django.core.files.uploadedfile import SimpleUploadedFile
from urllib import parse

from iasc.models import Institution, Discipline, Participant, ActiveLink, Survey, Result
from frontend.tests import HTTPTestCase

from openpyxl import Workbook, load_workbook


class ViewsTestCase(HTTPTestCase):
    """
    Test Views using Integration tests
    """

    def __init__(self, methodName: str = ...):
        super().__init__(methodName)
        self.test_data = [
            [
                ("Ariadne", "ar.kimb@durham.test"),
                ("Allan", "allan_hy@harvard.test"),
                ("Zonda", "zond-yor@durham.test"),
                ("Iestyn", "ie_molli@cambridge.test"),
                ("Hart", "ha.turco@newcastle.test"),
            ],
            [
                ("Haldis", "haldi-otoole@newcastle.test"),
                ("Cadmus", "ca.weym@harvard.test"),
                ("Jewel", "jewe.atte@durham.test"),
                ("Nimesh", "nimes_luong@yale.test"),
                ("Avery", "aver_weymo@cambridge.test"),
            ],
            [
                ("Cronan", "crona.nimmo@newcastle.test"),
                ("Nora", "nora-huf@harvard.test"),
                ("Kalil", "kalil_easter@cambridge.test"),
                ("Archidamus", "archidam.ma@harvard.test"),
                ("Betsey", "be-bauma@yale.test"),
            ],
        ]

        self.flat_test_data = [item for sublist in self.test_data for item in sublist]

        self.xls_mimetype = (
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )

        self.test_question = "Were the dish and the spoon complicit in the cow's crime?"
        self.test_institution = "Test University"

        self.links = None
        self.survey_id = None

        self.username = "testuser"
        self.password = "12345"

    def setUp(self):
        super(ViewsTestCase, self).setUp()

        user = User.objects.create(username=self.username)
        user.set_password(self.password)
        user.save()

        logged_in = self.client.login(username=self.username, password=self.password)
        self.assertTrue(logged_in)

    @staticmethod
    def helper_create_workbook(data):
        wb = Workbook()
        sheet1 = wb.active
        sheet1.title = "Physics"
        wb.create_sheet("Biology")
        wb.create_sheet("Chemistry")

        for i, sheet in enumerate(wb):
            sheet["A1"] = "First Name"
            sheet["B1"] = "E-Mail Address"

            for row, (name, email) in enumerate(data[i], start=2):
                sheet[f"A{row}"] = name
                sheet[f"B{row}"] = email

        with NamedTemporaryFile() as tmp:
            wb.save(tmp.name)
            tmp.seek(0)
            stream = tmp.read()

            return tmp.name, stream

    @staticmethod
    def helper_get_xls_data(resp):
        with NamedTemporaryFile() as tmp:
            tmp.write(resp.content)
            tmp.seek(0)
            stream = tmp.read()

            read = io.BytesIO(stream)
            wb = load_workbook(read)
            ws = wb.active

            # Return table as list of lists, where each sub-list is a row:
            return [[cell.value for cell in row] for row in ws.rows]

    def test_api_routes(self):
        """
        API routes Integration Test:
          /participants/upload/             ✅
          /participants/                    ✅

          /institutions/                    ⚠️
          /disciplines/                     ⚠️

          /survey/create/                   ✅
          /survey/survey_id/institutions/   ✅
          /survey/close/                    ✅
          /survey/results/                  ⚠️
          /survey/                          ✅

          /vote/                            ✅

          /links/xls/                       ✅
          /links/zip/                       ⚠️
          /links/                           ✅

          /result/xls/                      ✅
          /result/zip/                      ⚠️
          /result/                          ⚠️

          /user/                            ⚠️


        These are within a wrapper method as django rolls back the database state in-between
        https://docs.djangoproject.com/en/4.2/topics/testing/overview/#the-test-database
        """

        def test_01_participants_upload():
            """
            Test the "Upload Participants" route by uploading an Excel file
            /participants/upload/
            /participants/
            @return:
            """
            name, stream = self.helper_create_workbook(self.test_data)

            upload = SimpleUploadedFile(
                "file.mp4", stream, content_type="application/vnd.ms-excel"
            )
            self.POST(
                "/api/participants/upload/",
                {
                    "file": upload,
                    "institution": self.test_institution,
                    "create_institutions": True,
                    "create_disciplines": True,
                },
                status=200,
                mimetype="application/json",
                contains="File uploaded",
            )

            self.assertEquals(Participant.objects.count(), len(self.flat_test_data))

            for row in self.flat_test_data:
                self.assertEquals(
                    Participant.objects.filter(email=row[1]).get().name,
                    row[0],
                )

            # Test participant JSON retrieval
            resp = self.GET(
                "/api/participants/", mimetype="application/json", startswith=b"{"
            )

            self.assertEquals(resp["count"], len(self.flat_test_data))

        def test_02_create_survey():
            """
            Create a survey in the database
            /survey/create/
            """
            resp = self.POST(
                "/api/survey/create/",
                {
                    "question": self.test_question,
                    "expiry": "2023-06-23T23:00",
                    "active": "True",
                    "create_active_links": "True",
                },
                mimetype="application/json",
            )

            self.assertEquals(resp["status"], "success")
            self.assertEquals(resp["message"], "Survey created.")
            self.assertEquals(Survey.objects.count(), 1)
            self.assertEquals(ActiveLink.objects.count(), len(self.flat_test_data))

        def test_03_download_links():
            """
            Test Active Surveys API Route
            /survey/?active=true
            /survey/survey_id/institutions/
            /links/xls/
            """

            resp_surveys = self.GET(
                "/api/survey/?active=true", mimetype="application/json", startswith=b"{"
            )

            self.assertEquals(
                resp_surveys["results"][0]["question"], self.test_question
            )

            self.survey_id = resp_surveys["results"][0]["id"]
            resp_institutions = self.GET(
                f"/api/survey/{self.survey_id}/institutions/",
                mimetype="application/json",
                startswith=b"{",
            )

            self.assertEquals(
                resp_institutions["results"][0]["name"], self.test_institution
            )

            # Test without ?survey=n, should raise 400
            resp = self.GET(
                "/api/links/xls/",
                mimetype="application/json",
                status=400,
                startswith=None,
            )

            self.assertTrue("?survey=n" in resp["message"])

            resp = self.GET(
                f"/api/links/xls/?survey={self.survey_id}",
                mimetype=self.xls_mimetype,
                status=200,
                # Look for Zip header at the beginning of the binary response
                startswith=b"PK",
            )

            data = self.helper_get_xls_data(resp)

            # Check that the Excel sheet returned contains the correct header
            self.assertEquals(data.pop(0), ["Name", "E-mail Address", "Unique Link"])
            # Check that the Excel sheet contains the correct number of rows
            self.assertEquals(len(data), len(self.flat_test_data))

            # Store links in variable for later use
            self.links = data

        def test_04_vote():
            """
            Test the ability to vote using the ActiveLinks returned by the API
            /vote/
            /links/
            """
            for _, _, link in self.links:
                path = parse.urlparse(link)
                params = parse.parse_qs(path.query)

                resp = self.POST(
                    "/api/vote/",
                    {"unique_id": params["unique_id"][0], "vote": randrange(5)},
                    status=200,
                    mimetype="application/json",
                    contains="success",
                )

                self.assertEquals(resp["status"], "success")
                self.assertEquals(resp["message"], "Voted")

            resp = self.GET(
                "/api/links/",
                status=200,
                mimetype="application/json",
                startswith=b"{",
                contains="results",
            )

            # Check that all voting links are used up
            self.assertEquals(resp["count"], 0)

        def test_05_close():
            """
            Test survey closure
            /survey/close/
            """
            resp = self.POST(
                "/api/survey/close/",
                {"survey": self.survey_id},
                status=200,
                mimetype="application/json",
                contains="success",
            )

            self.assertTrue("Closed survey" in resp["message"])

        def test_06_results():
            """
            Test results download
            /result/
            /result/xls/
            """

            resp = self.GET(
                f"/api/result/xls/?survey={self.survey_id}",
                status=200,
                mimetype=self.xls_mimetype,
                startswith=b"PK",
            )

            data = self.helper_get_xls_data(resp)

            # Check that the Excel sheet returned contains the correct header and no. of rows
            self.assertEquals(data.pop(0), ["vote", "institution", "discipline"])
            self.assertEquals(len(data), len(self.flat_test_data))

        #
        # Run all the integration tests defined within this function:
        print(f"\n{len(dir())-1} Integration tests found")

        for fn in dir():
            if fn == "self":
                continue
            print(f"Running {fn}")
            ret = locals()[fn]()


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
            expiry=datetime.datetime(2099, 1, 1, 0, 0, tzinfo=timezone.utc),
            participants=1,
            voted=0,
        )

        ActiveLink.objects.create(participant=participant, survey=survey)

    def test_database_models(self):
        link = ActiveLink.objects.get()
        uid = str(link.unique_link)
        vote = str(5)
        link.vote(vote)

        # After voting, the unique link *must not exist* in the database
        # Check that we raise ObjectDoesNotExist looking up the uid:
        self.assertRaises(ObjectDoesNotExist, ActiveLink.objects.get, unique_link=uid)
