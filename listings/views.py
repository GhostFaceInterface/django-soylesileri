from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Listing, ListingImage
from .serializers import (
    ListingSerializer,
    ListingImageSerializer,
    BulkImageUploadSerializer
    )
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from rest_framework import exceptions 
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
    ]
    filterset_class = ListingsFilter
    def get_queryset(self):
        queryset = Listing.objects.filter(is_deleted=False)
        return queryset.select_related(
            'user', 'car', 'car__brand', 'car__model', 'car__variant', 'city'
        ).prefetch_related('images')

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
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        queryset = ListingImage.objects.all()
        listing_id = self.request.query_params.get("listing_id")
        if listing_id:
            queryset = queryset.filter(listing_id=listing_id)
        return queryset.order_by("order", "uploaded_at")
    
    def perform_create(self, serializer):
        listing = serializer.validated_data["listing"]
        if listing.user != self.request.user:
            raise exceptions.PermissionDenied("You do not have permission to upload images for this listing.")
        serializer.save()

    
    @action(detail=False, methods=["post"])
    def bulk_upload(self, request):
        """
        Çoklu resim yükleme
        POST /api/listing-images/bulk_upload/
        """
        serializer = BulkImageUploadSerializer(
            data=request.data,
            context={"request": request}
        )

        if serializer.is_valid():
            try:
                created_images = serializer.save()
                return Response({
                    "success": True,
                    "message": f'{len(created_images)} resim başarıyla yüklendi.',
                    "images" : ListingImageSerializer(created_images, many=True, context={"request": request}).data
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({
                    "success": False,
                    "error": f'Resim yükleme hatası: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)
        return Response({
            "success": False,
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=["post"])
    def set_primary(self, request, pk=None):
        """
        Ana resim belirleme
        POST /api/listing-images/{id}/set_primary/
        """
        image = self.get_object()

        if image.listing.user != request.user:
            return Response({
                "success": False,
                "error": "You do not have permission to set this image as primary."
            }, status=status.HTTP_403_FORBIDDEN)
        # Diğer resimlerin is_primary'sini False yap
        ListingImage.objects.filter(
            listing=image.listing
        ).update(is_primary=False)

        image.is_primary = True
        image.save(update_fields=["is_primary"])

        return Response({
            "success": True,
            "message": "Ana resim ayarlandı.",
            "image": ListingImageSerializer(image, context={"request": request}).data
        })
    


    
    @action(detail=False, methods=["post"])
    def reorder(self, request):
        """
        Resim sıralama
        POST /api/listing-images/reorder/
        """
        listing_id = request.data.get("listing_id")
        image_orders = request.data.get("image_orders", [])

        if not listing_id:
            return Response({
                "success": False,
                "error": "listing_id is required."

            },status=status.HTTP_400_BAD_REQUEST)
        if not image_orders or not isinstance(image_orders, list):
            return Response({
                "success": False,
                "error": "image_orders is required and must be a list."
            }, status=status.HTTP_400_BAD_REQUEST)
        try:
            listing = Listing.objects.get(id=listing_id)

            if listing.user != request.user:
                return Response({
                    "success": False,
                    "error": "You do not have permission to reorder images for this listing."
                }, status=status.HTTP_403_FORBIDDEN)
                
            with transaction.atomic():
                for item in image_orders:
                    if not isinstance(item, dict) or "id" not in item or "order" not in item:
                        return Response({
                            "success": False,
                            "error": f"Invalid item format: {item}"
                        }, status=status.HTTP_400_BAD_REQUEST)
                    ListingImage.objects.filter(
                        id=item["id"],
                        listing=listing
                    ).update(order=item["order"])
            
            return Response({
                "success": True,
                "message": "Resim sıralaması güncellendi."
            })
        except Listing.DoesNotExist:
            return Response({
                "success": False,
                "error": "ilan bulunamadı."
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "success": False,
                "error": f"Resim sıralama hatası: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)


