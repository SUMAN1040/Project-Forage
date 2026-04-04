from django.urls import path
from . import views, admin_views

urlpatterns = [
    path('', views.home_view, name='home'),
    path('api/clip/', views.create_clip_api, name='create_clip_api'),
    path('api/retrieve/', views.retrieve_clip_api, name='retrieve_clip_api'),
    path('clip/<str:clip_id>/', views.clip_detail_view, name='clip_detail'),
    
    # Admin
    path('admin/', admin_views.admin_dashboard_view, name='admin_dashboard'),
    path('admin/logout/', admin_views.admin_logout_view, name='admin_logout'),
    path('api/admin/login/', admin_views.admin_login_api, name='admin_login_api'),
    path('api/admin/send/', admin_views.admin_send_api, name='admin_send_api'),
]
