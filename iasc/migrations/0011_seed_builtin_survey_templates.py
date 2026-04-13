"""
Data migration: seed the four builtin SurveyTemplate rows from
conf/survey_definitions.json.  Slugs are lowercased kind codes so that
existing Survey.kind values (e.g. "LI", "L2E") continue to validate —
validate_survey_kind() now does a case-insensitive lookup.
"""

import json
from pathlib import Path

from django.db import migrations

_DEFS_PATH = (
    Path(__file__).resolve().parent.parent.parent / "conf" / "survey_definitions.json"
)


def seed_templates(apps, schema_editor):
    SurveyTemplate = apps.get_model("iasc", "SurveyTemplate")
    with open(_DEFS_PATH) as f:
        defs = json.load(f)

    for kind, definition in defs.items():
        SurveyTemplate.objects.get_or_create(
            slug=kind,
            defaults={
                "label": definition["label"],
                "slots": definition["questions"],
                "is_builtin": True,
            },
        )


def remove_templates(apps, schema_editor):
    SurveyTemplate = apps.get_model("iasc", "SurveyTemplate")
    SurveyTemplate.objects.filter(is_builtin=True).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("iasc", "0010_survey_template_model"),
    ]

    operations = [
        migrations.RunPython(seed_templates, reverse_code=remove_templates),
    ]
