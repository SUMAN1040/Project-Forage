import nanoid
import re
from django.conf import settings

# Constants from original project
CLIP_ID_LENGTH = 10
RETRIEVAL_CODE_LENGTH = 6
PUBLIC_MAX_TEXT_LENGTH = 1000000
PUBLIC_MAX_FILE_SIZE = 700 * 1024
CLIP_TTL_SECONDS = 600

# Alphabets for nanoid
CLIP_ID_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789"
CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"

def create_clip_id():
    return nanoid.generate(CLIP_ID_ALPHABET, CLIP_ID_LENGTH)

def create_retrieval_code():
    return nanoid.generate(CODE_ALPHABET, RETRIEVAL_CODE_LENGTH)

def sanitize_text(text, max_length=PUBLIC_MAX_TEXT_LENGTH):
    if not isinstance(text, str):
        return ""
    clean = text.strip()
    if len(clean) > max_length:
        clean = clean[:max_length]
    return clean

def get_file_extension(file_name):
    if not file_name or not isinstance(file_name, str):
        return ""
    parts = file_name.split('.')
    if len(parts) < 2:
        return ""
    return "." + parts[-1].lower()

def validate_public_file(file):
    if not file:
        return False, "No file provided"
    
    if file.size == 0:
        return False, "File is empty"
    
    if file.size > PUBLIC_MAX_FILE_SIZE:
        max_kb = round(PUBLIC_MAX_FILE_SIZE / 1024)
        return False, f"File too large. Public limit is {max_kb}KB."
    
    return True, None
