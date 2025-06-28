from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import serializers
from django.db.models import Q, Max, Count, Case, When, IntegerField
from .models import Message
from .serializers import MessageSerializer
from core.throttles import MessageSendThrottle
from users.models import User


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
        # Get receiver from request data
        receiver_id = self.request.data.get('receiver_id')
        if not receiver_id:
            raise serializers.ValidationError("Receiver ID is required")
        
        try:
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist:
            raise serializers.ValidationError("Receiver not found")
            
        serializer.save(sender=self.request.user, receiver=receiver)

    @action(detail=False, methods=['get'])
    def conversations(self, request):
        """
        Kullanıcının tüm konuşmalarını listele
        GET /api/messages/conversations/
        """
        user = request.user
        
        # Kullanıcının dahil olduğu tüm konuşmaları bul
        # Her konuşmadaki en son mesajı al
        conversations = []
        
        # Kullanıcının mesajlaştığı tüm kişileri bul
        sent_to = Message.objects.filter(sender=user).values_list('receiver', flat=True).distinct()
        received_from = Message.objects.filter(receiver=user).values_list('sender', flat=True).distinct()
        
        # Tüm benzersiz kullanıcıları topla
        all_contacts = set(list(sent_to) + list(received_from))
        
        for contact_id in all_contacts:
            try:
                contact = User.objects.get(id=contact_id)
                
                # Bu kişiyle son mesaj
                last_message = Message.objects.filter(
                    Q(sender=user, receiver=contact) | 
                    Q(sender=contact, receiver=user)
                ).order_by('-timestamp').first()
                
                # Okunmamış mesaj sayısı
                unread_count = Message.objects.filter(
                    sender=contact,
                    receiver=user,
                    is_read=False
                ).count()
                
                if last_message:
                    conversations.append({
                        'contact': {
                            'id': contact.id,
                            'username': contact.username,
                            'email': contact.email,
                        },
                        'last_message': {
                            'id': last_message.id,
                            'text': last_message.text,
                            'timestamp': last_message.timestamp,
                            'sender_id': last_message.sender.id,
                        },
                        'unread_count': unread_count
                    })
            except User.DoesNotExist:
                continue
        
        # Konuşmaları son mesaj tarihine göre sırala
        conversations.sort(key=lambda x: x['last_message']['timestamp'], reverse=True)
        
        return Response(conversations)

    @action(detail=False, methods=['get'])
    def conversation_with(self, request):
        """
        Belirli bir kullanıcıyla konuşmayı getir
        GET /api/messages/conversation-with/?user_id=X
        """
        user = request.user
        other_user_id = request.query_params.get('user_id')
        
        if not other_user_id:
            return Response({
                'error': 'user_id parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            other_user = User.objects.get(id=other_user_id)
        except User.DoesNotExist:
            return Response({
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Bu iki kullanıcı arasındaki tüm mesajları getir
        messages = Message.objects.filter(
            Q(sender=user, receiver=other_user) |
            Q(sender=other_user, receiver=user)
        ).order_by('timestamp')
        
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def mark_as_read(self, request):
        """
        Mesajları okundu olarak işaretle
        POST /api/messages/mark-as-read/
        Body: { "sender_id": 123 } - Bu kullanıcıdan gelen tüm mesajları okundu işaretle
        """
        user = request.user
        sender_id = request.data.get('sender_id')
        
        if not sender_id:
            return Response({
                'error': 'sender_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            sender = User.objects.get(id=sender_id)
        except User.DoesNotExist:
            return Response({
                'error': 'Sender not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Bu kullanıcıdan gelen tüm okunmamış mesajları okundu işaretle
        updated_count = Message.objects.filter(
            sender=sender,
            receiver=user,
            is_read=False
        ).update(is_read=True)
        
        return Response({
            'success': True,
            'message': f'{updated_count} messages marked as read'
        })

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """
        Okunmamış mesaj sayısını getir
        GET /api/messages/unread-count/
        """
        user = request.user
        
        unread_count = Message.objects.filter(
            receiver=user,
            is_read=False
        ).count()
        
        return Response({
            'unread_count': unread_count
        })

# Create your views here.
