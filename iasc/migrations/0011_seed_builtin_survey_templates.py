"""
Data migration: seed the four builtin SurveyTemplate rows.
Slug values match existing Survey.kind values (e.g. "LI", "L2E") so that
validate_survey_kind() continues to accept them.

Template data is inlined here so this migration has no dependency on
conf/survey_definitions.json (which is removed in Phase 4 cleanup).
"""

from django.db import migrations

_BUILTIN_TEMPLATES = {
    "LI": {
        "label": "Single Likert",
        "questions": [
            {
                "id": "q0",
                "type": "likert",
                "placeholder": "Enter the statement participants will see",
            }
        ],
    },
    "L2E": {
        "label": "2 Likert + Checkbox",
        "questions": [
            {"id": "q0", "type": "likert", "placeholder": "Enter statement 1"},
            {"id": "q1", "type": "likert", "placeholder": "Enter statement 2"},
            {
                "id": "q2",
                "type": "checkbox",
                "placeholder": "Enter checkbox statement (e.g. I have relevant expertise)",
            },
        ],
    },
    "LI3": {
        "label": "3 Likert",
        "questions": [
            {"id": "q0", "type": "likert", "placeholder": "Enter statement 1"},
            {"id": "q1", "type": "likert", "placeholder": "Enter statement 2"},
            {"id": "q2", "type": "likert", "placeholder": "Enter statement 3"},
        ],
    },
}


def seed_templates(apps, schema_editor):
    SurveyTemplate = apps.get_model("iasc", "SurveyTemplate")
    for kind, definition in _BUILTIN_TEMPLATES.items():
        SurveyTemplate.objects.get_or_create(
            slug=kind,
            defaults={
                "label": definition["label"],
                "slots": definition["questions"],
                "is_builtin": True,
            },
        )


def remove_templates(apps, schema_editor):  # pragma: no cover
    SurveyTemplate = apps.get_model("iasc", "SurveyTemplate")
    SurveyTemplate.objects.filter(is_builtin=True).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("iasc", "0010_survey_template_model"),
    ]

    operations = [
        migrations.RunPython(seed_templates, reverse_code=remove_templates),
    ]
