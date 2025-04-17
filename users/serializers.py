from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta: 
        model = User
        fiels = [
            "id",
            "username",
            "email",
            "is_seller",
            "phone_number",
            "date_joined",
        ]