from rest_framework import serializers
from .models import Listing, ListingImage
from users.serializers import UserSerializer
from cars.serializers import CarSerializer
from locations.serializers import CitySerializer
from .utils import ImageProcessor



class ListingImageSerializer(serializers.ModelSerializer):
    """
    16:9 formatındaki resim serializer'ı
    """
    # Farklı boyutlardaki 16:9 resim URL'leri
    thumbnail_url = serializers.SerializerMethodField()  # 320x180
    medium_url = serializers.SerializerMethodField()     # 854x480
    large_url = serializers.SerializerMethodField()      # 1280x720
    original_url = serializers.SerializerMethodField()   # 1920x1080

    file_size_mb = serializers.SerializerMethodField()
    dimensions = serializers.SerializerMethodField()

    class Meta:
        model = ListingImage
        fields = [
            'id', 'listing', 'image', 'order', 'is_primary',
            'thumbnail_url', 'medium_url', 'large_url', 'original_url',
            'file_size', 'file_size_mb', 'dimensions', 'uploaded_at'
        ]
        read_only_fields = ['file_size', 'width', 'height']

    def get_thumbnail_url(self,obj):
        return obj.get_image_url(size='thumbnail')
    
    def get_medium_url(self, obj):
        return obj.get_image_url(size='medium')
    
    def get_large_url(self, obj):
        return obj.get_image_url(size='large')
    
    def get_original_url(self, obj):
        return obj.get_image_url(size='original')
    
    def get_file_size_mb(self, obj):
        if obj.file_size:
            return round(obj.file_size / (1024 * 1024), 2)

    def get_dimensions(self, obj):
        if obj.width and obj.height:
            return f"{obj.width}x{obj.height}"
        return None

    def validate_image(self, value):
        try:
            ImageProcessor.validate_image(value)
        except Exception as e:
            raise serializers.ValidationError(f"Image validation failed: {str(e)}")
        return value
    
class BulkImageUploadSerializer(serializers.Serializer):
    listing_id = serializers.IntegerField()
    images = serializers.ListField(
        child=serializers.ImageField(),
        max_length=10,  # Max 10 images per upload
        min_length=1,  # At least 1 image required
    )

    def validate_listing_id(self, value):
        try:
            listing=Listing.objects.get(id=value)
            request = self.context.get("request")
            if request and listing.user !=request.user:
                raise serializers.ValidationError("You do not have permission to upload images for this listing.")
            return value
        except Listing.DoesNotExist:
            raise serializers.ValidationError("Listing does not exist.")
        
    def validate_images(self, value):
        for image in value:
            try: 
                ImageProcessor.validate_image(image)
            except Exception as e:
                raise serializers.ValidationError(f"Image validation failed: {str(e)}")
        return value
    

    def create (self, validated_data):
        listing_id = validated_data["listing_id"]
        images = validated_data["images"]
        listing = Listing.objects.get(id=listing_id)

        created_images = []
        for index, image in enumerate(images):
            listing_image = ListingImage.objects.create(
                listing=listing,
                image=image,
                order=index,
                is_primary=(index==0 and not listing.images.filter(is_primary=True).exists())
            )
            created_images.append(listing_image)

        return created_images
    

class ListingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    car = CarSerializer(read_only=True)
    city = CitySerializer(read_only=True)

    images = ListingImageSerializer(many=True, read_only=True)
    primary_image = serializers.SerializerMethodField()
    image_count = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = [
            'id',
            'user',
            'car',
            'title',
            'description',
            'price',
            'city',
            'is_active',
            'created_at',
            'updated_at',
            'images',
            'primary_image',
            'image_count'
        ]

    def get_primary_image(self, obj):
        primary_image = obj.images.filter(is_primary=True).first()
        if primary_image:
            # Use the ListingImageSerializer to serialize the primary image
            return ListingImageSerializer(primary_image).data
        first = obj.images.first()
        if first:
            return ListingImageSerializer(first, context=self.context).data
        return None
        
    def get_image_count(self, obj):
        return obj.İmages.count()
    

    def validate_price(self,value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0.")
        return value
    
    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")
        return value