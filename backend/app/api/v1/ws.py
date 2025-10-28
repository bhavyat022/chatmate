from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
import json
from app.core.supabase_client import get_supabase

router = APIRouter(prefix="/ws", tags=["websocket"])

# Dictionary of active connections per user
active_connections: Dict[str, List[WebSocket]] = {}

async def connect_user(user_id: str, websocket: WebSocket):
    await websocket.accept()
    active_connections.setdefault(user_id, []).append(websocket)
    print(f"✅ Connected: {user_id}")

def remove_user(user_id: str, websocket: WebSocket):
    active_connections[user_id].remove(websocket)
    if not active_connections[user_id]:
        del active_connections[user_id]
    print(f"❌ Disconnected: {user_id}")

async def broadcast_to_user(user_id: str, message: dict):
    if user_id in active_connections:
        for ws in active_connections[user_id]:
            await ws.send_text(json.dumps(message))

@router.websocket("/chat/{user_id}")
async def chat_socket(websocket: WebSocket, user_id: str):
    await connect_user(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)

            # message: { sender_id, receiver_id, body }
            print(f"📩 Message from {msg['sender_id']} → {msg['receiver_id']}: {msg['body']}")

            # Send to receiver
            await broadcast_to_user(msg["receiver_id"], msg)

            # Echo back to sender for instant appearance
            await broadcast_to_user(msg["sender_id"], msg)

            # Optional: store message in Supabase
            supabase = get_supabase()
            supabase.table("messages").insert(msg).execute()
            # You can later use your existing insert logic from messages.py
    except WebSocketDisconnect:
        remove_user(user_id, websocket)

