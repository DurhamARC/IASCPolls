# Generated by Django 4.1 on 2023-05-23 10:15

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("iasc", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="result",
            name="added",
            field=models.DateTimeField(default=datetime.datetime.now),
        ),
    ]