from django.urls import path, include, re_path
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register(r'orders', views.OrderViewSet, basename='orders')
router.register(r'clients', views.ClientViewSet, basename='clients')
router.register(r'units', views.UnitViewSet, basename='units')
router.register(r'brands', views.BrandViewSet, basename='brands')
router.register(r'models', views.ModelViewSet, basename='models')
router.register(r'payments', views.PaymentViewSet, basename='payments')
router.register(r'services-and-parst', views.ServiceAndPartViewSet, basename='sp')
router.register(r'unit-types', views.UnitTypeViewSet, basename='unit_types')
router.register(r'unit-conditions', views.UnitConditionViewSet, basename='unit_conditions')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/', include('djoser.urls')),
    re_path(r'^auth/', include('djoser.urls.authtoken')),
    path('drf-auth/', include('rest_framework.urls')),
    path('index/', views.Index.as_view(), name='index')
]
