import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Message

logger = logging.getLogger("custom")

@receiver(post_save, sender=Message)
def log_message_created(sender, instance, created, **kwargs):
    if created:
        logger.info(f"[Message] Yeni mesaj: Gönderen={instance.sender}, Alıcı={instance.receiver}, ID={instance.id}")