from upstash_redis import Redis
from django.conf import settings

def get_redis_client():
    return Redis(
        url=settings.UPSTASH_REDIS_REST_URL,
        token=settings.UPSTASH_REDIS_REST_TOKEN
    )

# Singleton-like access
redis_client = get_redis_client()
