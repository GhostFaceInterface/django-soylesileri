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

class ListingImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingImage
        fields = ['id', 'listing', 'image', 'uploaded_at']