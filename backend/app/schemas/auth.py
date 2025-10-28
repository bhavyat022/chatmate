from pydantic import BaseModel, EmailStr

class SignupIn(BaseModel):
    email: EmailStr
    password: str
    username: str  # create initial profile

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class AuthOut(BaseModel):
    access_token: str
    user_id: str
    email: EmailStr
