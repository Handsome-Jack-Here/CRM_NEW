from django.urls import path, include
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register(r'orders', views.OrderViewSet, basename='orders')
router.register(r'clients', views.ClientViewSet, basename='clients')

urlpatterns = [
    path('', include(router.urls)),
    path('index/', views.Index.as_view(), name='index')
]
