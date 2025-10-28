from pydantic import BaseModel

class ProfileBase(BaseModel):
    username: str
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None
    avatar_url: str | None = None

class ProfileCreate(ProfileBase):
    username: str
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None
    avatar_url: str | None = None

class ProfileUpdate(BaseModel):
    username: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None
    avatar_url: str | None = None

class ProfileOut(ProfileBase):
    id: str
