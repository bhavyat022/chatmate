from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
from app.core.supabase_client import get_supabase
from app.schemas.auth import SignupIn, LoginIn, AuthOut
from pydantic import BaseModel

class SignupOut(BaseModel):
    message: str
    user_id: str
    email: str

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup", response_model=SignupOut)
def signup(payload: SignupIn, supabase: Client = Depends(get_supabase)):
    res = supabase.auth.sign_up(
            {"email": payload.email, "password": payload.password}
        )

    if not res.user:
        raise HTTPException(status_code=400, detail="Signup failed, no user returned")

    return SignupOut(
        message= "Signup successful. Please check your email to confirm your account before logging in.",
        user_id= res.user.id,
        email= res.user.email,
    )

@router.post("/login", response_model=AuthOut)
def login(payload: LoginIn, supabase: Client = Depends(get_supabase)):
    session = supabase.auth.sign_in_with_password({"email": payload.email, "password": payload.password})
    if not session.session:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user = session.user
    return AuthOut(
        access_token=session.session.access_token,
        user_id=user.id,
        email=user.email,
    )
