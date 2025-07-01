from django.contrib import admin
from .models import Province, District, Neighborhood

class DistrictInline(admin.TabularInline):
    """İl detay sayfasında ilçeleri göster"""
    model = District
    extra = 0
    readonly_fields = ['api_id']

class NeighborhoodInline(admin.TabularInline):
    """İlçe detay sayfasında mahalleleri göster"""
    model = Neighborhood
    extra = 0  
    readonly_fields = ['api_id']

@admin.register(Province)
class ProvinceAdmin(admin.ModelAdmin):
    list_display = ['name', 'api_id', 'district_count']
    list_filter = ['name']
    search_fields = ['name']
    readonly_fields = ['api_id']
    inlines = [DistrictInline]
    
    def district_count(self, obj):
        """İlin toplam ilçe sayısını göster"""
        return obj.districts.count()
    district_count.short_description = 'İlçe Sayısı'

@admin.register(District)  
class DistrictAdmin(admin.ModelAdmin):
    list_display = ['name', 'province', 'api_id', 'neighborhood_count']
    list_filter = ['province']
    search_fields = ['name', 'province__name']
    readonly_fields = ['api_id']
    inlines = [NeighborhoodInline]
    
    def neighborhood_count(self, obj):
        """İlçenin toplam mahalle sayısını göster"""
        return obj.neighborhoods.count()
    neighborhood_count.short_description = 'Mahalle Sayısı'

@admin.register(Neighborhood)
class NeighborhoodAdmin(admin.ModelAdmin):
    list_display = ['name', 'district', 'get_province', 'api_id']
    list_filter = ['district__province', 'district']
    search_fields = ['name', 'district__name', 'district__province__name']
    readonly_fields = ['api_id']
    
    def get_province(self, obj):
        """Mahallenin ilini göster"""
        return obj.district.province.name if obj.district else '-'
    get_province.short_description = 'İl'   