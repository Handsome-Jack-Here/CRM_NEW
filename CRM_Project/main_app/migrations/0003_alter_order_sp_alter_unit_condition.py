# Generated by Django 4.2 on 2023-07-01 20:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main_app', '0002_client_mail_order_client_comments_unit_bios_password_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='sp',
            field=models.ManyToManyField(blank=True, related_name='sp', to='main_app.serviceandpart'),
        ),
        migrations.AlterField(
            model_name='unit',
            name='condition',
            field=models.ManyToManyField(blank=True, related_name='units', to='main_app.unitcondition'),
        ),
    ]
