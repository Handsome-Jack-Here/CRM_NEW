from django.contrib import admin
from .models import Order, Client, Unit, Brand, Model, Payment, Currency

admin.site.register(Order)
admin.site.register(Client)
admin.site.register(Unit)
admin.site.register(Brand)
admin.site.register(Model)
admin.site.register(Payment)
admin.site.register(Currency)