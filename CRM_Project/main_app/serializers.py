from rest_framework import serializers
from .models import Order, Client, Unit, Brand, Model


class OrderListSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    order_id = serializers.ReadOnlyField()

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
