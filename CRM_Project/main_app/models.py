from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Order(models.Model):
    defect = models.CharField(max_length=150)
    created = models.DateTimeField(auto_now_add=True)
    edited = models.DateTimeField(auto_now=True)

    user = models.ForeignKey(User, on_delete=models.PROTECT)
    client = models.ForeignKey('Client', on_delete=models.PROTECT)


class Client(models.Model):
    first_name = models.CharField(max_length=21)
    last_name = models.CharField(max_length=28)
    phone = models.CharField(max_length=21)
    address = models.CharField(max_length=42)
