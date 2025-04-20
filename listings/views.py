from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Listing
from .serializers import ListingSerializer

class ListingViewSet(viewsets.ModelViewSet):
    queryset = Listing.objects.all()
    serializer_class = ListingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]  
    # Allow authenticated users to create, update, and delete listings, but allow anyone to read them

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        '''perform_create, POST isteğiyle yeni bir Listing oluşturulurken,
            onu hangi kullanıcının oluşturduğunu (request.user) kaydetmeye yarar.'''


# Create your views here.
