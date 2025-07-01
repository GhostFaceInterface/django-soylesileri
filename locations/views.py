from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import Province, District, Neighborhood
from .serializers import ProvinceSerializer, DistrictSerializer, NeighborhoodSerializer


class ProvinceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    İller için ViewSet
    """
    queryset = Province.objects.all()
    serializer_class = ProvinceSerializer
    permission_classes = [AllowAny]
    
    @action(detail=True, methods=['get'])
    def districts(self, request, pk=None):
        """
        Bir ilin ilçelerini getir
        GET /api/provinces/{id}/districts/
        """
        province = self.get_object()
        districts = District.objects.filter(province=province)
        serializer = DistrictSerializer(districts, many=True)
        return Response(serializer.data)


class DistrictViewSet(viewsets.ReadOnlyModelViewSet):
    """
    İlçeler için ViewSet
    """
    queryset = District.objects.select_related('province').all()
    serializer_class = DistrictSerializer
    permission_classes = [AllowAny]
    
    @action(detail=True, methods=['get'])
    def neighborhoods(self, request, pk=None):
        """
        Bir ilçenin mahallelerini getir
        GET /api/districts/{id}/neighborhoods/
        """
        district = self.get_object()
        neighborhoods = Neighborhood.objects.filter(district=district)
        serializer = NeighborhoodSerializer(neighborhoods, many=True)
        return Response(serializer.data)


class NeighborhoodViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Mahalleler için ViewSet
    """
    queryset = Neighborhood.objects.select_related('district__province').all()
    serializer_class = NeighborhoodSerializer
    permission_classes = [AllowAny]

# Create your views here.
