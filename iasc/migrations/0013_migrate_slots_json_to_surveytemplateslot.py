# Data migration: move slot data from SurveyTemplate.slots (JSONField)
# into the new SurveyTemplateSlot rows.

from django.db import migrations


def migrate_slots_forward(apps, schema_editor):
    SurveyTemplate = apps.get_model("iasc", "SurveyTemplate")
    SurveyTemplateSlot = apps.get_model("iasc", "SurveyTemplateSlot")
    for template in SurveyTemplate.objects.all():
        for order, slot in enumerate(template.slots or []):
            SurveyTemplateSlot.objects.create(
                template=template,
                order=order,
                slot_id=slot["id"],
                type=slot["type"],
                placeholder=slot.get("placeholder", ""),
            )


def migrate_slots_backward(apps, schema_editor):
    SurveyTemplateSlot = apps.get_model("iasc", "SurveyTemplateSlot")
    SurveyTemplate = apps.get_model("iasc", "SurveyTemplate")
    for template in SurveyTemplate.objects.all():
        slots = [
            {
                "id": s.slot_id,
                "type": s.type,
                "placeholder": s.placeholder,
            }
            for s in SurveyTemplateSlot.objects.filter(template=template).order_by(
                "order"
            )
        ]
        template.slots = slots
        template.save()


class Migration(migrations.Migration):

    dependencies = [
        ("iasc", "0012_normalise_slots_to_surveytemplateslot"),
    ]

    operations = [
        migrations.RunPython(
            migrate_slots_forward, reverse_code=migrate_slots_backward
        ),
    ]
