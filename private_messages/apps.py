from django.apps import AppConfig


class PrivateMessagesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "private_messages"

    def ready(self):
        import private_messages.signals