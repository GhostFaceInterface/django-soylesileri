from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Message
from .serializers import MessageSerializer
from core.throttles import MessageSendThrottle

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
# Create your views here.
