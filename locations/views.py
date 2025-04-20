from django.shortcuts import render
from rest_framework import viewsets
from .models import City
from .serializers import CitySerializer
from rest_framework.permissions import AllowAny


class CityViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A simple ViewSet for viewing cities.
    """
    queryset = City.objects.all()
    serializer_class = CitySerializer
    permission_classes = [AllowAny]  # Allow any user to access this viewset

# Create your views here.
