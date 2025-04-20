from rest_framework.routers import DefaultRouter
from views import CarBrandViewSet, CarModelViewSet, CarViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'brands', CarBrandViewSet)
router.register(r'models', CarModelViewSet)
router.register(r'cars', CarViewSet)
urlpatterns = [
    path('', include(router.urls)),
]