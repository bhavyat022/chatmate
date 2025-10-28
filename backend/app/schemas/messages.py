from pydantic import BaseModel
from datetime import datetime

class MessageCreate(BaseModel):
    receiver_id: str
    body: str

class MessageOut(BaseModel):
    id: str
    sender_id: str
    receiver_id: str
    body: str
    created_at: datetime
    read_at: datetime | None = None
    read: bool | None = False
    conversation_id: str | None = None
