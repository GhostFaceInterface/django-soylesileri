from django.contrib import admin
from .models import CarBrand, CarModel, Car
# Register your models here.

admin.site.register(CarBrand)
admin.site.register(CarModel)
admin.site.register(Car)