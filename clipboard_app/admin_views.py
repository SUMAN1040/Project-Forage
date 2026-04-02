import json
import os
import hmac
import hashlib
import time
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.conf import settings
from .telegram_utils import send_telegram_message, send_telegram_file

def admin_dashboard_view(request):
    # Check session
    session_token = request.COOKIES.get('admin_session')
    if not session_token or not verify_session_token(session_token):
        return render(request, 'admin_login.html')
    
    return render(request, 'admin_dashboard.html')

def admin_login_api(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        valid_username = os.getenv('ADMIN_USERNAME')
        # In a real app we'd use bcrypt, for this conversion we'll check against env
        # Original uses bcrypt.compare(password, passwordHash)
        # We'll assume a simple check for now or implement bcrypt if necessary
        # But wait, I'll use the same logic as original if I can.
        
        if username == valid_username and verify_password(password):
            token = create_session_token()
            response = JsonResponse({'success': True, 'message': 'Login successful'})
            response.set_cookie(
                'admin_session', token, 
                max_age=3600, httponly=True, 
                samesite='Strict', secure=not settings.DEBUG
            )
            return response
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)
            
    except Exception as e:
        print(f"Login error: {e}")
        return JsonResponse({'error': 'Something went wrong'}, status=500)

def admin_send_api(request):
    # Check session
    session_token = request.COOKIES.get('admin_session')
    if not session_token or not verify_session_token(session_token):
        return JsonResponse({'error': 'Unauthorized'}, status=401)
        
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
        
    try:
        send_type = request.POST.get('type')
        if send_type == 'text':
            content = request.POST.get('content')
            success = send_telegram_message(content)
        else:
            file_obj = request.FILES.get('file')
            success = send_telegram_file(file_obj, caption=f"File: {file_obj.name}")
            
        if success:
            return JsonResponse({'success': True, 'message': '✅ Sent to Telegram!'})
        else:
            return JsonResponse({'error': 'Failed to send to Telegram'}, status=500)
            
    except Exception as e:
        print(f"Admin send error: {e}")
        return JsonResponse({'error': str(e)}, status=500)

# Helper functions for session management
def create_session_token():
    token = os.urandom(32).hex()
    secret = settings.SECRET_KEY.encode()
    signature = hmac.new(secret, token.encode(), hashlib.sha256).hexdigest()
    return f"{token}.{signature}"

def verify_session_token(signed_token):
    try:
        token, signature = signed_token.split('.')
        secret = settings.SECRET_KEY.encode()
        expected_signature = hmac.new(secret, token.encode(), hashlib.sha256).hexdigest()
        return hmac.compare_digest(signature, expected_signature)
    except:
        return False

def verify_password(password):
    # This should use bcrypt.compare if we have the hash
    # For now, let's look at the original project to see if I can find the hash or if I should just mock it
    import bcrypt
    password_hash = os.getenv('ADMIN_PASSWORD_HASH')
    if not password_hash:
        return False
    return bcrypt.checkpw(password.encode(), password_hash.encode())
