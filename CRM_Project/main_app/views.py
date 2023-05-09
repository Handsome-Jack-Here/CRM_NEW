import rest_framework.pagination
from django.shortcuts import render
from django.views import View
from django.views.generic import ListView
from rest_framework import viewsets
from .serializers import OrderListSerializer, ClientListSerializer
from .models import Order, Client, User
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

    page_size = 4
    page_size_query_param = 'page_size'
    max_page_size = 28


class OrderViewSet(viewsets.ModelViewSet):
    lookup_field = 'order_id'

    def get_queryset(self):
        pk = self.kwargs.get('pk')
        user = User.objects.get(id=self.request.user.id)
        if not pk:
            for order in user.orders.all():
                client_actual = f'{order.client.first_name} {order.client.last_name}'
                client_image = order.client_image
                if client_image != client_actual:
                    order.client_image = client_actual
                    order.save()
            return user.orders.all().order_by('-order_id')

        return user.orders.filter(pk=pk)

    serializer_class = OrderListSerializer
    filter_backends = (SearchFilter, OrderingFilter)
    search_fields = ['defect', 'order_id', 'client_image', ]
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = OrderPagination

    # authentication_classes = (TokenAuthentication, SessionAuthentication, )


class ClientViewSet(viewsets.ModelViewSet):

    def get_queryset(self):
        pk = self.kwargs.get('pk')
        if not pk:
            return User.objects.get(id=self.request.user.id).clients.all()
        return Client.objects.filter(pk=pk)

    filter_backends = (SearchFilter, OrderingFilter)
    search_fields = ['first_name', 'last_name', 'phone', 'address', ]

    serializer_class = ClientListSerializer
