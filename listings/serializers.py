from rest_framework import serializers
from .models import Listing, ListingImage
from users.serializers import UserSerializer
from cars.serializers import CarSerializer
from locations.serializers import CitySerializer

class ListingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    car = CarSerializer(read_only=True)
    city = CitySerializer(read_only=True)

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
            'updated_at'
        ]
    def validate_price(self,value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0.")
        return value
    
    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")
        return value

class ListingImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingImage
        fields = ['id', 'listing', 'image', 'uploaded_at']

    