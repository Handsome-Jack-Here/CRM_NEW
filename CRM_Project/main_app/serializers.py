from rest_framework import serializers
from .models import Order, Client, Unit, Brand, Model, Payment, ServiceAndPart, UnitType


class OrderListSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    order_id = serializers.ReadOnlyField()
    # client = serializers.HiddenField(default=None)

    class Meta:
        model = Order
        fields = '__all__'


class ClientListSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())


    class Meta:
        model = Client
        fields = '__all__'


class UnitListSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Unit
        fields = '__all__'


class BrandListSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Brand
        fields = '__all__'


class ModelListSerializer(BrandListSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Model
        fields = '__all__'


class PaymentListSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    # order = serializers.HiddenField(default='Cash')

    class Meta:
        model = Payment
        fields = '__all__'


class ServiceAndPartListSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = ServiceAndPart
        fields = '__all__'


class UnitTypeSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = UnitType
        fields = '__all__'