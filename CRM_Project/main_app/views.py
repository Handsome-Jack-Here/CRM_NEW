import rest_framework.pagination
from django.shortcuts import render
from django.views import View
from django.views.generic import ListView
from rest_framework import viewsets
from .serializers import OrderListSerializer, ClientListSerializer, UnitListSerializer, BrandListSerializer, \
    ModelListSerializer, PaymentListSerializer, ServiceAndPartListSerializer
from .models import Order, Client, User, Unit, Brand
from django.views.generic import View, TemplateView
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework import permissions
from rest_framework.authentication import BaseAuthentication, SessionAuthentication, TokenAuthentication
from rest_framework.pagination import PageNumberPagination


class Index(TemplateView):
    template_name = 'main_app/index.html'


class OrderPagination(PageNumberPagination):

    def get_page_size(self, request):
        if 'page_size' not in request.POST:
            return super().get_page_size(request)
        else:
            self.page_size = request.POST['page_size']
            return self.page_size

    page_size = 2
    page_size_query_param = 'page_size'
    max_page_size = 18


class OrderViewSet(viewsets.ModelViewSet):
    lookup_field = 'order_id'

    def get_queryset(self):
        user = User.objects.get(id=self.request.user.id)
        for order in user.orders.all():
            client_actual = f'{order.client.first_name} {order.client.last_name}'
            client_image = order.client_image
            unit_actual = f'{order.unit.brand} {order.unit.model}'
            unit_image = order.unit_image

            if client_image != client_actual:
                order.client_image = client_actual
                order.save()
            if unit_image != unit_actual:
                order.unit_image = unit_actual
                order.save()
        return user.orders.all().order_by('-order_id')

    serializer_class = OrderListSerializer
    filter_backends = (SearchFilter, OrderingFilter)
    search_fields = ['defect', 'order_id', 'client_image', 'unit_image']
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = OrderPagination


class ClientViewSet(viewsets.ModelViewSet):

    def get_queryset(self):
        user = User.objects.get(id=self.request.user.id)
        return user.clients.all()

    filter_backends = (SearchFilter, OrderingFilter)
    search_fields = ['first_name', 'last_name', 'phone', 'address', ]

    serializer_class = ClientListSerializer
    permission_classes = (permissions.IsAuthenticated,)


class UnitViewSet(viewsets.ModelViewSet):

    def get_queryset(self):
        user = User.objects.get(id=self.request.user.id)
        return user.units.all()

    serializer_class = UnitListSerializer
    permission_classes = (permissions.IsAuthenticated,)


class BrandViewSet(viewsets.ModelViewSet):

    def get_queryset(self):
        user = User.objects.get(id=self.request.user.id)
        return user.brands.all()

    serializer_class = BrandListSerializer
    permission_classes = (permissions.IsAuthenticated,)


class ModelViewSet(viewsets.ModelViewSet):

    def get_queryset(self):
        user = User.objects.get(id=self.request.user.id)
        return user.models.all()

    serializer_class = ModelListSerializer
    permission_classes = (permissions.IsAuthenticated,)


class PaymentViewSet(viewsets.ModelViewSet):

    def get_queryset(self):
        user = User.objects.get(id=self.request.user.id)
        return user.payments.all()

    serializer_class = PaymentListSerializer
    permission_classes = (permissions.IsAuthenticated,)


class ServiceAndPartViewSet(viewsets.ModelViewSet):

    def get_queryset(self):
        user = User.objects.get(id=self.request.user.id)
        return user.sp.all()

    serializer_class = ServiceAndPartListSerializer
    permission_classes = (permissions.IsAuthenticated,)
