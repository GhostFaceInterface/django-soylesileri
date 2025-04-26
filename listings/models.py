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
    image = models.ImageField(upload_to='listing_images/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.listing.id}"
