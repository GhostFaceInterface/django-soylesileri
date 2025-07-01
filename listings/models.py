from django.db import models
from django.conf import settings
from locations.models import Province, District, Neighborhood
from cars.models import Car


class Listing(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='listings')
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='listings')
    title = models.CharField(max_length=150)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Yeni location yapısı - hiyerarşik adres bilgisi
    province = models.ForeignKey(Province, on_delete=models.SET_NULL, null=True, blank=True, 
                                verbose_name='İl', related_name='listings')
    district = models.ForeignKey(District, on_delete=models.SET_NULL, null=True, blank=True,
                                verbose_name='İlçe', related_name='listings') 
    neighborhood = models.ForeignKey(Neighborhood, on_delete=models.SET_NULL, null=True, blank=True,
                                    verbose_name='Mahalle', related_name='listings')
    
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)    

    @property
    def is_premium(self):
        """
        15 milyon ve üzeri araçlar otomatik premium ilan
        """
        return self.price >= 15000000

    @property 
    def full_address(self):
        """
        Tam adres bilgisini döndürür: Mahalle, İlçe, İl
        """
        address_parts = []
        if self.neighborhood:
            address_parts.append(self.neighborhood.name)
        if self.district:
            address_parts.append(self.district.name)
        if self.province:
            address_parts.append(self.province.name)
        return ", ".join(address_parts) if address_parts else "Adres belirtilmemiş"

    def clean(self):
        """
        Model validation - tutarlılık kontrolü
        """
        from django.core.exceptions import ValidationError
        
        # Eğer mahalle seçilmişse, o mahallenin ilçesi de seçilmeli
        if self.neighborhood and self.district != self.neighborhood.district:
            raise ValidationError({
                'district': 'Seçilen mahalle bu ilçeye ait değil.'
            })
        
        # Eğer ilçe seçilmişse, o ilçenin ili de seçilmeli  
        if self.district and self.province != self.district.province:
            raise ValidationError({
                'province': 'Seçilen ilçe bu ile ait değil.'
            })

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'İlan'
        verbose_name_plural = 'İlanlar'

    def __str__(self):
        location_info = f" - {self.full_address}" if any([self.province, self.district, self.neighborhood]) else ""
        return f"{self.title} - {self.car.brand.name} {self.car.model.name} ({self.price} ₺){location_info}"

class ListingImage(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to="listing_images/")
    # thumbnail alanı kaldırıldı - signals ile otomatik oluşturuluyor

    order = models.PositiveIntegerField(default=0, help_text="Resim sırası, 0 en önde")
    is_primary = models.BooleanField(default=False, help_text="Bu resim ana resim olarak işaretlensin mi?")

    file_size = models.PositiveIntegerField(help_text="Dosya boyutu (byte cinsinden)", null=True, blank=True)
    width = models.PositiveIntegerField(help_text="Resim genişliği", null=True, blank=True)
    height = models.PositiveIntegerField(help_text="Resim yüksekliği", null=True, blank=True)

    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'uploaded_at']
        verbose_name = 'İlan Resmi'
        verbose_name_plural = 'İlan Resimleri'

    @property
    def thumbnail_url(self):
        """Otomatik oluşturulan thumbnail'ın URL'ini döndür"""
        if self.image:
            # Ana resim dosya yolundan thumbnail yolunu oluştur
            import os
            base_name = os.path.splitext(self.image.name)[0]
            # Sadece dosya adını al (path kaldır)
            clean_base_name = os.path.basename(base_name)
            thumbnail_path = f"listing_images/thumbnails/{clean_base_name}_thumbnail.jpg"
            try:
                from django.core.files.storage import default_storage
                if default_storage.exists(thumbnail_path):
                    return default_storage.url(thumbnail_path)
            except:
                pass
        return None

    def save(self, *args, **kwargs):
        # Sadece basit model logic - ağır işler signals'da
        if self.is_primary:
            ListingImage.objects.filter(
                listing=self.listing,
                is_primary=True
            ).exclude(pk=self.pk).update(is_primary=False)
        super().save(*args, **kwargs)

    def get_image_url(self, size='original'):
        """
        4:3 formatındaki resim URL'lerini döndür
        """
        try:
            if size == 'thumbnail':
                return self.thumbnail_url
            elif size == 'original' and self.image:
                return self.image.url
            else:
                return None
        except:
            return None

    def __str__(self):
        return f"{self.listing.title} - Resim {self.order + 1}"
