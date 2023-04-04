from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Order(models.Model):
    order_id = models.IntegerField(null=True, blank=True)
    defect = models.CharField(max_length=150)
    created = models.DateTimeField(auto_now_add=True)
    edited = models.DateTimeField(auto_now=True)

    user = models.ForeignKey(User, on_delete=models.PROTECT)
    client = models.ForeignKey('Client', on_delete=models.PROTECT)

    def save(self, *args, **kwargs):
        user = self.user
        orders_count = user.orders.count()
        self.order_id = orders_count + 1
        return super(Order, self).save(*args, **kwargs)

    def __str__(self):
        return f'{self.pk} {self.defect} {self.client}'


class Client(models.Model):
    first_name = models.CharField(max_length=21)
    last_name = models.CharField(max_length=28)
    phone = models.CharField(max_length=21)
    address = models.CharField(max_length=42)
