from rest_framework import routers
from django.urls import path, include
from .views import ListingViewSet, ListingImageViewSet

router = routers.DefaultRouter()
router.register(r'listings', ListingViewSet)
router.register(r'listing-images', ListingImageViewSet)

urlpatterns = [
    path('', include(router.urls)),

]