from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
import re
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'email', 'is_admin', 'date_joined']
        read_only_fields = ['id', 'date_joined']

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all(), message="Пользователь с таким email уже существует")]
    )
    
    username = serializers.CharField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all(), message="Пользователь с таким логином уже существует")]
    )
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    
    password2 = serializers.CharField(write_only=True, required=True)
    full_name = serializers.CharField(required=True)
    
    class Meta:
        model = User
        fields = ['username', 'full_name', 'email', 'password', 'password2']
    
    def validate_username(self, value):
        if not re.match(r'^[A-Za-z][A-Za-z0-9]{3,19}$', value):
            raise serializers.ValidationError(
                "Логин должен содержать только латинские буквы и цифры, "
                "первый символ - буква, длина от 4 до 20 символов"
            )
        return value
    
    def validate_email(self, value):
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', value):
            raise serializers.ValidationError("Неверный формат email")
        return value
    
    def validate_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("Пароль должен содержать не менее 6 символов")
        
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Пароль должен содержать как минимум одну заглавную букву")
        
        if not re.search(r'[0-9]', value):
            raise serializers.ValidationError("Пароль должен содержать как минимум одну цифру")
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise serializers.ValidationError("Пароль должен содержать как минимум один специальный символ")
        
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Пароли не совпадают"})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data['full_name']
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            user = authenticate(request=self.context.get('request'), username=username, password=password)
            
            if not user:
                raise serializers.ValidationError("Неверный логин или пароль")
            
            if not user.is_active:
                raise serializers.ValidationError("Учетная запись деактивирована")
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError("Необходимо указать логин и пароль")
