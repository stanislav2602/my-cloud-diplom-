import os
import uuid
from django.conf import settings
from django.http import FileResponse
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from .models import UserFile
from .serializers import UserFileSerializer
from apps.users.models import User

class FileListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user_id = request.query_params.get('user_id')
        
        if request.user.is_admin and user_id:
            try:
                user = User.objects.get(id=user_id)
                files = UserFile.objects.filter(owner=user)
            except User.DoesNotExist:
                return Response({'error': 'Пользователь не найден'}, status=status.HTTP_404_NOT_FOUND)
        else:
            files = UserFile.objects.filter(owner=request.user)
        
        serializer = UserFileSerializer(files, many=True)
        return Response(serializer.data)

class FileUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        file_obj = request.FILES.get('file')
        comment = request.data.get('comment', '')
        
        if not file_obj:
            return Response({'error': 'Файл не выбран'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        
        user_folder = os.path.join(settings.MEDIA_ROOT, 'user_files', f"user_{user.username}")
        
        os.makedirs(user_folder, mode=0o755, exist_ok=True)
   
        ext = os.path.splitext(file_obj.name)[1]
        unique_name = f"{uuid.uuid4().hex}{ext}"
        relative_path = os.path.join('user_files', f"user_{user.username}", unique_name)
        full_path = os.path.join(settings.MEDIA_ROOT, relative_path)
  
        with open(full_path, 'wb+') as destination:
            for chunk in file_obj.chunks():
                destination.write(chunk)
        
        user_file = UserFile.objects.create(
            owner=user,
            original_name=file_obj.name,
            file_path=relative_path,
            size=file_obj.size,
            comment=comment
        )
        
        serializer = UserFileSerializer(user_file)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class FileDeleteView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, file_id):
        try:
            file_obj = UserFile.objects.get(id=file_id)
            
            if not request.user.is_admin and file_obj.owner.id != request.user.id:
                return Response({'error': 'У вас нет прав на удаление файла'}, status=status.HTTP_403_FORBIDDEN)
            
            full_path = os.path.join(settings.MEDIA_ROOT, file_obj.file_path)
            if os.path.exists(full_path):
                os.remove(full_path)
            
            file_obj.delete()
            return Response({'message': 'Файл успешно удален'}, status=status.HTTP_200_OK)
        except UserFile.DoesNotExist:
            return Response({'error': 'Файл не найден'}, status=status.HTTP_404_NOT_FOUND)

class FileRenameView(APIView):
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, file_id):
        new_name = request.data.get('new_name')
        
        if not new_name:
            return Response({'error': 'Укажите новое имя'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            file_obj = UserFile.objects.get(id=file_id)
            
            if not request.user.is_admin and file_obj.owner.id != request.user.id:
                return Response({'error': 'У вас нет прав на переименование файла'}, status=status.HTTP_403_FORBIDDEN)
            
            file_obj.original_name = new_name
            file_obj.save()
            serializer = UserFileSerializer(file_obj)
            return Response(serializer.data)
        except UserFile.DoesNotExist:
            return Response({'error': 'Файл не найден'}, status=status.HTTP_404_NOT_FOUND)

class FileCommentView(APIView):
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, file_id):
        comment = request.data.get('comment', '')
        
        try:
            file_obj = UserFile.objects.get(id=file_id)
            
            if not request.user.is_admin and file_obj.owner.id != request.user.id:
                return Response({'error': 'У вас нет прав на изменение комментария'}, status=status.HTTP_403_FORBIDDEN)
            
            file_obj.comment = comment
            file_obj.save()
            serializer = UserFileSerializer(file_obj)
            return Response(serializer.data)
        except UserFile.DoesNotExist:
            return Response({'error': 'Файл не найден'}, status=status.HTTP_404_NOT_FOUND)

class FileDownloadView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, file_id):
        try:
            file_obj = UserFile.objects.get(id=file_id)
            
            if not request.user.is_admin and file_obj.owner.id != request.user.id:
                return Response({'error': 'У вас нет прав на скачивание файла'}, status=status.HTTP_403_FORBIDDEN)
            
            full_path = os.path.join(settings.MEDIA_ROOT, file_obj.file_path)
            
            if not os.path.exists(full_path):
                return Response({'error': 'Файл не найден'}, status=status.HTTP_404_NOT_FOUND)
            
            file_obj.downloaded_at = timezone.now()
            file_obj.save()
            
            return FileResponse(open(full_path, 'rb'), as_attachment=True, filename=file_obj.original_name)
        except UserFile.DoesNotExist:
            return Response({'error': 'Файл не найден'}, status=status.HTTP_404_NOT_FOUND)

class PublicFileDownloadView(APIView):
    permission_classes = []
    
    def get(self, request, token):
        try:
            file_obj = UserFile.objects.get(public_token=token)
            full_path = os.path.join(settings.MEDIA_ROOT, file_obj.file_path)
            
            if not os.path.exists(full_path):
                return Response({'error': 'Файл не найден'}, status=status.HTTP_404_NOT_FOUND)
            
            file_obj.downloaded_at = timezone.now()
            file_obj.save()
            
            return FileResponse(open(full_path, 'rb'), as_attachment=True, filename=file_obj.original_name)
        except UserFile.DoesNotExist:
            return Response({'error': 'Файл не найден'}, status=status.HTTP_404_NOT_FOUND)
