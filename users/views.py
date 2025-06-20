from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from .permissions import IsSelfOrReadOnly
from .utils import send_welcome_email
from core.throttles import LoginThrottle
from rest_framework_simplejwt.views import TokenObtainPairView



class UserViewSet(viewsets.ModelViewSet):
    """Viewset for user CRUD operations."""

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsSelfOrReadOnly]

    def perform_create(self, serializer):
        user = serializer.save()
        send_welcome_email(user.email)

    @action(detail=False, methods=["get", "put", "patch"], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Retrieve or update the current authenticated user."""
        user = request.user
        if request.method in ["PUT", "PATCH"]:
            serializer = self.get_serializer(user, data=request.data, partial=(request.method == "PATCH"))
            serializer.is_valid(raise_exception=True)
            serializer.save()
        else:
            serializer = self.get_serializer(user)
        return Response(serializer.data)
# Create your views here.

class CustomTokenObtainPairView(TokenObtainPairView):
    def get_throttles(self):
        return [LoginThrottle()]
