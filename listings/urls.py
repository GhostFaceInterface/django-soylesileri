from rest_framework import routers
from django.urls import path, include
from views import ListingViewSet

router = routers.DefaultRouter()
router.register(r'listings', ListingViewSet)

urlpatterns = [
    path('', include(router.urls)),
]