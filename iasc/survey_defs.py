import json
from pathlib import Path

_DEFS_PATH = Path(__file__).resolve().parent.parent / "conf" / "survey_definitions.json"

with open(_DEFS_PATH) as _f:
    SURVEY_DEFINITIONS = json.load(_f)

# Kept for backwards compatibility during the JSON → DB transition.
# Used by the data migration that seeds SurveyTemplate rows.
VALID_KINDS = list(SURVEY_DEFINITIONS.keys())


def get_valid_slugs():
    """Return all SurveyTemplate slugs from the database.

    Falls back to the static JSON list if the table does not yet exist
    (e.g. during initial migrate before the SurveyTemplate migration has run).
    """
    try:
        from iasc.models import SurveyTemplate

        return list(SurveyTemplate.objects.values_list("slug", flat=True))
    except Exception:
        return VALID_KINDS
