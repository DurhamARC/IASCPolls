# Create the SurveyTemplateSlot table.  Data is migrated from
# SurveyTemplate.slots in 0013; the slots JSONField is removed in 0014.

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("iasc", "0011_seed_builtin_survey_templates"),
    ]

    operations = [
        migrations.CreateModel(
            name="SurveyTemplateSlot",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("order", models.PositiveIntegerField()),
                (
                    "slot_id",
                    models.CharField(help_text='Vote key, e.g. "q0"', max_length=32),
                ),
                (
                    "type",
                    models.CharField(
                        choices=[("likert", "Likert"), ("checkbox", "Checkbox")],
                        max_length=32,
                    ),
                ),
                ("placeholder", models.TextField(blank=True, default="")),
                (
                    "template",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="slot_set",
                        to="iasc.surveytemplate",
                    ),
                ),
            ],
            options={
                "ordering": ["order"],
                "constraints": [
                    models.UniqueConstraint(
                        fields=("template", "slot_id"),
                        name="unique_slot_id_per_template",
                    ),
                    models.UniqueConstraint(
                        fields=("template", "order"),
                        name="unique_slot_order_per_template",
                    ),
                ],
            },
        ),
    ]
