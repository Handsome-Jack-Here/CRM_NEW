from rest_framework import serializers
from .models import Order, Client


class OrderListSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    order_id = serializers.ReadOnlyField()
    # client = serializers.(read_only=True, )
    # client_image = Client.objects.get(pk=client)


    class Meta:
        model = Order

        fields = '__all__'


class ClientListSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Client
        fields = '__all__'
