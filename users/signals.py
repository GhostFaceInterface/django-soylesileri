import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User

logger = logging.getLogger("custom")

@receiver(post_save, sender=User)
def log_user_created(sender, instance, created, **kwargs):
    if created:
        logger.info(f"Yeni kullanıcı oluşturuldu: ID={instance.id}, Email={instance.email}")