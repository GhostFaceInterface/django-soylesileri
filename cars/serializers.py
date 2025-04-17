from rest_framework import serializers
from .models import Car, CarBrand, CarModel

class CarBrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarBrand
        fields = ['id', 'name']
        
class CarModelSerializer(serializers.ModelSerializer):
    brand = CarBrandSerializer(read_only=True)
    class Meta:
        model = CarModel
        fields = ['id', 'name', 'brand']

class CarSerializer(serializers.ModelSerializer):
    brand = CarBrandSerializer(read_only=True)
    model = CarModelSerializer(read_only=True)
    class Meta: 
        model = Car
        fields = [
            "id",
            "brand",
            "model",
            "year",
            "mileage",
            "fuel_type",
            "transmission",
            "color",
            "body_type",
            "engine_power",
            "created_at"
        ]