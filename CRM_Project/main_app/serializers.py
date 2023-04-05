from rest_framework import serializers
from .models import Order, Client


class OrderListSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    # client = serializers.StringRelatedField(read_only=True, )
    # order_id = serializers.HiddenField(default=False)

    class Meta:
        model = Order
        fields = '__all__'


class ClientListSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Client
        fields = '__all__'
