import django_filters
from django.db import models
import django_filters.widgets
from .models import Listing
from cars.models import Car, CarBrand, CarModel, CarVariant, CarTrim
from locations.models import Province, District, Neighborhood


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

    min_mileage = django_filters.NumberFilter(
        field_name="car__mileage",
        lookup_expr="gte",  # greater than or equal (>=)
        label="Minimum Kilometre"
    )

    max_mileage = django_filters.NumberFilter(
        field_name="car__mileage",
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

    body_type = django_filters.CharFilter(
        field_name="car__body_type",
        lookup_expr="icontains",  # case insensitive contains
        label="Kasa Tipi"
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

    # Yeni location filtreleri
    province = django_filters.ModelMultipleChoiceFilter(
        queryset=Province.objects.all(),
        widget=django_filters.widgets.CSVWidget,
        label="İller",
    )
    
    district = django_filters.ModelMultipleChoiceFilter(
        queryset=District.objects.all(),
        widget=django_filters.widgets.CSVWidget,
        label="İlçeler",
    )
    
    neighborhood = django_filters.ModelMultipleChoiceFilter(
        queryset=Neighborhood.objects.all(),
        widget=django_filters.widgets.CSVWidget,
        label="Mahalleler",
    )

    brand = django_filters.ModelMultipleChoiceFilter(
        field_name="car__brand",
        queryset=CarBrand.objects.all(),
        label="Marka",
        widget=django_filters.widgets.CSVWidget,  # Çoklu seçim için CSV widget kullanıyoruz
    )

    # Multiple model filtering
    model = django_filters.ModelMultipleChoiceFilter(
        field_name="car__model",
        queryset=CarModel.objects.all(),
        label="Model",
        widget=django_filters.widgets.CSVWidget,
    )

    # NEW: Multiple variant filtering (Donanım)
    variant = django_filters.ModelMultipleChoiceFilter(
        field_name="car__variant",
        queryset=CarVariant.objects.all(),
        label="Donanım",
        widget=django_filters.widgets.CSVWidget,
    )

    # NEW: Multiple trim filtering
    trim = django_filters.ModelMultipleChoiceFilter(
        field_name="car__trim",
        queryset=CarTrim.objects.all(),
        label="Trim",
        widget=django_filters.widgets.CSVWidget,
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
            ("car__mileage", "mileage"),
        ),
        field_labels={
            "created_at": "Oluşturulma Tarihi",
            "price": "Fiyat",
            "car__year": "Yıl",
            "car__mileage": "Kilometre",
        }
    )

    class Meta:
        model = Listing
        fields = [
            "min_price",
            "max_price",
            "min_mileage",
            "max_mileage",
            "min_year",
            "max_year",
            "fuel_type",
            "transmission",
            "color",
            "body_type",
            "min_engine_power",
            "max_engine_power",
            "province",
            "district",
            "neighborhood",
            "brand",
            "model",
            "variant",
            "trim",
            "title_search",
            "description_search"
        ]