from django.shortcuts import render
from rest_framework import viewsets
from .models import (
    Car, 
    CarBrand, 
    CarModel,
    CarVariant,
    CarTrim
)
from .serializers import (
    CarSerializer,
    CarBrandSerializer, 
    CarModelSerializer,
    CarTrimSerializer,
    CarVariantSerializer
    )
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend

class CarBrandViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CarBrand.objects.all()
    serializer_class = CarBrandSerializer
    permission_classes = [AllowAny]  # Allow any user to access this viewset

class CarModelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CarModel.objects.all()
    serializer_class = CarModelSerializer
    permission_classes = [AllowAny]  # Allow any user to access this viewset
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['brand']

class CarVariantViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CarVariant.objects.all()
    serializer_class = CarVariantSerializer
    permission_classes = [AllowAny]  # Allow any user to access this viewset
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['car']

class CarTrimViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CarTrim.objects.all()
    serializer_class = CarTrimSerializer
    permission_classes = [AllowAny]  # Allow any user to access this viewset
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['variant']    

class CarViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Car.objects.all()
    serializer_class = CarSerializer
    permission_classes = [AllowAny]  # Allow any user to access this viewset
