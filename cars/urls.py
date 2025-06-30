from rest_framework.routers import DefaultRouter
from .views import (
    CarBrandViewSet, 
    CarModelViewSet, 
    CarViewSet,
    CarVariantViewSet,
    CarTrimViewSet
    )
from django.urls import path, include

# Manual URL patterns
urlpatterns = [
    # Brands
    path('brands/', CarBrandViewSet.as_view({'get': 'list'}), name='carbrand-list'),
    path('brands/<int:pk>/', CarBrandViewSet.as_view({'get': 'retrieve'}), name='carbrand-detail'),
    
    # Models  
    path('models/', CarModelViewSet.as_view({'get': 'list'}), name='carmodel-list'),
    path('models/<int:pk>/', CarModelViewSet.as_view({'get': 'retrieve'}), name='carmodel-detail'),
    
    # Variants
    path('variants/', CarVariantViewSet.as_view({'get': 'list'}), name='carvariant-list'),
    path('variants/<int:pk>/', CarVariantViewSet.as_view({'get': 'retrieve'}), name='carvariant-detail'),
    
    # Trims
    path('trims/', CarTrimViewSet.as_view({'get': 'list'}), name='cartrim-list'),
    path('trims/<int:pk>/', CarTrimViewSet.as_view({'get': 'retrieve'}), name='cartrim-detail'),
    
    # Cars
    path('cars/', CarViewSet.as_view({'get': 'list'}), name='car-list'),
    path('cars/<int:pk>/', CarViewSet.as_view({'get': 'retrieve'}), name='car-detail'),
]