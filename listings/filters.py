import django_filters
from django.db import models
import django_filters.widgets
from .models import Listing
from cars.models import Car, CarBrand
from locations.models import City


class ListingsFilter(django_filters.FilterSet):
    """
    Bu sınıf, Listing modelimiz için gelişmiş filtreleme seçenekleri sağlar.
    
    Python Syntax Açıklaması:
    - django_filters.FilterSet: Django-filter kütüphanesinin temel sınıfı
    - Bu sınıftan miras aldığımız için (inheritance) FilterSet'in tüm özelliklerini kullanabiliriz
    """
    min_price = django_filters.NumberFilter(
        field_name="price",
        lookup_expr="gte", # greater than or equal (>=)
        label="Minimum Fiyat"
    )
    max_price = django_filters.NumberFilter(
        field_name="price",
        lookup_expr="lte", # less than or equal (<=)
        label="Maksimum Fiyat"
    )

    min_milage = django_filters.NumberFilter(
        field_name="car__milage",
        lookup_expr="gte",  # greater than or equal (>=)
        label="Minimum Kilometre"
    )

    max_milage = django_filters.NumberFilter(
        field_name="car__milage",
        lookup_expr="lte",
        label="Maksimum Kilometre"
    )

    min_year = django_filters.NumberFilter(
        field_name="car__year",
        lookup_expr="gte",  # greater than or equal (>=)
        label="Minimum Yıl"
    )

    max_year = django_filters.NumberFilter(
        field_name="car__year",
        lookup_expr="lte",
        label="Maksimum Yıl"
    )

    fuel_type = django_filters.MultipleChoiceFilter(
        field_name="car__fuel_type",
        choices= Car.FUEL_CHOICES,
        label="Yakıt Tipi"
    )

    transmission = django_filters.MultipleChoiceFilter(
        field_name="car__transmission",
        choices=Car.TRANSMISSION_CHOICES,
        label="Şanzıman Tipi"
    )

    color = django_filters.CharFilter(
        field_name="car__color",
        lookup_expr="contains",  # contains (içeren)
        label="Renk"
    )


    min_engine_power = django_filters.NumberFilter(
        field_name="car__engine_power",
        lookup_expr="gte",  # greater than or equal (>=)
        label="Minimum Motor Gücü"
    )

    max_engine_power = django_filters.NumberFilter(
        field_name="car__engine_power",
        lookup_expr="lte",  # less than or equal (<=)
        label="Maksimum Motor Gücü"
    )

    city = django_filters.ModelMultipleChoiceFilter(
        queryset=City.objects.all(),
        widget=django_filters.widgets.CSVWidget,
        label="Şehirler",
    )

    brand = django_filters.ModelMultipleChoiceFilter(
        field_name="car__brand",
        queryset=CarBrand.objects.all(),
        label="Marka",
        widget=django_filters.widgets.CSVWidget,  # Çoklu seçim için CSV widget kullanıyoruz
    )

    title_search = django_filters.CharFilter(
        field_name="title",
        lookup_expr="icontains",  # Büyük/küçük harf duyarsız arama
        label="Başlık Arama"
    )
    description_search = django_filters.CharFilter(
        field_name="description",
        lookup_expr="icontains",  # Büyük/küçük harf duyarsız arama
        label="Açıklama Arama"
    )

    ordering = django_filters.OrderingFilter(
        fields=(
            ("created_at","created_at"),
            ("price", "price"),
            ("car__year", "year"),
            ("car__milage", "milage"),
        ),
        field_labels={
            "created_at": "Oluşturulma Tarihi",
            "price": "Fiyat",
            "car__year": "Yıl",
            "car__milage": "Kilometre",
        }
    )

    class Meta:
        model = Listing
        fields = [
            "min_price",
            "max_price",
            "min_milage",
            "max_milage",
            "min_year",
            "max_year",
            "fuel_type",
            "transmission",
            "color",
            "min_engine_power",
            "max_engine_power",
            "city",
            "brand",
            "title_search",
            "description_search"
        ]