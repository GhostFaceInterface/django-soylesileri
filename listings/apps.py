from django.apps import AppConfig


class ListingsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "listings"

    def ready(self): 
        #Django app'i yüklerken çağırdığı hazır fonksiyondur.
        #Ey Django, listings app'ini yüklerken listings/signals.py 
        #dosyasını da çalıştır, signal’leri aktif et.
        import listings.signals
