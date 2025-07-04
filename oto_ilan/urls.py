"""
URL configuration for oto_ilan project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import  settings
from django.conf.urls.static import static
from users.views import CustomTokenObtainPairView


from rest_framework_simplejwt.views import (
    TokenRefreshView
    )

urlpatterns = [
    path("admin/", admin.site.urls),
    
    # API routes - all apps enabled
    path("api/", include("cars.urls")),
    path("api/", include("users.urls")),
    path("api/", include("locations.urls")),
    path("api/", include("listings.urls")),
    path("api/", include("private_messages.urls")),

    # JWT Authentication
    path("api/token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    
    # Django Allauth (for email verification and social auth)
    path("auth/", include("allauth.urls")),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
