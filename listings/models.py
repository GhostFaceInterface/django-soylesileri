from django.db import models
from django.conf import settings
from locations.models import City
from cars.models import Car


class Listing(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='listings')
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='listings')
    title = models.CharField(max_length=150)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    city = models.ForeignKey(City, on_delete=models.SET_NULL, null=True, related_name='listings')
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)    

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'İlan'
        verbose_name_plural = 'İlanlar'

    def __str__(self):
        return f"{self.title} - {self.car.brand.name} {self.car.model.name} ({self.price} ₺)"

class ListingImage(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to="listing_images/")
    thumbnail = models.ImageField(upload_to="listing_images/thumbnails/", blank=True, null=True)

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
            if size == 'thumbnail' and self.thumbnail:
                return self.thumbnail.url
            elif size == 'original' and self.image:
                return self.image.url
            else:
                return None
        except:
            return None

    def __str__(self):
        return f"{self.listing.title} - Resim {self.order + 1}"
