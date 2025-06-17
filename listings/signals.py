
"""
Bu dosya Django signal handlers kullanarak ilanlar ve ilan resimleri için loglama işlemlerini yönetir.

Loglama İşlemleri:

1. Bir ilan (Listing) kaydedilmeden önce:
    - İlanın mevcut durumu hafızada saklanır (_PREVIOUS_LISTINGS sözlüğünde)
    - Bu sayede değişiklikleri takip edebiliriz

2. Bir ilan (Listing) kaydedildikten sonra:
    - Yeni ilan oluşturulduğunda: Yeni ilanın ID'si, başlığı ve kullanıcısı loglanır
    - Mevcut ilan güncellendiğinde: Önemli alanlardaki değişiklikler karşılaştırılır ve loglanır
      - Kontrol edilen alanlar: başlık, açıklama, fiyat, şehir, aktif durumu ve silinme durumu
      - Uzun metinler 30 karaktere kısaltılır
      - Değişiklikler "eski değer → yeni değer" formatında loglanır
      - İşlem sonunda önceki durum hafızadan temizlenir

3. Bir ilan resmi (ListingImage) silindiğinde:
    - Fiziksel dosya da silinmeye çalışılır
    - Silme işlemi başarısız olursa, hata mesajı loglanır

Bu loglama sistemi, sistemdeki tüm ilan değişikliklerini izlemeyi ve hata ayıklamayı kolaylaştırır.
"""
from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver
from .models import Listing, ListingImage
import logging
from .utils import ImageProcessor
from PIL import Image

logger = logging.getLogger("custom")

# Önceki değeri önceden saklamak için
_PREVIOUS_LISTINGS = {}


@receiver(pre_save, sender=Listing)
def store_previous_listing_state(sender, instance, **kwargs):
    if instance.pk:
        try:
            old = Listing.objects.get(pk=instance.pk)
            _PREVIOUS_LISTINGS[instance.pk] = old
        except Listing.DoesNotExist:
            pass



@receiver(post_save, sender=Listing)
def log_listing_update(sender, instance, created, **kwargs):
    if created:
        logger.info(f"[Listing] Yeni ilan oluşturuldu: ID={instance.id}, Başlık='{instance.title}', Kullanıcı={instance.user}")
    else:
        old = _PREVIOUS_LISTINGS.get(instance.pk)
        if not old:
            return

        fields_to_check = [
            "title", "description", "price", "city", 
            "is_active", "is_deleted"
        ]
        changes = []

        for field in fields_to_check:
            old_val = getattr(old, field)
            new_val = getattr(instance, field)
            if old_val != new_val:
                # string uzunluklarını kısalt
                if isinstance(old_val, str):
                    old_val = (old_val[:30] + "...") if len(old_val) > 30 else old_val
                if isinstance(new_val, str):
                    new_val = (new_val[:30] + "...") if len(new_val) > 30 else new_val

                # ForeignKey objesi ise str haline getir
                if hasattr(old_val, "__str__") and not isinstance(old_val, (str, int, float, bool)):
                    old_val = str(old_val)
                if hasattr(new_val, "__str__") and not isinstance(new_val, (str, int, float, bool)):
                    new_val = str(new_val)

                changes.append(f"{field}: '{old_val}' → '{new_val}'")

        if changes:
            logger.info(
                f"[Listing] İlan güncellendi: ID={instance.id}, Kullanıcı={instance.user} | Değişiklikler: {', '.join(changes)}"
            )

        _PREVIOUS_LISTINGS.pop(instance.pk, None)


@receiver(post_delete, sender=ListingImage)
def delete_listing_image_file(sender, instance, **kwargs):
    if instance.image:
        try:
            instance.image.delete(save=False)
        except Exception as e:
            logger.warning(f"[ListingImage] Fiziksel dosya silinemedi. ID={instance.id} Hata: {e}")


@receiver(pre_save, sender=ListingImage)
def process_image_before_save(sender, instance, **kwargs):
    """
    Model kaydedilmeden önce resim işleme
    - Validation
    - File info extraction
    - Filename generation
    """

    if not instance.pk and instance.image:
        try:
            # 1 Resim doğrulama
            ImageProcessor.validate_image(instance.image)

            # 2 Dosya bilgilerini al
            temp_image = Image.open(instance.image)
            instance.width = temp_image.width
            instance.height = temp_image.height
            instance.file_size = instance.image.size
            temp_image.close()

            # 3 Yeni dosya adını oluştur
            original_name = instance.image.name
            new_filename = ImageProcessor.generate_filename(original_name=original_name)
            instance.image.name = new_filename

            logger.info(f"Resim hazırlandı: {new_filename} ({instance.width}x{instance.height})")
        except Exception as e:
            logger.error(f"Resim işleme hatası: {e}")
            raise e
        

@receiver(post_save, sender=ListingImage)
def create_thumbnail_after_save(sender, instance, created, **kwargs):
    # Model kaydedildikten sonra thumbnail oluşturma
    if created and instance.image:
        try:
            import os
            thumbnails = ImageProcessor.create_thumbnails(
                instance.image,
                os.path.splitext(instance.image.name)[0]  # Dosya adını uzantı olmadan al
            )
            # Thumbnail dosya yollarını güncelle (döngü önlemek için direkt DB update)
            update_fields = {}
            if "thumbnail" in thumbnails:
                update_fields['thumbnail'] = thumbnails['thumbnail']
            if "medium" in thumbnails:
                update_fields['medium_image'] = thumbnails['medium']
            if "large" in thumbnails:
                update_fields['large_image'] = thumbnails['large']
            
            if update_fields:
                ListingImage.objects.filter(pk=instance.pk).update(**update_fields)
                logger.info(f"Thumbnail ve diğer boyutlar oluşturuldu: {instance.image.name}")
        except Exception as e:
            logger.error(f"Thumbnail oluşturma hatası: {e}")


