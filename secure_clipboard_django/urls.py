from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin_panel/', admin.site.urls), # Renamed to avoid confusion with our admin
    path('', include('clipboard_app.urls')),
    path('chat/', include('chatApp.urls')),
]
