from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Order(models.Model):
    order_id = models.IntegerField(null=True, blank=True)
    defect = models.CharField(max_length=150)
    diagnostic_result = models.CharField(max_length=250, blank=True)
    required_works = models.CharField(max_length=250, blank=True)

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

    def save(self, *args, **kwargs):
        has_client = self.user.clients.filter(first_name=self.first_name, last_name=self.last_name, phone=self.phone)
        if has_client:
            client = self.user.clients.get(first_name=self.first_name, last_name=self.last_name, phone=self.phone)
            self.pk = client.pk
            return client
        else:
            return super(Client, self).save(*args, **kwargs)

    def __str__(self):
        return f'{self.first_name} {self.last_name}'


class Unit(models.Model):
    serial_number = models.CharField(max_length=35)

    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name='units')
    brand = models.ForeignKey('Brand', on_delete=models.PROTECT)
    model = models.ForeignKey('Model', on_delete=models.PROTECT)

    def save(self, *args, **kwargs):
        has_unit = self.user.units.filter(serial_number=self.serial_number, brand=self.brand, model=self.model)
        if has_unit:
            unit = self.user.clients.get(serial_number=self.serial_number, brand=self.brand, model=self.model)
            self.pk = unit.pk
            return unit
        else:
            return super(Unit, self).save(*args, **kwargs)

    def __str__(self):
        return f'{self.brand.name} {self.model.name}'


class Brand(models.Model):
    name = models.CharField(max_length=28)

    def __str__(self):
        return f'{self.name}'


class Model(models.Model):
    name = models.CharField(max_length=28)

    def __str__(self):
        return f'{self.name}'
