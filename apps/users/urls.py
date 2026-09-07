from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('me/', views.CurrentUserView.as_view(), name='current_user'),
    path('', views.UserListView.as_view(), name='user_list'),
    path('<int:user_id>/delete/', views.UserDeleteView.as_view(), name='user_delete'),
    path('<int:user_id>/toggle-admin/', views.UserAdminToggleView.as_view(), name='toggle_admin'),
]
