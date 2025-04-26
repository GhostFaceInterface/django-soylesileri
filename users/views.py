from rest_framework import viewsets
from .models import User
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .utils import send_welcome_email



class UserViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing user instances.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticatedOrReadOnly] # Only authenticated users can edit, all can view

    def perform_create(self, serializer):
        user = serializer.save()
        send_welcome_email(user.email)
# Create your views here.
