# Remove the now-redundant SurveyTemplate.slots JSONField.
# Data has already been moved to SurveyTemplateSlot in migration 0013.

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("iasc", "0013_migrate_slots_json_to_surveytemplateslot"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="surveytemplate",
            name="slots",
        ),
    ]
