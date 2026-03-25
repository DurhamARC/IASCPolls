from django.db import migrations, models
import iasc.models


class Migration(migrations.Migration):

    dependencies = [
        ("iasc", "0007_survey_l3c_kind_and_questions_field"),
    ]

    operations = [
        migrations.AlterField(
            model_name="survey",
            name="kind",
            field=models.CharField(
                default="LI",
                max_length=10,
                validators=[iasc.models.validate_survey_kind],
            ),
        ),
        migrations.AlterField(
            model_name="survey",
            name="questions",
            field=models.JSONField(
                blank=True,
                help_text="List of statement strings for multi-question templates",
                null=True,
            ),
        ),
    ]
