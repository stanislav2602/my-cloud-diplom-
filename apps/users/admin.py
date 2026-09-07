from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'full_name', 'email', 'is_admin', 'is_staff']
    search_fields = ['username', 'email', 'full_name']
    list_filter = ['is_admin', 'is_staff']
