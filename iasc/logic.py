import pandas as pd
import logging
from thefuzz import process

from iasc.models import Participant, Discipline, Institution

log = logging.getLogger(__name__)

EXCLUDE_DEPARTMENTS = ["ALL"]


def xl_disciplines_to_db(disciplines: list):
    """
    Insert a list of disciplines into the database, ignoring duplicates
    @param disciplines: list
    """
    disciplines_db = list(d.name for d in Discipline.objects.all())
    to_create = []
    for d in disciplines:
        d = d.strip()
        if d not in disciplines_db and d not in EXCLUDE_DEPARTMENTS:
            to_create += [Discipline(name=d)]

    log.info("Adding the following to the db: " + str(to_create))
    Discipline.objects.bulk_create(to_create)


def parse_excel_sheet_to_database(sheet, **kwargs):
    """
    Take an Excel spreadsheet, and transform it into database objects in Django ORM

    Each Sheet within the Workbook is titled with the department title, and
    contains the following columns:

    "First Name", "E-mail Address"
    @param sheet: The Excel spreadsheet

    **kwargs:
        institution: The name of the institution
        create_institutions: Optionally create the given institution
        create_disciplines: Create disciplines from sheet titles
    """

    create_institutions = kwargs.get("create_institutions")
    create_disciplines = kwargs.get("create_disciplines")
    ignore_conflicts = kwargs.get("ignore_conflicts")

    try:
        institution = kwargs["institution"]
        participants = []
        xls = pd.ExcelFile(sheet, engine="openpyxl")
        disciplines_db = Discipline.objects.all()
        disciplines_xl = xls.sheet_names

        # Get institution, or create it if that setting is on:
        try:
            institution = Institution.objects.get(name=institution)
        except Institution.DoesNotExist as e:
            if not create_institutions:
                raise e
            institution = Institution.objects.create(name=institution)

        # Create disciplines from those in the sheet, if that setting is on:
        if create_disciplines:
            xl_disciplines_to_db(disciplines_xl)

        # Iterate over departments:
        for department in disciplines_xl:
            df = pd.read_excel(xls, department)
            log.info(department)
            if department in EXCLUDE_DEPARTMENTS:
                log.warning(f"Skipping {department} sheet")
                continue

            log.info(df[:5])

            # Use fuzzy logic (Levenshtein distance) to compute field keys, which can vary:
            email_key = process.extractOne("Email Address", df.columns)[0]
            name_key = process.extractOne("Name", df.columns)[0]

            # Participant: { name, title, email, institution, discipline }
            participants += [
                Participant(
                    email=record[email_key],
                    name=record[name_key],
                    title=record.get("Title", None),
                    institution=institution,
                    discipline=disciplines_db.filter(name=department).get(),
                )
                for record in df.to_dict("records")
            ]

        Participant.objects.bulk_create(participants, ignore_conflicts=ignore_conflicts)

    except Institution.DoesNotExist as e:
        raise Institution.DoesNotExist(
            f"Institution {institution} does not exist"
        ) from e

    except Discipline.DoesNotExist as e:
        raise Discipline.DoesNotExist(f"Discipline {department} does not exist") from e
