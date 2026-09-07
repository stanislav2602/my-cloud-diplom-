from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    full_name = models.CharField(
        max_length=255,
        verbose_name='Полное имя',
        blank=True,
        null=True
    )
    
    is_admin = models.BooleanField(
        default=False,
        verbose_name='Администратор'
    )
    
    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
        ordering = ['-date_joined']
    
    def __str__(self):
        return self.username
