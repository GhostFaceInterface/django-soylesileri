from django.contrib import admin
from .models import Listing, ListingImage

# Inline yapı: İlan düzenlerken resimleri de altına ekleyebil
class ListingImageInline(admin.TabularInline):
    model = ListingImage
    extra = 3

# İlan için özelleştirilmiş admin görünümü
@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    inlines = [ListingImageInline]
    list_display = ['title', 'price', 'city', 'user', 'created_at']
    list_filter = ['city', 'user', 'is_active']

# Resim için de özelleştirilmiş admin görünümü
@admin.register(ListingImage)
class ListingImageAdmin(admin.ModelAdmin):
    list_display = ['listing', 'image']
    list_filter = ['listing']
