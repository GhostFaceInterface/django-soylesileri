from rest_framework.routers import DefaultRouter
from .views import ProvinceViewSet, DistrictViewSet, NeighborhoodViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'provinces', ProvinceViewSet, basename='province')
router.register(r'districts', DistrictViewSet, basename='district')
router.register(r'neighborhoods', NeighborhoodViewSet, basename='neighborhood')

urlpatterns = [
    path('', include(router.urls)),
]