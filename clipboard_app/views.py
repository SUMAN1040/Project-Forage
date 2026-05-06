import json
import time
import base64
import requests
import requests
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from .utils import (
    create_clip_id, create_retrieval_code, sanitize_text, 
    validate_public_file, CLIP_TTL_SECONDS
)
from .redis_client import redis_client

def home_view(request):
    return render(request, 'index.html')

@csrf_exempt
def create_clip_api(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        clip_type = request.POST.get('type')
        if clip_type not in ['text', 'file']:
            return JsonResponse({'error': 'Invalid request type'}, status=400)
        
        clip_id = create_clip_id()
        code = create_retrieval_code()
        
        # Check for collisions (simplified)
        while redis_client.get(f"clip:{clip_id}"):
            clip_id = create_clip_id()
        
        while redis_client.get(f"code:{code}"):
            code = create_retrieval_code()
            
        clip_data = {}
        
        if clip_type == 'text':
            content = request.POST.get('content')
            if not content:
                return JsonResponse({'error': 'Text content is required'}, status=400)
            
            sanitized = sanitize_text(content)
            clip_data = {
                'type': 'text',
                'content': sanitized,
                'createdAt': int(time.time() * 1000)
            }
        else: # file
            file_obj = request.FILES.get('file')
            valid, error = validate_public_file(file_obj)
            if not valid:
                return JsonResponse({'error': error}, status=400)
            
            # Read file and encode to base64
            file_content = file_obj.read()
            base64_content = base64.b64encode(file_content).decode('utf-8')
            
            clip_data = {
                'type': 'file',
                'fileName': file_obj.name,
                'fileType': file_obj.content_type,
                'fileSize': file_obj.size,
                'content': base64_content,
                'createdAt': int(time.time() * 1000)
            }
            
        # Save to Redis
        redis_client.set(f"clip:{clip_id}", json.dumps(clip_data), ex=CLIP_TTL_SECONDS)
        redis_client.set(f"code:{code}", clip_id, ex=CLIP_TTL_SECONDS)
        
        expires_at = int(time.time() * 1000) + CLIP_TTL_SECONDS * 1000
        
        return JsonResponse({
            'success': True,
            'id': clip_id,
            'code': code,
            'expiresAt': expires_at
        })
        
    except Exception as e:
        print(f"Error creating clip: {e}")
        return JsonResponse({'error': 'Something went wrong. Please try again.'}, status=500)

@csrf_exempt
def retrieve_clip_api(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        code = data.get('code', '').strip().upper()
        
        if not code:
            return JsonResponse({'error': 'Code is required'}, status=400)
            
        clip_id = redis_client.get(f"code:{code}")
        if not clip_id:
            return JsonResponse({'error': 'Invalid or expired code'}, status=404)
        
        # Redis returns string, but sometimes we might need it as string directly
        if isinstance(clip_id, bytes):
            clip_id = clip_id.decode('utf-8')
            
        clip_json = redis_client.get(f"clip:{clip_id}")
        if not clip_json:
            return JsonResponse({'error': 'Invalid or expired code'}, status=404)
            
        clip_data = json.loads(clip_json)
        
        # Calculate remaining time
        now = int(time.time() * 1000)
        expires_at = clip_data['createdAt'] + (CLIP_TTL_SECONDS * 1000)
        remaining_ms = expires_at - now
        
        if remaining_ms <= 0:
            return JsonResponse({'error': 'Clip has expired'}, status=404)
            
        return JsonResponse({
            'success': True,
            'clip': clip_data,
            'remainingMs': remaining_ms
        })
        
    except Exception as e:
        print(f"Error retrieving clip: {e}")
        return JsonResponse({'error': 'Something went wrong. Please try again.'}, status=500)

def clip_detail_view(request, clip_id):
    # This view would be for the direct links /clip/[id]
    clip_json = redis_client.get(f"clip:{clip_id}")
    if not clip_json:
        return render(request, 'error.html', {'error': 'Clip not found or expired'})
        
    clip_data = json.loads(clip_json)
    return render(request, 'clip_detail.html', {'clip': clip_data})