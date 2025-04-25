from rest_framework.routers import DefaultRouter
from .views import (
    CarBrandViewSet, 
    CarModelViewSet, 
    CarViewSet,
    CarVariantViewSet,
    CarTrimViewSet
    )
from django.urls import path, include

router = DefaultRouter()
router.register(r'brands', CarBrandViewSet)
router.register(r'models', CarModelViewSet)
router.register(r'variants', CarVariantViewSet)
router.register(r'trims', CarTrimViewSet)
router.register(r'cars', CarViewSet)
urlpatterns = [
    path('', include(router.urls)),
]