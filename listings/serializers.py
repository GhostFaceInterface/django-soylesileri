from rest_framework import serializers
from .models import Listing, ListingImage
from users.serializers import UserSerializer
from cars.serializers import CarSerializer
from locations.serializers import ProvinceSerializer, DistrictSerializer, NeighborhoodSerializer
from .utils import ImageProcessor
from cars.models import Car, CarBrand, CarModel, CarVariant, CarTrim
from locations.models import Province, District, Neighborhood



class ListingImageSerializer(serializers.ModelSerializer):
    """
    4:3 formatındaki resim serializer'ı
    """
    # 4:3 resim URL'leri - sadece thumbnail ve original
    thumbnail_url = serializers.SerializerMethodField()  # 320x240
    original_url = serializers.SerializerMethodField()   # 1200x900

    file_size_mb = serializers.SerializerMethodField()
    dimensions = serializers.SerializerMethodField()

    class Meta:
        model = ListingImage
        fields = [
            'id', 'listing', 'image', 'order', 'is_primary',
            'thumbnail_url', 'original_url',
            'file_size', 'file_size_mb', 'dimensions', 'uploaded_at'
        ]
        read_only_fields = ['file_size', 'width', 'height']

    def get_thumbnail_url(self, obj):
        thumbnail_url = obj.get_image_url(size='thumbnail')
        if thumbnail_url:
            # Request context varsa tam URL oluştur
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(thumbnail_url)
            # Context yoksa Django'nun tam URL'ini oluştur
            return f"http://localhost:8000{thumbnail_url}"
        return None
    
    def get_original_url(self, obj):
        original_url = obj.get_image_url(size='original')
        if original_url:
            # Request context varsa tam URL oluştur
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(original_url)
            # Context yoksa Django'nun tam URL'ini oluştur
            return f"http://localhost:8000{original_url}"
        return None
    
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
            listing = Listing.objects.get(id=value)
            # Check if the user owns this listing
            request = self.context.get('request')
            if request and listing.user != request.user:
                raise serializers.ValidationError("You don't have permission to upload images for this listing.")
            return value
        except Listing.DoesNotExist:
            raise serializers.ValidationError("İlan bulunamadı.")
    
    def create(self, validated_data):
        listing_id = validated_data['listing_id']
        images = validated_data['images']
        listing = Listing.objects.get(id=listing_id)
        
        created_images = []
        for image in images:
            listing_image = ListingImage.objects.create(
                listing=listing,
                image=image
            )
            created_images.append(listing_image)
        
        return created_images

# NEW: İlan oluşturma için özel serializer
class CreateListingSerializer(serializers.ModelSerializer):
    # Araç bilgileri
    brand_id = serializers.IntegerField(write_only=True)
    model_id = serializers.IntegerField(write_only=True)
    variant_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    trim_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    # Araç detayları
    year = serializers.IntegerField(write_only=True)
    mileage = serializers.IntegerField(write_only=True)
    fuel_type = serializers.ChoiceField(choices=Car.FUEL_CHOICES, write_only=True)
    transmission = serializers.ChoiceField(choices=Car.TRANSMISSION_CHOICES, write_only=True)
    color = serializers.CharField(max_length=50, write_only=True)
    body_type = serializers.CharField(max_length=50, write_only=True)
    engine_power = serializers.IntegerField(write_only=True)
    
    # Yeni location yapısı
    province_id = serializers.IntegerField(write_only=True)
    district_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    neighborhood_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    # Response için read-only alanlar
    car = CarSerializer(read_only=True)
    province = ProvinceSerializer(read_only=True)
    district = DistrictSerializer(read_only=True)
    neighborhood = NeighborhoodSerializer(read_only=True)
    
    class Meta:
        model = Listing
        fields = [
            'id', 'title', 'description', 'price', 'is_active',
            'brand_id', 'model_id', 'variant_id', 'trim_id',
            'year', 'mileage', 'fuel_type', 'transmission', 'color', 'body_type', 'engine_power',
            'province_id', 'district_id', 'neighborhood_id', 
            'car', 'province', 'district', 'neighborhood', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_brand_id(self, value):
        if not CarBrand.objects.filter(id=value).exists():
            raise serializers.ValidationError("Geçersiz marka seçimi.")
        return value
    
    def validate_model_id(self, value):
        if not CarModel.objects.filter(id=value).exists():
            raise serializers.ValidationError("Geçersiz model seçimi.")
        return value
    
    def validate_variant_id(self, value):
        if value and not CarVariant.objects.filter(id=value).exists():
            raise serializers.ValidationError("Geçersiz varyant seçimi.")
        return value
    
    def validate_trim_id(self, value):
        if value and not CarTrim.objects.filter(id=value).exists():
            raise serializers.ValidationError("Geçersiz donanım seçimi.")
        return value
    
    def validate_province_id(self, value):
        if not Province.objects.filter(id=value).exists():
            raise serializers.ValidationError("Geçersiz il seçimi.")
        return value
    
    def validate_district_id(self, value):
        if value and not District.objects.filter(id=value).exists():
            raise serializers.ValidationError("Geçersiz ilçe seçimi.")
        return value
    
    def validate_neighborhood_id(self, value):
        if value and not Neighborhood.objects.filter(id=value).exists():
            raise serializers.ValidationError("Geçersiz mahalle seçimi.")
        return value
    
    def validate_year(self, value):
        if value < 1885 or value > 2025:
            raise serializers.ValidationError("Yıl 1885-2025 arasında olmalıdır.")
        return value
    
    def validate_mileage(self, value):
        if value < 0:
            raise serializers.ValidationError("Kilometre negatif olamaz.")
        return value
    
    def validate_engine_power(self, value):
        if value <= 0:
            raise serializers.ValidationError("Motor gücü en az 1 HP olmalıdır.")
        return value
    
    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Fiyat 0'dan büyük olmalıdır.")
        return value
        
    def validate(self, attrs):
        # Model, brand ile uyumlu mu?
        model = CarModel.objects.filter(id=attrs['model_id']).first()
        if model and model.brand_id != attrs['brand_id']:
            raise serializers.ValidationError("Seçilen model, seçilen marka ile uyumlu değil.")
        
        # Variant, model ile uyumlu mu?
        variant_id = attrs.get('variant_id')
        if variant_id:
            variant = CarVariant.objects.filter(id=variant_id).first()
            if variant and variant.car_id != attrs['model_id']:
                raise serializers.ValidationError("Seçilen varyant, seçilen model ile uyumlu değil.")
        
        # Trim, variant ile uyumlu mu?
        trim_id = attrs.get('trim_id')
        if trim_id and variant_id:
            trim = CarTrim.objects.filter(id=trim_id).first()
            if trim and trim.variant_id != variant_id:
                raise serializers.ValidationError("Seçilen donanım, seçilen varyant ile uyumlu değil.")
        
        # Location hiyerarşi kontrolü
        district_id = attrs.get('district_id')
        neighborhood_id = attrs.get('neighborhood_id')
        province_id = attrs.get('province_id')
        
        if district_id:
            district = District.objects.filter(id=district_id).first()
            if district and district.province_id != province_id:
                raise serializers.ValidationError("Seçilen ilçe, seçilen ile ait değil.")
        
        if neighborhood_id:
            if not district_id:
                raise serializers.ValidationError("Mahalle seçmek için önce ilçe seçmelisiniz.")
            neighborhood = Neighborhood.objects.filter(id=neighborhood_id).first()
            if neighborhood and neighborhood.district_id != district_id:
                raise serializers.ValidationError("Seçilen mahalle, seçilen ilçeye ait değil.")
        
        return attrs
    
    def create(self, validated_data):
        # Araç bilgilerini al
        brand = CarBrand.objects.get(id=validated_data.pop('brand_id'))
        model = CarModel.objects.get(id=validated_data.pop('model_id'))
        variant = None
        trim = None
        
        variant_id = validated_data.pop('variant_id', None)
        if variant_id:
            variant = CarVariant.objects.get(id=variant_id)
        
        trim_id = validated_data.pop('trim_id', None)
        if trim_id:
            trim = CarTrim.objects.get(id=trim_id)
        
        # Location bilgilerini al
        province = Province.objects.get(id=validated_data.pop('province_id'))
        district = None
        neighborhood = None
        
        district_id = validated_data.pop('district_id', None)
        if district_id:
            district = District.objects.get(id=district_id)
            
        neighborhood_id = validated_data.pop('neighborhood_id', None)
        if neighborhood_id:
            neighborhood = Neighborhood.objects.get(id=neighborhood_id)
        
        # Car objesi oluştur
        car_data = {
            'brand': brand,
            'model': model,
            'variant': variant,
            'trim': trim,
            'year': validated_data.pop('year'),
            'mileage': validated_data.pop('mileage'),
            'fuel_type': validated_data.pop('fuel_type'),
            'transmission': validated_data.pop('transmission'),
            'color': validated_data.pop('color'),
            'body_type': validated_data.pop('body_type'),
            'engine_power': validated_data.pop('engine_power'),
        }
        
        car = Car.objects.create(**car_data)
        
        # Listing oluştur
        validated_data['car'] = car
        validated_data['province'] = province
        validated_data['district'] = district
        validated_data['neighborhood'] = neighborhood
        
        return super().create(validated_data)

class ListingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    car = CarSerializer(read_only=True)
    
    # Yeni location yapısı
    province = ProvinceSerializer(read_only=True)
    district = DistrictSerializer(read_only=True)
    neighborhood = NeighborhoodSerializer(read_only=True)
    full_address = serializers.ReadOnlyField()  # Model property'sinden

    images = ListingImageSerializer(many=True, read_only=True)
    primary_image = serializers.SerializerMethodField()
    image_count = serializers.SerializerMethodField()
    is_premium = serializers.ReadOnlyField()  # Property'den otomatik gelir

    class Meta:
        model = Listing
        fields = [
            'id',
            'user',
            'car',
            'title',
            'description',
            'price',
            'province',
            'district', 
            'neighborhood',
            'full_address',
            'is_active',
            'is_premium',
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
        return obj.images.count()
    
    def validate_price(self,value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0.")
        return value
    
    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")
        return value

# NEW: İlan düzenleme için serializer
class UpdateListingSerializer(serializers.ModelSerializer):
    # Araç bilgileri
    brand_id = serializers.IntegerField(write_only=True, required=False)
    model_id = serializers.IntegerField(write_only=True, required=False)
    variant_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    trim_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    # Araç detayları
    year = serializers.IntegerField(write_only=True, required=False)
    mileage = serializers.IntegerField(write_only=True, required=False)
    fuel_type = serializers.ChoiceField(choices=Car.FUEL_CHOICES, write_only=True, required=False)
    transmission = serializers.ChoiceField(choices=Car.TRANSMISSION_CHOICES, write_only=True, required=False)
    color = serializers.CharField(max_length=50, write_only=True, required=False)
    body_type = serializers.CharField(max_length=50, write_only=True, required=False)
    engine_power = serializers.IntegerField(write_only=True, required=False)
    
    # Yeni location yapısı
    province_id = serializers.IntegerField(write_only=True, required=False)
    district_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    neighborhood_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    # Response için read-only alanlar
    car = CarSerializer(read_only=True)
    province = ProvinceSerializer(read_only=True)
    district = DistrictSerializer(read_only=True)
    neighborhood = NeighborhoodSerializer(read_only=True)
    
    class Meta:
        model = Listing
        fields = [
            'id', 'title', 'description', 'price', 'is_active',
            'brand_id', 'model_id', 'variant_id', 'trim_id',
            'year', 'mileage', 'fuel_type', 'transmission', 'color', 'body_type', 'engine_power',
            'province_id', 'district_id', 'neighborhood_id',
            'car', 'province', 'district', 'neighborhood', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_brand_id(self, value):
        if not CarBrand.objects.filter(id=value).exists():
            raise serializers.ValidationError("Geçersiz marka seçimi.")
        return value
    
    def validate_model_id(self, value):
        if not CarModel.objects.filter(id=value).exists():
            raise serializers.ValidationError("Geçersiz model seçimi.")
        return value
    
    def validate_variant_id(self, value):
        if value and not CarVariant.objects.filter(id=value).exists():
            raise serializers.ValidationError("Geçersiz varyant seçimi.")
        return value
    
    def validate_trim_id(self, value):
        if value and not CarTrim.objects.filter(id=value).exists():
            raise serializers.ValidationError("Geçersiz donanım seçimi.")
        return value
    
    def validate_province_id(self, value):
        if not Province.objects.filter(id=value).exists():
            raise serializers.ValidationError("Geçersiz il seçimi.")
        return value
    
    def validate_district_id(self, value):
        if value and not District.objects.filter(id=value).exists():
            raise serializers.ValidationError("Geçersiz ilçe seçimi.")
        return value
    
    def validate_neighborhood_id(self, value):
        if value and not Neighborhood.objects.filter(id=value).exists():
            raise serializers.ValidationError("Geçersiz mahalle seçimi.")
        return value
    
    def validate_year(self, value):
        if value < 1885 or value > 2025:
            raise serializers.ValidationError("Yıl 1885-2025 arasında olmalıdır.")
        return value
    
    def validate_mileage(self, value):
        if value < 0:
            raise serializers.ValidationError("Kilometre negatif olamaz.")
        return value
    
    def validate_engine_power(self, value):
        if value <= 0:
            raise serializers.ValidationError("Motor gücü en az 1 HP olmalıdır.")
        return value
    
    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Fiyat 0'dan büyük olmalıdır.")
        return value
    
    def validate(self, attrs):
        # Validation sadece değişen alanlar için yapılır
        if 'model_id' in attrs and 'brand_id' in attrs:
            model = CarModel.objects.filter(id=attrs['model_id']).first()
            if model and model.brand_id != attrs['brand_id']:
                raise serializers.ValidationError("Seçilen model, seçilen marka ile uyumlu değil.")
        
        # Variant, model ile uyumlu mu?
        if 'variant_id' in attrs and 'model_id' in attrs:
            variant_id = attrs.get('variant_id')
            if variant_id:
                variant = CarVariant.objects.filter(id=variant_id).first()
                if variant and variant.car_id != attrs['model_id']:
                    raise serializers.ValidationError("Seçilen varyant, seçilen model ile uyumlu değil.")
        
        # Trim, variant ile uyumlu mu?
        if 'trim_id' in attrs and 'variant_id' in attrs:
            trim_id = attrs.get('trim_id')
            variant_id = attrs.get('variant_id')
            if trim_id and variant_id:
                trim = CarTrim.objects.filter(id=trim_id).first()
                if trim and trim.variant_id != variant_id:
                    raise serializers.ValidationError("Seçilen donanım, seçilen varyant ile uyumlu değil.")
        
        # Location hiyerarşi kontrolü
        district_id = attrs.get('district_id')
        neighborhood_id = attrs.get('neighborhood_id')
        province_id = attrs.get('province_id')
        
        if district_id and province_id:
            district = District.objects.filter(id=district_id).first()
            if district and district.province_id != province_id:
                raise serializers.ValidationError("Seçilen ilçe, seçilen ile ait değil.")
        
        if neighborhood_id and district_id:
            neighborhood = Neighborhood.objects.filter(id=neighborhood_id).first()
            if neighborhood and neighborhood.district_id != district_id:
                raise serializers.ValidationError("Seçilen mahalle, seçilen ilçeye ait değil.")
        
        return attrs
    
    def update(self, instance, validated_data):
        # Araç bilgilerini güncelle
        car_fields = ['year', 'mileage', 'fuel_type', 'transmission', 'color', 'body_type', 'engine_power']
        car_data = {}
        
        for field in car_fields:
            if field in validated_data:
                car_data[field] = validated_data.pop(field)
        
        # Marka/model değişikliği var mı?
        brand_id = validated_data.pop('brand_id', None)
        model_id = validated_data.pop('model_id', None)
        variant_id = validated_data.pop('variant_id', None)
        trim_id = validated_data.pop('trim_id', None)
        
        # Location değişiklikleri
        province_id = validated_data.pop('province_id', None)
        district_id = validated_data.pop('district_id', None)
        neighborhood_id = validated_data.pop('neighborhood_id', None)
        
        if brand_id:
            car_data['brand'] = CarBrand.objects.get(id=brand_id)
        if model_id:
            car_data['model'] = CarModel.objects.get(id=model_id)
        if variant_id:
            car_data['variant'] = CarVariant.objects.get(id=variant_id)
        elif 'variant_id' in validated_data:  # None gelmiş
            car_data['variant'] = None
        if trim_id:
            car_data['trim'] = CarTrim.objects.get(id=trim_id)
        elif 'trim_id' in validated_data:  # None gelmiş
            car_data['trim'] = None
        
        # Car objesini güncelle
        if car_data:
            for field, value in car_data.items():
                setattr(instance.car, field, value)
            instance.car.save()
        
        # Location bilgilerini güncelle
        if province_id:
            instance.province = Province.objects.get(id=province_id)
        if district_id:
            instance.district = District.objects.get(id=district_id)
        elif 'district_id' in validated_data:  # None gelmiş
            instance.district = None
        if neighborhood_id:
            instance.neighborhood = Neighborhood.objects.get(id=neighborhood_id)
        elif 'neighborhood_id' in validated_data:  # None gelmiş
            instance.neighborhood = None
        
        # Listing objesini güncelle
        return super().update(instance, validated_data)