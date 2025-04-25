from django.contrib import admin
from .models import CarBrand, CarModel, Car, CarVariant, CarTrim
# Register your models here.

admin.site.register(CarBrand)
admin.site.register(CarModel)
admin.site.register(Car)
admin.site.register(CarVariant)
admin.site.register(CarTrim)