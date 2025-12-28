# accounts/urls.py
from django.urls import path
from django.contrib.auth import views as auth_views
from . import views  # ← 这里包含你写的 change_password

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', auth_views.LoginView.as_view(), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('profile/', views.profile, name='profile'),
    path('password-change/', views.change_password, name='password_change'),
]