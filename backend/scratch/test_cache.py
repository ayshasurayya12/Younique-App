import os
import django
from django.core.cache import cache
import secrets

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

token = secrets.token_urlsafe(32)
print(f"Setting token: {token}")
cache.set(f'email_verify_{token}', 999, timeout=3600)
val = cache.get(f'email_verify_{token}')
print(f"Retrieved value: {val}")
