from django.contrib import admin
from .models import UserFile

@admin.register(UserFile)
class UserFileAdmin(admin.ModelAdmin):
    list_display = ['original_name', 'owner', 'size', 'uploaded_at', 'downloaded_at']
    search_fields = ['original_name', 'owner__username']
    readonly_fields = ['public_token']