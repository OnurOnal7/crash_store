from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, validators=[validate_password])
    
    class Meta:
        model = User
        fields = ['id', 'email', 'password']
        read_only_fields = ['id']
        
    def create(self, validated_data):
        return User.objects.create_user(**validated_data)
        
class AdminUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, validators=[validate_password])
    
    class Meta:
        model = User
        fields = ['id', 'email', 'password', 'is_active', 'is_staff', 'date_joined']
        read_only_fields = ['id', 'date_joined']
        
    def create(self, validated_data):
        pwd = validated_data.pop('password', None)
        return User.objects.create_user(**validated_data, password=pwd)
    
    def update(self, instance, validated_data):
        pwd = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if pwd:
            user.set_password(pwd)
            user.save()
        return user
    
class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.USERNAME_FIELD
    
class ClientTokenRequestSerializer(serializers.Serializer):
    client_secret = serializers.CharField(write_only=True)
