import json
from pathlib import Path

_DEFS_PATH = Path(__file__).resolve().parent.parent / "conf" / "survey_definitions.json"

with open(_DEFS_PATH) as _f:
    SURVEY_DEFINITIONS = json.load(_f)

VALID_KINDS = list(SURVEY_DEFINITIONS.keys())
