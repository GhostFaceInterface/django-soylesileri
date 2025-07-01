from rest_framework import serializers
from .models import Province, District, Neighborhood

class ProvinceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Province
        fields = ['id', 'api_id', 'name']

class DistrictSerializer(serializers.ModelSerializer):
    province_name = serializers.CharField(source='province.name', read_only=True)
    
    class Meta:
        model = District
        fields = ['id', 'api_id', 'name', 'province', 'province_name']

class NeighborhoodSerializer(serializers.ModelSerializer):
    district_name = serializers.CharField(source='district.name', read_only=True)
    province_name = serializers.CharField(source='district.province.name', read_only=True)
    
    class Meta:
        model = Neighborhood
        fields = ['id', 'api_id', 'name', 'district', 'district_name', 'province_name']
