from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Message
from .serializers import MessageSerializer
from core.throttles import MessageSendThrottle
from users.models import User
from users.serializers import UserSerializer

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]


    def get_queryset(self): #Şu an giriş yapmış kullanıcı kimse onunla ilgili mesajları getir
        
        # Kullanıcıyı request nesnesinden alıyoruz. 
        # self.request.user, şu anda oturum açmış olan kullanıcıyı temsil eder.
        user = self.request.user
        # Mesajları filtrelemek için iki farklı sorgu oluşturuyoruz:
        # 1. Kullanıcının gönderici olduğu mesajlar (sender=user)
        # 2. Kullanıcının alıcı olduğu mesajlar (receiver=user)
        # Bu iki sorguyu '|' operatörü ile birleştiriyoruz. 
        # '|' operatörü, Django ORM'de iki sorguyu birleştirerek bir "veya" (OR) işlemi yapar.
        # (sender == request.user) OR (receiver == request.user)
        # Bu sayede, kullanıcının hem gönderici hem de alıcı olduğu mesajları tek bir sorgu ile almış oluyoruz.

        return Message.objects.filter(
            sender=user # Kullanıcının gönderici olduğu mesajlar
        ) | Message.objects.filter(
            receiver=user # Kullanıcının alıcı olduğu mesajlar
        )
    
    def get_throttles(self):
        if self.action == "create":
            return [MessageSendThrottle()]
        return super().get_throttles() #Ey Django, bu metodun default davranışını aynen çalıştır.
        

    def perform_create(self, serializer):
       serializer.save(sender=self.request.user)

    @action(detail=False, methods=["get"])
    def conversations(self, request):
        """List all users the current user has conversations with"""
        user = request.user
        messages = Message.objects.filter(Q(sender=user) | Q(receiver=user))
        participant_ids = set()
        for msg in messages:
            if msg.sender_id != user.id:
                participant_ids.add(msg.sender_id)
            if msg.receiver_id != user.id:
                participant_ids.add(msg.receiver_id)
        users = User.objects.filter(id__in=participant_ids)
        return Response(UserSerializer(users, many=True).data)

    @action(detail=False, methods=["get"], url_path="conversation-with")
    def conversation_with(self, request):
        """Retrieve conversation with a specific user"""
        other_user_id = request.query_params.get("user_id")
        if not other_user_id:
            return Response({"detail": "user_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            other_user = User.objects.get(id=other_user_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        messages = Message.objects.filter(
            (Q(sender=request.user, receiver=other_user) | Q(sender=other_user, receiver=request.user))
        ).order_by("timestamp")
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["post"], url_path="mark-as-read")
    def mark_as_read(self, request):
        """Mark messages from a specific user as read"""
        other_user_id = request.data.get("user_id")
        if not other_user_id:
            return Response({"detail": "user_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        Message.objects.filter(sender_id=other_user_id, receiver=request.user, is_read=False).update(is_read=True)
        return Response({"success": True})

    @action(detail=False, methods=["get"], url_path="unread-count")
    def unread_count(self, request):
        """Return total unread message count for current user"""
        count = Message.objects.filter(receiver=request.user, is_read=False).count()
        return Response({"unread_count": count})
# Create your views here.
