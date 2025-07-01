from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from django.db.models import Count, Q
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from google.auth.transport import requests
from google.oauth2 import id_token
import requests as http_requests

from .models import User
from .serializers import (
    UserSerializer, 
    UserRegistrationSerializer, 
    UserProfileSerializer,
    EmailLoginSerializer,
    PasswordResetSerializer,
    GoogleOAuthSerializer
)
from .utils import send_welcome_email
from core.throttles import LoginThrottle
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing user instances.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]  # Default permission - will be overridden by action-specific permissions

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['create', 'email_login', 'google_oauth', 'password_reset']:
            # Registration and login endpoints - anyone can access
            permission_classes = [AllowAny]
        elif self.action in ['list', 'retrieve']:
            # READ operations - anyone can access (for browsing listings)
            permission_classes = [AllowAny]
        elif self.action in ['dashboard', 'profile', 'my_listings']:
            # User-specific endpoints - authentication required
            permission_classes = [IsAuthenticated]
        else:
            # UPDATE, DELETE and other operations - authentication required
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserRegistrationSerializer
        elif self.action in ['update', 'partial_update', 'profile']:
            return UserProfileSerializer
        elif self.action == 'email_login':
            return EmailLoginSerializer
        elif self.action == 'google_oauth':
            return GoogleOAuthSerializer
        elif self.action == 'password_reset':
            return PasswordResetSerializer
        return UserSerializer

    def create(self, request, *args, **kwargs):
        """
        Override create to ensure AllowAny permission for registration
        """
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        user = serializer.save()
        send_welcome_email(user.email)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def email_login(self, request):
        """
        Email ile giriş yap
        POST /api/users/email_login/
        """
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def google_oauth(self, request):
        """
        Google OAuth ile giriş yap
        POST /api/users/google-oauth/
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            access_token = serializer.validated_data['access_token']
            
            try:
                # Verify Google token
                google_user_info = self.verify_google_token(access_token)
                
                if not google_user_info:
                    return Response({'error': 'Geçersiz Google token'}, 
                                  status=status.HTTP_400_BAD_REQUEST)
                
                email = google_user_info.get('email')
                
                # Check if user exists
                try:
                    user = User.objects.get(email=email)
                    # Update user info from Google
                    user.first_name = google_user_info.get('given_name', '')
                    user.last_name = google_user_info.get('family_name', '')
                    user.is_email_verified = True
                    user.save()
                except User.DoesNotExist:
                    # Create new user
                    username = email.split('@')[0]
                    # Ensure unique username
                    counter = 1
                    original_username = username
                    while User.objects.filter(username=username).exists():
                        username = f"{original_username}{counter}"
                        counter += 1
                    
                    user = User.objects.create_user(
                        username=username,
                        email=email,
                        first_name=google_user_info.get('given_name', ''),
                        last_name=google_user_info.get('family_name', ''),
                        is_email_verified=True,
                    )
                    # Send welcome email
                    send_welcome_email(user.email)
                
                # Generate JWT tokens
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'user': UserSerializer(user).data
                }, status=status.HTTP_200_OK)
                
            except Exception as e:
                return Response({'error': 'Google authentication failed'}, 
                              status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def verify_google_token(self, access_token):
        """
        Google access token'ı doğrula ve kullanıcı bilgilerini al
        """
        try:
            # Google userinfo endpoint'ini çağır
            response = http_requests.get(
                'https://www.googleapis.com/oauth2/v1/userinfo',
                params={'access_token': access_token}
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return None
        except Exception:
            return None

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def password_reset(self, request):
        """
        Şifre sıfırlama maili gönder
        POST /api/users/password-reset/
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.get(email=email)
            
            # Generate password reset token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Send password reset email
            reset_url = f"{settings.FRONTEND_URL}/auth/password-reset-confirm/{uid}/{token}/"
            
            context = {
                'user': user,
                'reset_url': reset_url,
                'site_name': 'Oto İlan',
            }
            
            subject = 'Şifre Sıfırlama - Oto İlan'
            message = render_to_string('emails/password_reset.txt', context)
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            
            return Response({'message': 'Şifre sıfırlama maili gönderildi.'}, 
                          status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get', 'put', 'patch'])
    def profile(self, request):
        """
        Kullanıcının kendi profil bilgilerini getir veya güncelle
        GET /api/users/profile/ - Profil bilgilerini getir
        PUT/PATCH /api/users/profile/ - Profil bilgilerini güncelle
        """
        if request.method == 'GET':
            serializer = UserProfileSerializer(request.user)
            return Response(serializer.data)
        else:
            serializer = UserProfileSerializer(
                request.user, 
                data=request.data, 
                partial=request.method == 'PATCH'
            )
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['GET'])
    def dashboard(self, request):
        """
        Kullanıcı dashboard bilgileri
        GET /api/users/dashboard/
        """
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, 
                          status=status.HTTP_401_UNAUTHORIZED)
        
        user = request.user
        
        try:
            # Kullanıcının ilanları
            from listings.models import Listing
            from listings.serializers import ListingSerializer
            listings = Listing.objects.filter(
                user=user, 
                is_deleted=False
            ).select_related('car', 'province', 'district', 'neighborhood')
            
            # Mesajlar
            from private_messages.models import Message
            from private_messages.serializers import MessageSerializer
            unread_messages = Message.objects.filter(
                receiver=user,
                is_read=False
            ).count()
        
            # Son ilanlar (en yeni 5 tanesi)
            recent_listings = listings.order_by('-created_at')[:5]
            recent_listings_data = ListingSerializer(
                recent_listings, 
                many=True, 
                context={'request': request}
            ).data
        
            # Son mesajlar (en yeni 5 tanesi)
            recent_messages = Message.objects.filter(
                Q(sender=user) | Q(receiver=user)
            ).order_by('-timestamp')[:5]
            recent_messages_data = MessageSerializer(recent_messages, many=True).data
            
            # İstatistikler
            stats = {
                'total_listings': listings.count(),
                'active_listings': listings.filter(is_active=True).count(),
                'inactive_listings': listings.filter(is_active=False).count(),
                'unread_messages': unread_messages,
            }
        
            return Response({
                'user': UserSerializer(user).data,
                'stats': stats,
                'recent_listings': recent_listings_data,
                'recent_messages': recent_messages_data,
            })
            
        except Exception as e:
            # Debug için error'u log'layalım
            print(f"Dashboard error: {str(e)}")
            import traceback
            traceback.print_exc()
            
            # Fallback response
            return Response({
                'user': UserSerializer(user).data,
                'stats': {
                    'total_listings': 0,
                    'active_listings': 0,
                    'inactive_listings': 0,
                    'unread_messages': 0,
                },
                'recent_listings': [],
                'recent_messages': [],
            })

    @action(detail=False, methods=['get'])
    def my_listings(self, request):
        """
        Kullanıcının tüm ilanlarını getir
        GET /api/users/my-listings/
        """
        from listings.models import Listing
        from listings.serializers import ListingSerializer
        
        listings = Listing.objects.filter(
            user=request.user, 
            is_deleted=False
        ).order_by('-created_at')
        
        # Filtreleme
        status_filter = request.query_params.get('status')
        if status_filter == 'active':
            listings = listings.filter(is_active=True)
        elif status_filter == 'inactive':
            listings = listings.filter(is_active=False)
        
        # Pagination
        page = self.paginate_queryset(listings)
        if page is not None:
            serializer = ListingSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = ListingSerializer(listings, many=True, context={'request': request})
        return Response(serializer.data)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom serializer to support email-based authentication
    """
    def validate(self, attrs):
        # Check if username is actually an email
        username = attrs.get('username')
        print(f"DEBUG: CustomTokenObtainPairSerializer validating username: {username}")
        
        if '@' in username:
            try:
                # Find user by email and replace username
                user = User.objects.get(email=username)
                attrs['username'] = user.username
                print(f"DEBUG: Found user by email, using username: {user.username}")
            except User.DoesNotExist:
                print(f"DEBUG: No user found with email: {username}")
                pass
        
        return super().validate(attrs)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    
    def get_throttles(self):
        return [LoginThrottle()]
