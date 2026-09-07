import os
import uuid
from django.db import models
from django.conf import settings

class UserFile(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='files',
        verbose_name='Владелец'
    )
    
    original_name = models.CharField(
        max_length=255,
        verbose_name='Оригинальное имя'
    )
    
    file_path = models.CharField(
        max_length=500,
        verbose_name='Путь к файлу'
    )
    
    size = models.BigIntegerField(
        verbose_name='Размер (байт)',
        default=0
    )
    
    uploaded_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата загрузки'
    )
    
    downloaded_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Дата последнего скачивания'
    )
    
    comment = models.TextField(
        blank=True,
        verbose_name='Комментарий'
    )
    
    public_token = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        verbose_name='Публичный токен'
    )
    
    class Meta:
        verbose_name = 'Файл'
        verbose_name_plural = 'Файлы'
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.original_name} ({self.owner.username})"
    
    def get_full_file_path(self):
        return os.path.join(settings.MEDIA_ROOT, self.file_path)
