# Generated by Django 5.2 on 2025-04-17 09:58

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("cars", "0001_initial"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="car",
            options={"verbose_name": "Araç", "verbose_name_plural": "Araçlar"},
        ),
        migrations.RemoveField(
            model_name="car",
            name="created_at",
        ),
    ]
