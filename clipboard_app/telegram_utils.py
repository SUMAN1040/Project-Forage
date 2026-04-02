import requests
import os
from django.conf import settings

# Load Telegram credentials from environment
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID')

def send_telegram_message(message):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("Telegram credentials missing")
        return False
    
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        'chat_id': TELEGRAM_CHAT_ID,
        'text': message,
        'parse_mode': 'HTML'
    }
    
    try:
        response = requests.post(url, data=payload)
        return response.ok
    except Exception as e:
        print(f"Error sending Telegram message: {e}")
        return False

def send_telegram_file(file_obj, caption=""):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("Telegram credentials missing")
        return False
    
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendDocument"
    files = {'document': file_obj}
    payload = {
        'chat_id': TELEGRAM_CHAT_ID,
        'caption': caption
    }
    
    try:
        response = requests.post(url, data=payload, files=files)
        return response.ok
    except Exception as e:
        print(f"Error sending Telegram file: {e}")
        return False
