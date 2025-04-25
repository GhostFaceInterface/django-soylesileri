from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Listing, ListingImage
from .serializers import ListingSerializer, ListingImageSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters 
from .permissions import IsOwnerOrReadOnly

class ListingViewSet(viewsets.ModelViewSet):
    queryset = Listing.objects.all()
    serializer_class = ListingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]  
    # Allow authenticated users to create, update, and delete listings, but allow anyone to read them

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['city', 'car__brand', 'car__model', 'car__fuel_type', 'car__transmission']
    search_fields = ['title', 'description', 'car__brand__name', 'car__model__name', 'car__fuel_type']
    ordering_fields = ['created_at', 'price']

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        '''perform_create, POST isteğiyle yeni bir Listing oluşturulurken,
            onu hangi kullanıcının oluşturduğunu (request.user) kaydetmeye yarar.'''


class ListingImageViewSet(viewsets.ModelViewSet):
    queryset = ListingImage.objects.all()
    serializer_class = ListingImageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
