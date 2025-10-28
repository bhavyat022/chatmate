from functools import lru_cache
from supabase import create_client, Client
from app.core.config import SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

@lru_cache(maxsize=1)
def get_supabase() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

print("Supabase client initialized with key prefix:", SUPABASE_SERVICE_ROLE_KEY[:12])
