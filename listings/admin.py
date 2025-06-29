from django.contrib import admin
from .models import Listing, ListingImage

# Inline yapı: İlan düzenlerken resimleri de altına ekleyebil
class ListingImageInline(admin.TabularInline):
    model = ListingImage
    extra = 3
    fields = ['image', 'order', 'is_primary', 'file_size', 'width', 'height']
    readonly_fields = ['file_size', 'width', 'height']

# İlan için özelleştirilmiş admin görünümü
@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    inlines = [ListingImageInline]
    list_display = [
        'title', 
        'get_brand',
        'get_model',
        'get_variant',
        'price',  
        'city',
        'user', 
        'created_at'
        ]
    list_filter = ['city', 'user', 'is_active']

    def get_brand(self, obj):
        return obj.car.brand.name
    get_brand.short_description = "Marka"

    def get_model(self, obj):
        return obj.car.model.name
    get_model.short_description = "Model"

    def get_variant(self, obj):
        return obj.car.variant.name if obj.car.variant else "-"
    get_variant.short_description = "Varyant"

# Resim için de özelleştirilmiş admin görünümü
@admin.register(ListingImage)
class ListingImageAdmin(admin.ModelAdmin):
    list_display = ['listing', 'image', 'order', 'is_primary', 'file_size', 'uploaded_at']
    list_filter = ['listing', 'is_primary']
    readonly_fields = ['file_size', 'width', 'height', 'uploaded_at']
    fields = ['listing', 'image', 'order', 'is_primary', 'file_size', 'width', 'height', 'uploaded_at']
