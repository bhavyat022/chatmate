from pydantic import BaseModel
from typing import Optional, Literal

class ConnectionCreate(BaseModel):
    addressee_id: str
    
class ProfileBrief(BaseModel):
    id: str
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class ConnectionOut(BaseModel):
    id: str
    status: str
    direction: Literal["incoming", "outgoing"]
    self: Optional[ProfileBrief] = None
    other: Optional[ProfileBrief] = None

class ConnectionRespond(BaseModel):
    connection_id: str
    action: Literal["accept","block"]
