from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import RegisterSerializer, UserSerializer
from .models import User


class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'Пользователь успешно зарегистрирован',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'error': 'Необходимо указать логин и пароль'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(username=username, password=password)
        
        if not user:
            return Response(
                {'error': 'Неверный логин или пароль'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Вы успешно вошли в систему',
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Вы вышли из системы'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class UserListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not request.user.is_admin:
            return Response(
                {'error': 'Доступ запрещен. Требуются права администратора'},
                status=status.HTTP_403_FORBIDDEN
            )
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


class UserDeleteView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, user_id):
        if not request.user.is_admin:
            return Response(
                {'error': 'Доступ запрещен. Требуются права администратора'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            user_to_delete = User.objects.get(id=user_id)
            
            if user_to_delete.id == request.user.id:
                return Response(
                    {'error': 'Вы не можете удалить самого себя'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user_to_delete.delete()
            return Response(
                {'message': f'Пользователь {user_to_delete.username} успешно удален'},
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response(
                {'error': 'Пользователь не найден'},
                status=status.HTTP_404_NOT_FOUND
            )


class UserAdminToggleView(APIView):
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, user_id):
        if not request.user.is_admin:
            return Response(
                {'error': 'Доступ запрещен. Требуются права администратора'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            user_to_update = User.objects.get(id=user_id)
            
            if user_to_update.id == request.user.id:
                return Response(
                    {'error': 'Вы не можете изменить права администратора у себя'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user_to_update.is_admin = not user_to_update.is_admin
            user_to_update.is_staff = user_to_update.is_admin
            user_to_update.save()
            
            return Response({
                'message': f'Права администратора для {user_to_update.username} изменены',
                'is_admin': user_to_update.is_admin
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response(
                {'error': 'Пользователь не найден'},
                status=status.HTTP_404_NOT_FOUND
            )