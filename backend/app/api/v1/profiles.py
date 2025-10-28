from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import Client
from app.core.supabase_client import get_supabase
from app.core.security import get_current_user
from app.schemas.profiles import ProfileCreate, ProfileUpdate, ProfileOut
from sqlalchemy.orm import Session

router = APIRouter(prefix="/profiles", tags=["profiles"])

@router.post("", response_model=ProfileOut)
def create_profile(payload: ProfileCreate, user=Depends(get_current_user), supabase: Client = Depends(get_supabase)):
    data = {"id": user.id, **payload.model_dump()}
    # Check if profile already exists
    existing = supabase.table("profiles").select("id").eq("id", user.id).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Profile already exists")
    res = supabase.table("profiles").insert(data).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Failed to create profile")
    return res.data[0]

@router.get("/me", response_model=ProfileOut)
def get_me(user=Depends(get_current_user), supabase: Client = Depends(get_supabase)):
    res = supabase.table("profiles").select("*").eq("id", user.id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return res.data

@router.post("", response_model=ProfileOut)
def create_or_replace_profile(payload: ProfileCreate, user=Depends(get_current_user), supabase: Client = Depends(get_supabase)):
    data = {"id": user.id, **payload.model_dump()}
    res = supabase.table("profiles").upsert(data, on_conflict="id").select("*").single().execute()
    return res.data

@router.patch("/me", response_model=ProfileOut)
def update_me(payload: ProfileUpdate, user=Depends(get_current_user), supabase: Client = Depends(get_supabase)):
    updates = payload.model_dump(exclude_unset=True)

    if not updates:
        raise HTTPException(status_code=400, detail="No updates provided")

    res = (
        supabase.table("profiles")
        .update(updates)
        .eq("id", user.id)
        .execute()
    )

    if not res.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    return res.data[0]  # updated profile row

@router.get("/search", response_model=list[ProfileOut])
def search_users(
    q: str = Query(..., description="username or user_id"),
    limit: int = 20,
    supabase: Client = Depends(get_supabase),
):
    # if looks like UUID, search by id; else by username ilike
    import re
    is_uuid = bool(re.fullmatch(r"[0-9a-fA-F-]{36}", q))
    if is_uuid:
        res = supabase.table("profiles").select("*").eq("id", q).limit(1).execute()
        return res.data or []
    else:
        res = supabase.table("profiles").select("*").ilike("username", f"%{q}%").limit(limit).execute()
        return res.data or []
    
@router.get("/by-id/{user_id}")
def get_profile_by_id(user_id: str, supabase: Client = Depends(get_supabase)):
    # Query the 'profiles' table in Supabase for this user
    res = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
    
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found")

    # Return minimal safe data
    profile = res.data
    return {
        "id": profile["id"],
        "username": profile.get("username"),
        "name": profile.get("name"),
        "phone": profile.get("phone"),
        "avatar_url": profile.get("avatar_url"),
    }