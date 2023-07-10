from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Order(models.Model):
    order_id = models.IntegerField(null=True, blank=True)
    defect = models.CharField(max_length=150)
    diagnostic_result = models.CharField(max_length=250, blank=True)
    required_works = models.CharField(max_length=250, blank=True)
    client_comments = models.CharField(max_length=400, blank=True)

    created = models.DateTimeField(auto_now_add=True)
    edited = models.DateTimeField(auto_now=True)
    client_image = models.CharField(max_length=56, default='No info')
    unit_image = models.CharField(max_length=28, default='No info')

    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name='orders')
    client = models.ForeignKey('Client', on_delete=models.PROTECT, related_name='orders')
    unit = models.ForeignKey('Unit', on_delete=models.PROTECT, related_name='orders')
    sp = models.ManyToManyField('ServiceAndPart', related_name='sp', blank=True)

    def save(self, *args, **kwargs):
        user = self.user
        if user.orders.get_queryset():
            if self.created:
                pass
            else:
                orders_count = user.orders.last().order_id
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
    address = models.CharField(max_length=42, default='No address', blank=True, null=True)
    mail = models.EmailField(max_length=42, null=True, blank=True)

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
    os_password = models.CharField(max_length=42, null=True)
    bios_password = models.CharField(max_length=42, null=True)

    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name='units')
    brand = models.ForeignKey('Brand', on_delete=models.PROTECT, related_name='units')
    model = models.ForeignKey('Model', on_delete=models.PROTECT, related_name='units')
    type = models.ForeignKey('UnitType', on_delete=models.PROTECT, related_name='units')
    condition = models.ManyToManyField('UnitCondition',  blank=True, related_name='units')

    def save(self, *args, **kwargs):
        if self.user.units.filter(type=self.type, brand=self.brand, model=self.model, serial_number=self.serial_number):
            unit = self.user.units.get(type=self.type, brand=self.brand, model=self.model, serial_number=self.serial_number)
            self.pk = unit.pk
            return unit
        else:
            return super(Unit, self).save(*args, **kwargs)

    def __str__(self):
        return f'{self.brand.name} {self.model.name}'


class UnitType(models.Model):
    name = models.CharField(max_length=21)

    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name='unit_types')

    def save(self, *args, **kwargs):
        if self.user.unit_types.filter(name=self.name):
            unit_type = self.user.unit_types.get(name=self.name)
            self.pk = unit_type.pk
            return unit_type
        else:
            return super(UnitType, self).save(*args, **kwargs)

    def __str__(self):
        return f'{self.name}'


class UnitCondition(models.Model):
    name = models.CharField(max_length=42)
    visible = models.BooleanField(default=True)

    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name='unit_conditions')

    def save(self, *args, **kwargs):
        if self.user.unit_conditions.filter(name=self.name):
            unit_conditions = self.user.unit_conditions.get(name=self.name)
            self.pk = unit_conditions.pk
            return unit_conditions
        else:
            return super(UnitCondition, self).save(*args, **kwargs)

    def __str__(self):
        return f'{self.name}'


class Brand(models.Model):
    name = models.CharField(max_length=28)

    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name='brands')

    def save(self, *args, **kwargs):
        if self.user.brands.filter(name=self.name):
            brand = self.user.brands.get(name=self.name)
            self.pk = brand.pk
            return brand
        else:
            return super(Brand, self).save(*args, **kwargs)

    def __str__(self):
        return f'{self.name}'


class Model(models.Model):
    name = models.CharField(max_length=28)

    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name='models')

    def save(self, *args, **kwargs):
        if self.user.models.filter(name=self.name):
            model = self.user.models.get(name=self.name)
            self.pk = model.pk
            return model
        else:
            return super(Model, self).save(*args, **kwargs)

    def __str__(self):
        return f'{self.name}'


class Currency(models.Model):
    name = models.CharField(max_length=28)

    def __str__(self):
        return f'{self.name}'


class Payment(models.Model):
    money_total = models.PositiveIntegerField(default=0)
    payment_detail = models.CharField(max_length=120, default='Order payment')
    payment_value = models.IntegerField(default=0)
    created = models.DateTimeField(auto_now_add=True)
    payment_type = models.BooleanField(default=True)
    order_preview = models.CharField(max_length=6, default='Cashbox payment')
    currency_prev = models.CharField(max_length=21, null=True, blank=True)

    currency = models.ForeignKey(Currency, on_delete=models.PROTECT)
    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name='payments')
    order = models.ForeignKey(Order, on_delete=models.PROTECT, related_name='payments', null=True, blank=True)

    def __str__(self):
        return f'Value: {self.payment_value} Detail: {self.payment_detail} Money now: {self.money_total} Order: {self.order.pk} Created at: {self.created} '

    def increase(self):

        if self.user.payments.last():
            self.money_total = self.user.payments.last().money_total + self.payment_value
        else:
            self.money_total = self.payment_value

    def decrease(self):

        self.money_total = self.user.payments.last().money_total - self.payment_value

    def save(self, *args, **kwargs):
        user = self.user
        if self.payment_type:
            self.increase()
        else:
            self.decrease()

        if self.order:
            self.order_preview = 'Payment from order: ' + str(self.order.order_id)

        return super(Payment, self).save(*args, **kwargs)


class ServiceAndPart(models.Model):
    name = models.CharField(max_length=84)
    price = models.IntegerField(default=0)
    warranty = models.CharField(max_length=21)

    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name='sp', null=True)

    def __str__(self):
        return f'{self.name} {self.price} {self.warranty}'

    def save(self, *args, **kwargs):
        if self.user.sp.filter(name=self.name, price=self.price, warranty=self.warranty):
            sp = self.user.sp.get(name=self.name, price=self.price, warranty=self.warranty)
            self.pk = sp.pk
            return sp
        else:
            return super(ServiceAndPart, self).save(*args, **kwargs)
