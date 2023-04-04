from django.shortcuts import render
from django.views import View
from django.views.generic import ListView
from rest_framework import viewsets
from .serializers import OrderListSerializer, ClientListSerializer
from .models import Order, Client, User
from django.views.generic import View, TemplateView


class Index(TemplateView):
    template_name = 'main_app/index.html'


class OrderViewSet(viewsets.ModelViewSet):

    def get_queryset(self):
        pk = self.kwargs.get('pk')
        if not pk:
            return User.objects.get(id=self.request.user.id).orders.all()

        return Order.objects.filter(pk=pk)

    serializer_class = OrderListSerializer


class ClientViewSet(viewsets.ModelViewSet):

    def get_queryset(self):
        pk = self.kwargs.get('pk')
        if not pk:
            return User.objects.get(id=self.request.user.id).clients.all()
        return Client.objects.filter(pk=pk)

    serializer_class = ClientListSerializer
