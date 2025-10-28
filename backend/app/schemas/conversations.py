from pydantic import BaseModel
from typing import Optional

class ConversationOut(BaseModel):
    id: str
    type: str
    is_request: bool

class CreateDMOut(ConversationOut):
    pass

class SendMessageIn(BaseModel):
    content: str

class MessageOut(BaseModel):
    id: str
    conversation_id: str
    sender_id: str
    content: str
    created_at: str

class ReadPointerIn(BaseModel):
    last_read_message_id: str
