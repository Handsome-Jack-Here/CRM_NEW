from django.contrib import admin
from .models import Order, Client, Unit, Brand, Model, Payment, Currency, ServiceAndPart, UnitType, UnitCondition, Stage

admin.site.register(Order)
admin.site.register(Client)
admin.site.register(Unit)
admin.site.register(Brand)
admin.site.register(Model)
admin.site.register(Payment)
admin.site.register(Currency)
admin.site.register(ServiceAndPart)
admin.site.register(UnitType)
admin.site.register(UnitCondition)
admin.site.register(Stage)