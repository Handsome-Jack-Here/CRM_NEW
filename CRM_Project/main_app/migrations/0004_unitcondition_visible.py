# Generated by Django 4.2 on 2023-07-01 23:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main_app', '0003_alter_order_sp_alter_unit_condition'),
    ]

    operations = [
        migrations.AddField(
            model_name='unitcondition',
            name='visible',
            field=models.BooleanField(default=True),
        ),
    ]
