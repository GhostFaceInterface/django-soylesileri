from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Listing, ListingImage
from .serializers import ListingSerializer, ListingImageSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters 
from .permissions import IsOwnerOrReadOnly
from core.throttles import ListingCreateThrottle
from .filters import ListingsFilter

class ListingViewSet(viewsets.ModelViewSet):
    queryset = Listing.objects.all()
    serializer_class = ListingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]  
    # Allow authenticated users to create, update, and delete listings, but allow anyone to read them

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]
    

    filterset_class = ListingsFilter
    def get_queryset(self):
        return Listing.objects.filter(is_deleted=False)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        '''perform_create, POST isteğiyle yeni bir Listing oluşturulurken,
            onu hangi kullanıcının oluşturduğunu (request.user) kaydetmeye yarar.'''

    def perform_destroy(self, instance):
        """
        Bu metot, bir nesneyi fiziksel olarak silmek yerine "soft delete" işlemi yapar.
        - instance: Silinmek istenen nesne.
        İşlem:
        1. Nesnenin `is_deleted` alanını `True` olarak işaretler.
        2. Değişikliği veri tabanına kaydeder.
        Bu yöntem, veri kaybını önlemek ve silinen nesneleri gerektiğinde geri getirebilmek için kullanılır.
        """
        instance.is_deleted = True
        instance.save()

    def get_throttles(self):
        if self.action == "create":
            return [ListingCreateThrottle()]
        return super().get_throttles()

class ListingImageViewSet(viewsets.ModelViewSet):
    queryset = ListingImage.objects.all()
    serializer_class = ListingImageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
