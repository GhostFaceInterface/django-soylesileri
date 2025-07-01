from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from .models import Listing, ListingImage
from .serializers import (
    ListingSerializer,
    CreateListingSerializer,
    UpdateListingSerializer,
    ListingImageSerializer,
    BulkImageUploadSerializer
    )
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from rest_framework import exceptions 
from .permissions import IsOwnerOrReadOnly
from core.throttles import ListingCreateThrottle
from .filters import ListingsFilter
from django.db.models import Q
from functools import reduce
import operator

class ListingPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 50

class ListingViewSet(viewsets.ModelViewSet):
    queryset = Listing.objects.all()
    serializer_class = ListingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]  
    # Allow authenticated users to create, update, and delete listings, but allow anyone to read them
    pagination_class = ListingPagination

    filter_backends = [
        DjangoFilterBackend,
    ]
    filterset_class = ListingsFilter
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CreateListingSerializer
        elif self.action in ['update', 'partial_update']:
            return UpdateListingSerializer
        return ListingSerializer
    
    def get_queryset(self):
        queryset = Listing.objects.filter(is_deleted=False)
        
        # Handle multi-search for brands and models
        brands = self.request.query_params.getlist('brand')
        models = self.request.query_params.getlist('model')
        variants = self.request.query_params.getlist('variant')
        trims = self.request.query_params.getlist('trim')
        
        # Create search combinations
        search_conditions = []
        
        # If we have multiple search criteria, combine them with OR
        if brands or models or variants or trims:
            # Convert string IDs to integers, filter out empty values
            brand_ids = [int(b) for b in brands if b.strip()]
            model_ids = [int(m) for m in models if m.strip()]
            variant_ids = [int(v) for v in variants if v.strip()]
            trim_ids = [int(t) for t in trims if t.strip()]
            
            # Build combinations - this allows for flexible multi-search
            conditions = []
            
            if brand_ids:
                conditions.append(Q(car__brand__id__in=brand_ids))
            if model_ids:
                conditions.append(Q(car__model__id__in=model_ids))
            if variants:
                conditions.append(Q(car__variant__id__in=variant_ids))
            if trim_ids:
                conditions.append(Q(car__trim__id__in=trim_ids))
            
            # Combine all conditions with OR for maximum flexibility
            if conditions:
                combined_condition = reduce(operator.or_, conditions)
                queryset = queryset.filter(combined_condition)
        
        return queryset.select_related(
            'user', 'car', 'car__brand', 'car__model', 'car__variant', 
            'province', 'district', 'neighborhood'
        ).prefetch_related('images').distinct()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        '''perform_create, POST isteğiyle yeni bir Listing oluşturulurken,
            onu hangi kullanıcının oluşturduğunu (request.user) kaydetmeye yarar.'''
        
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Response için ListingSerializer kullan
        listing = serializer.instance
        response_serializer = ListingSerializer(listing, context={'request': request})
        
        headers = self.get_success_headers(serializer.data)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Response için ListingSerializer kullan
        response_serializer = ListingSerializer(serializer.instance, context={'request': request})
        
        return Response(response_serializer.data)

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
                if not isinstance(item, dict) or "id" not in item or "order" not in item:
                    return Response({
                        "success": False,
                        "error": f"Invalid item format: {item}"
                    }, status=status.HTTP_400_BAD_REQUEST)
                for item in image_orders:
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


