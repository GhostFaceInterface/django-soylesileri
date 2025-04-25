from rest_framework import serializers
from .models import Car, CarBrand, CarModel, CarVariant, CarTrim

class CarBrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarBrand
        fields = ['id', 'name']
        
class CarModelSerializer(serializers.ModelSerializer):
    brand = CarBrandSerializer(read_only=True)
    class Meta:
        model = CarModel
        fields = ['id', 'name', 'brand']


class CarVariantSerializer(serializers.ModelSerializer):
    model = CarModelSerializer(read_only=True)
    class Meta:
        model = CarVariant
        fields = ['id', 'name', 'model']

class CarTrimSerializer(serializers.ModelSerializer):
    variant = CarVariantSerializer(read_only=True)
    class Meta:
        model = CarTrim
        fields = ['id', 'name', 'variant']




class CarSerializer(serializers.ModelSerializer):
    brand = CarBrandSerializer(read_only=True)
    model = CarModelSerializer(read_only=True)
    variant = CarVariantSerializer(read_only=True)
    trim = CarTrimSerializer(read_only=True)
    class Meta: 
        model = Car
        fields = [
            "id",
            "brand",
            "model",
            "variant",
            "trim",
            "year",
            "mileage",
            "fuel_type",
            "transmission",
            "color",
            "body_type",
            "engine_power",
        ]

    def validate_engine_power(self, value):
        if value <= 0:
            raise serializers.ValidationError("Motor gücü en az 1 HP olmalıdır.")
        return value
    
    def validate_year(self, value):
        if value < 1885:
            raise serializers.ValidationError("Yıl 1885 veya sonrası olmalıdır (ilk otomobil yılı).")
        return value

