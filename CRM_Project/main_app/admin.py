from django.contrib import admin
from .models import Order, Client, Unit, Brand, Model

admin.site.register(Order)
admin.site.register(Client)
admin.site.register(Unit)
admin.site.register(Brand)
admin.site.register(Model)

