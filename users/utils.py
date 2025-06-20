from django.core.mail import send_mail
from django.conf import settings

def send_welcome_email(email):
    send_mail(
        subject='Welcome to Our Platform',
        message='Sitemize hoş geldiniz, iyi çalışmalar dileriz.',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )
