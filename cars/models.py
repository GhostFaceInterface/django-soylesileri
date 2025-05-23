from django.db import models

class CarBrand(models.Model):
    name = models.CharField(max_length=100)

    class Meta:
        ordering = ['name']
        verbose_name = 'Araç Markası'
        verbose_name_plural = 'Araç Markaları'

    def __str__(self):
        return self.name
    
class CarModel(models.Model):
    brand = models.ForeignKey(CarBrand, on_delete=models.CASCADE, related_name='models')
    name = models.CharField(max_length=100)

    class Meta:
        unique_together = ('brand', 'name')
        ordering = ['name']
        verbose_name = 'Araç Modeli'
        verbose_name_plural = 'Araç Modelleri'

    def __str__(self):
        return f"{self.brand.name} {self.name}"
    
class CarVariant(models.Model):
    car = models.ForeignKey(CarModel, on_delete=models.CASCADE, related_name='variants')
    name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.car.brand.name} {self.car.name} {self.name}"
   
   
class CarTrim(models.Model):
    variant = models.ForeignKey(CarVariant, on_delete=models.CASCADE, related_name='trims')
    name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.variant} {self.name}"
    

class Car(models.Model):
    brand = models.ForeignKey(CarBrand, on_delete=models.CASCADE, related_name='cars')
    model = models.ForeignKey(CarModel, on_delete=models.CASCADE, related_name='cars')
    variant = models.ForeignKey(CarVariant, on_delete=models.SET_NULL, related_name='cars', null=True, blank=True)
    trim = models.ForeignKey(CarTrim, on_delete=models.SET_NULL, related_name='cars', null=True, blank=True)
    year = models.PositiveIntegerField()
    mileage = models.PositiveIntegerField()

    FUEL_CHOICES = [
        ('petrol', 'Benzin'),
        ('diesel', 'Dizel'),
        ('electric', 'Elektrik'),
        ('hybrid', 'Hibrit'),
    ]
    fuel_type = models.CharField(max_length=10, choices=FUEL_CHOICES)

    TRANSMISSION_CHOICES = [
        ('manual', 'Manuel'),
        ('automatic', 'Otomatik'),
    ]
    transmission = models.CharField(max_length=10, choices=TRANSMISSION_CHOICES)
    color = models.CharField(max_length=50)
    body_type = models.CharField(max_length=50) # kasa tipi
    engine_power = models.PositiveIntegerField(help_text="Motor gücü (HP)")

    class Meta:
        verbose_name = 'Araç'
        verbose_name_plural = 'Araçlar'

    
    def __str__(self):
        return f"{self.brand.name} {self.model.name} ({self.year})" 

    
