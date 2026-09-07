from rest_framework import serializers
from .models import UserFile

class UserFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserFile
        fields = ['id', 'original_name', 'size', 'uploaded_at', 'downloaded_at', 'comment', 'public_token']
        read_only_fields = ['id', 'size', 'uploaded_at', 'downloaded_at', 'public_token']
