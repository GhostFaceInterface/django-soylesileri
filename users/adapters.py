from allauth.account.adapter import DefaultAccountAdapter as BaseAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter as BaseSocialAccountAdapter
from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()


class DefaultAccountAdapter(BaseAccountAdapter):
    """
    Custom account adapter for handling account operations
    """
    
    def send_mail(self, template_prefix, email, context):
        """
        Override email sending for custom templates
        """
        # You can customize email templates here
        return super().send_mail(template_prefix, email, context)
    
    def save_user(self, request, user, form, commit=True):
        """
        Save user with additional fields
        """
        user = super().save_user(request, user, form, commit=False)
        
        # Set additional fields from form if available
        if hasattr(form, 'cleaned_data'):
            user.is_seller = form.cleaned_data.get('is_seller', False)
            user.phone_number = form.cleaned_data.get('phone_number', '')
        
        if commit:
            user.save()
        return user


class DefaultSocialAccountAdapter(BaseSocialAccountAdapter):
    """
    Custom social account adapter for Google OAuth
    """
    
    def pre_social_login(self, request, sociallogin):
        """
        Handle user before social login
        """
        # Check if user exists with this email
        if sociallogin.account.provider == 'google':
            email = sociallogin.account.extra_data.get('email')
            if email:
                try:
                    user = User.objects.get(email=email)
                    # Connect social account to existing user
                    sociallogin.connect(request, user)
                except User.DoesNotExist:
                    pass
    
    def save_user(self, request, sociallogin, form=None):
        """
        Save user from social login
        """
        user = super().save_user(request, sociallogin, form)
        
        # Set email as verified for Google users
        if sociallogin.account.provider == 'google':
            user.is_email_verified = True
            user.save()
        
        return user
    
    def populate_user(self, request, sociallogin, data):
        """
        Populate user data from social account
        """
        user = super().populate_user(request, sociallogin, data)
        
        # Get additional data from Google
        if sociallogin.account.provider == 'google':
            extra_data = sociallogin.account.extra_data
            user.first_name = extra_data.get('given_name', '')
            user.last_name = extra_data.get('family_name', '')
            user.email = extra_data.get('email', '')
        
        return user 