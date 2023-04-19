from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Order(models.Model):
    order_id = models.IntegerField(null=True, blank=True)
    defect = models.CharField(max_length=150)
    created = models.DateTimeField(auto_now_add=True)
    edited = models.DateTimeField(auto_now=True)
    client_image = models.CharField(max_length=56, default='No info')

    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name='orders')
    client = models.ForeignKey('Client', on_delete=models.PROTECT, related_name='orders')

    def save(self, *args, **kwargs):
        user = self.user
        if user.orders.get_queryset():
            if self.created:
                pass
            else:
                orders_count = list(user.orders.get_queryset())[-1].order_id
                self.order_id = orders_count + 1
        else:
            self.order_id = 1
        return super(Order, self).save(*args, **kwargs)

    def __str__(self):
        return f'Global id:{self.pk} Individual id:{self.order_id} Client:{self.client} User: {self.user} '


class Client(models.Model):
    first_name = models.CharField(max_length=21)
    last_name = models.CharField(max_length=28)
    phone = models.CharField(max_length=21)
    address = models.CharField(max_length=42, default='No address')

    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name='clients')

    def __str__(self):
        return f'{self.first_name} {self.last_name} Phone number: {self.phone}  Order id: {self.pk}'
