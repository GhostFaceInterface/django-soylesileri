from django.db.models.signals import post_delete
from django.dispatch import receiver
from .models import ListingImage

@receiver(post_delete, sender=ListingImage) 
#“Ey Django, eğer ListingImage modeli üzerinde post_delete (silindikten sonra) olayı tetiklenirse, 
# aşağıdaki delete_listing_image_file fonksiyonunu çalıştır.”
def delete_listing_image_file(sender, instance, **kwargs):
    #ListingImage nesnesi silindiğinde, fiziksel dosya da silinsin.
    if instance.image: #“Resim dosyası var mı? Eğer varsa, dosyayı da sil.”
        try:
            instance.image.delete(save=False)
        except Exception as e:
            print(f"Error deleting file: {e}")
