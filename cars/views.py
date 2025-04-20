from django.shortcuts import render
from rest_framework import viewsets
from .models import Car, CarBrand, CarModel
from .serializers import CarSerializer, CarBrandSerializer, CarModelSerializer
from rest_framework.permissions import AllowAny

class CarBrandViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CarBrand.objects.all()
    serializer_class = CarBrandSerializer
    permission_classes = [AllowAny]  # Allow any user to access this viewset

class CarModelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CarModel.objects.all()
    serializer_class = CarModelSerializer
    permission_classes = [AllowAny]  # Allow any user to access this viewset

class CarViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Car.objects.all()
    serializer_class = CarSerializer
    permission_classes = [AllowAny]  # Allow any user to access this viewset
