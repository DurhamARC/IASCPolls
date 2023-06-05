import datetime
import io
from random import randrange
from zipfile import ZipFile

from django.utils import timezone
from django.contrib.auth.models import User
from django.test import TestCase
from django.core.exceptions import ObjectDoesNotExist
from django.core.files.uploadedfile import SimpleUploadedFile
from urllib import parse

from django.utils.text import slugify

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

        self.mimetypes = {
            "json": "application/json",
            "zip": "application/zip",
            "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }

        self.test_question = "Were the dish and the spoon complicit in the cow's crime?"
        self.test_institution = "Test University"
        self.sheet_header = ["First Name", "E-mail Address", "Unique Link"]

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

    def helper_create_workbook(self, data):
        wb = Workbook()
        sheet1 = wb.active
        sheet1.title = "Physics"
        wb.create_sheet("Biology")
        wb.create_sheet("Chemistry")

        for i, sheet in enumerate(wb):
            sheet["A1"] = self.sheet_header[0]
            sheet["B1"] = self.sheet_header[1]

            for row, (name, email) in enumerate(data[i], start=2):
                sheet[f"A{row}"] = name
                sheet[f"B{row}"] = email

        with io.BytesIO() as buffer:
            wb.save(buffer)
            buffer.seek(0)
            return buffer.read()

    @staticmethod
    def helper_get_xls_data(data):
        read = io.BytesIO(data)
        wb = load_workbook(read)
        ws = wb.active

        # Return table as list of lists, where each sub-list is a row:
        return [[cell.value for cell in row] for row in ws.rows]

    @staticmethod
    def helper_zip_get_files(data):
        read = io.BytesIO(data)
        input_zip = ZipFile(read)
        return input_zip.namelist(), input_zip

    def helper_test_zipped_sheets(
        self, route: str, slug: str, prefix: str, headers: []
    ):
        resp = self.GET(
            f"/api{route}",
            mimetype=self.mimetypes["zip"],
            status=200,
            startswith=b"PK",
        )

        names, input_zip = self.helper_zip_get_files(resp.content)
        filename = slugify(slug, allow_unicode=True)
        expected_filename = f"{prefix}-{self.survey_id}-{filename}.xlsx"
        self.assertEquals(names[0], expected_filename)

        xls = input_zip.read(names[0])
        # Excel files are zip files too:
        self.assertTrue(xls.startswith(b"PK"))

        # Look for xlsx-specific strings:
        self.assertTrue(b"docProps/app.xml" in xls)
        self.assertTrue(b"/_rels/workbook.xml.rels" in xls)

        # Check XLS data:
        data = self.helper_get_xls_data(xls)
        self.assertEquals(data.pop(0), headers)
        self.assertEquals(len(data), len(self.flat_test_data))

    def test_api_routes(self):
        """
        API routes Integration Test:
          /participants/upload/
          /participants/

          /institutions/
          /disciplines/

          /survey/create/
          /survey/survey_id/institutions/
          /survey/close/
          /survey/results/
          /survey/

          /vote/

          /links/xls/
          /links/zip/
          /links/

          /result/xls/
          /result/zip/
          /result/                         ️

          /user/


        These are within a wrapper method as django rolls back the database state in-between
        https://docs.djangoproject.com/en/4.2/topics/testing/overview/#the-test-database
        """

        def test_01_participants_upload():
            """
            Test the "Upload Participants" route by uploading an Excel file
            /participants/upload/
            /participants/
            """

            stream = self.helper_create_workbook(self.test_data)

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
                mimetype=self.mimetypes["json"],
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
                "/api/participants/", mimetype=self.mimetypes["json"], startswith=b"{"
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
                mimetype=self.mimetypes["json"],
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
                "/api/survey/?active=true",
                mimetype=self.mimetypes["json"],
                startswith=b"{",
            )

            self.assertEquals(
                resp_surveys["results"][0]["question"], self.test_question
            )

            self.survey_id = resp_surveys["results"][0]["id"]
            resp_institutions = self.GET(
                f"/api/survey/{self.survey_id}/institutions/",
                mimetype=self.mimetypes["json"],
                startswith=b"{",
            )

            self.assertEquals(
                resp_institutions["results"][0]["name"], self.test_institution
            )

            # Test without ?survey=n, should raise 400
            resp = self.GET(
                "/api/links/xls/",
                mimetype=self.mimetypes["json"],
                status=400,
                startswith=None,
            )

            self.assertTrue("?survey=n" in resp["message"])

            resp = self.GET(
                f"/api/links/xls/?survey={self.survey_id}",
                mimetype=self.mimetypes["xlsx"],
                status=200,
                # Look for Zip header at the beginning of the binary response
                startswith=b"PK",
            )

            data = self.helper_get_xls_data(resp.content)

            # Check that the Excel sheet returned contains the correct header
            self.assertEquals(data.pop(0), self.sheet_header)
            # Check that the Excel sheet contains the correct number of rows
            self.assertEquals(len(data), len(self.flat_test_data))

            # Store links in variable for later use
            self.links = data

        def test_04_zip_links():
            """
            Test Zip route for links download
            /links/zip/
            """

            self.helper_test_zipped_sheets(
                f"/links/zip/?survey={self.survey_id}",
                self.test_institution,
                "IASC",
                self.sheet_header,
            )

        def test_05_vote():
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
                    mimetype=self.mimetypes["json"],
                    contains="success",
                )

                self.assertEquals(resp["status"], "success")
                self.assertEquals(resp["message"], "Voted")

            resp = self.GET(
                "/api/links/",
                status=200,
                mimetype=self.mimetypes["json"],
                startswith=b"{",
                contains="results",
            )

            # Check that all voting links are used up
            self.assertEquals(resp["count"], 0)

        def test_06_close():
            """
            Test survey closure
            /survey/close/
            """

            resp = self.POST(
                "/api/survey/close/",
                {"survey": self.survey_id},
                status=200,
                mimetype=self.mimetypes["json"],
                contains="success",
            )

            self.assertTrue("Closed survey" in resp["message"])

        def test_07_results():
            """
            Test results download
            /result/
            /result/xls/
            /survey/results/
            """

            resp = self.GET(
                f"/api/result/",
                status=200,
                mimetype=self.mimetypes["json"],
                startswith=b"{",
            )

            self.assertEquals(resp["count"], len(self.flat_test_data))

            resp = self.GET(
                f"/api/result/xls/?survey={self.survey_id}",
                status=200,
                mimetype=self.mimetypes["xlsx"],
                startswith=b"PK",
            )

            data = self.helper_get_xls_data(resp.content)

            # Check that the Excel sheet returned contains the correct header and no. of rows
            self.assertEquals(
                data.pop(0), ["vote", "institution", "discipline", "added"]
            )
            self.assertEquals(len(data), len(self.flat_test_data))

            resp = self.GET(
                "/api/survey/results/",
                status=200,
                mimetype=self.mimetypes["json"],
                startswith=b"{",
            )

            self.assertEquals(resp["count"], 1)
            results = resp["results"][0]
            self.assertEquals(results["question"], self.test_question)
            self.assertEquals(results["count"], len(self.flat_test_data))
            self.assertEquals(results["kind"], "LI")
            self.assertEquals(results["active"], "False")

        def test_08_zip_results():
            """
            Test route for zip results download
            /result/zip/
            """

            self.helper_test_zipped_sheets(
                f"/result/zip/?survey={self.survey_id}",
                self.test_question,
                "Results",
                ["survey", "vote", "institution", "discipline", "added"],
            )

            self.helper_test_zipped_sheets(
                f"/result/zip/",
                self.test_question,
                "Results",
                ["survey", "vote", "institution", "discipline", "added"],
            )

        def test_09_institution_discipline():
            """
            Test these routes:
            /institutions/
            /disciplines/
            @return:
            """

            self.GET(
                "/api/institutions/",
                status=200,
                mimetype=self.mimetypes["json"],
                startswith=b"[",
                contains=self.test_institution,
            )

            resp = self.GET(
                "/api/disciplines/",
                status=200,
                mimetype=self.mimetypes["json"],
                startswith=b"[",
                contains=None,
            )

            # Check for the three added disciplines
            self.assertEquals(len(resp), 3)

        def test_10_user():
            """
            Test logged in user detail route
            /user/
            """

            resp = self.GET(
                "/api/user/",
                status=200,
                mimetype=self.mimetypes["json"],
                startswith=None,
                contains=None,
            )[0]

            self.assertTrue("username" in resp.keys())
            self.assertTrue("first_name" in resp.keys())
            self.assertEquals(resp["username"], self.username)

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
