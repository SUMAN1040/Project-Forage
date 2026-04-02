import json
import requests
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings

@csrf_exempt
def chat_proxy_api(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        message = data.get('message', '').strip()
        if not message:
            return JsonResponse({'error': 'Message is required'}, status=400)
            
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            return JsonResponse({'error': 'Gemini API key not configured'}, status=500)
            
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={api_key}"
        
        payload = {
            "contents": [{
                "parts": [{"text": message}]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 1024,
            }
        }
        
        response = requests.post(url, json=payload)
        res_data = response.json()
        
        if not response.ok:
            error_msg = res_data.get('error', {}).get('message', 'Gemini API error')
            return JsonResponse({'error': error_msg}, status=response.status_code)
            
        # Extract response text
        try:
            bot_response = res_data['candidates'][0]['content']['parts'][0]['text']
        except (KeyError, IndexError):
            bot_response = "I'm sorry, I couldn't process that request."
            
        return JsonResponse({
            'success': True,
            'response': bot_response
        })
        
    except Exception as e:
        print(f"Error in chat proxy: {e}")
        return JsonResponse({'error': 'Failed to connect to AI server'}, status=500)
