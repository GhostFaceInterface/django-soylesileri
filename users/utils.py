from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string

def send_welcome_email(email):
    subject = 'Oto İlan\'a Hoş Geldiniz!'
    message = '''Merhaba,

Oto İlan'a kayıt olduğunuz için teşekkür ederiz!

Artık:
- Ücretsiz ilan verebilirsiniz
- Binlerce araç ilanına göz atabilirsiniz
- Satıcılarla doğrudan iletişim kurabilirsiniz
- Favori ilanlarınızı kaydedebilirsiniz

İyi alışverişler dileriz!

Oto İlan Ekibi'''

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )

def send_verification_email(user, verification_url):
    """
    Email doğrulama maili gönder
    """
    subject = 'Email Adresinizi Doğrulayın - Oto İlan'
    
    context = {
        'user': user,
        'verification_url': verification_url,
        'site_name': 'Oto İlan',
    }
    
    # Text version
    message = f"""Merhaba {user.first_name or user.username},

Oto İlan hesabınızı aktifleştirmek için email adresinizi doğrulamanız gerekmektedir.

Aşağıdaki bağlantıya tıklayarak email adresinizi doğrulayın:
{verification_url}

Bu bağlantı 3 gün geçerlidir.

Saygılarımızla,
Oto İlan Ekibi"""
    
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )