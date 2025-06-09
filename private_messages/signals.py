import logging
from django.db.models.signals import post_save, pre_save, post_delete   
from django.dispatch import receiver
from .models import Message

logger = logging.getLogger("custom")

# --- Güncelleme loglamak için eski hali kaydet ---
_PREVIOSUS_MESSAGES = {}

@receiver(pre_save, sender=Message)
def store_old_message_state(sender, instance, **kwargs):
    if instance.pk:
        try:
            old = Message.objects.get(pk=instance.pk)
            _PREVIOSUS_MESSAGES [instance.pk] = old
        except Message.DoesNotExist:
            pass


@receiver(post_save, sender=Message)
def log_message_change(sender, instance, created, **kwargs):
    if created:
        logger.info(f"[Message] Yeni mesaj: Gönderen={instance.sender.username}, "
                    f"Alıcı={instance.receiver.username}, "
                    f"ID={instance.id}, "
                    f"Mesaj: '{instance.text[:50]}'")
        
    else:
        old = _PREVIOSUS_MESSAGES.get(instance.pk, None)
        if not old: 
            return
        changes = []
        # Şu anda yalnızca "is_read" field’ı güncellenebilir; diğerleri mantıksal olarak değişmez
        if old.is_read != instance.is_read:
            changes.append(f"is_read: {old.is_read} → {instance.is_read}")

        if old.text != instance.text:
            changes.append(f"text: '{old.text[:30]}...' → '{instance.text[:30]}...'")
        # Ekstra field eklemek istersen buraya ekleyebilirsin

        if changes:
            logger.info(f"[Message] Mesaj güncellendi: ID={instance.id}, "
                        f"Değişiklikler: {', '.join(changes)}")
            
        _PREVIOSUS_MESSAGES.pop(instance.pk, None)
