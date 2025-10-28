from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import Client
from app.core.supabase_client import get_supabase
from app.core.security import get_current_user
from app.schemas.messages import MessageCreate, MessageOut
from app.schemas.conversations import SendMessageIn, ReadPointerIn
from app.api.v1.ws import broadcast_to_user

router = APIRouter(prefix="/messages", tags=["messages"])

@router.post("", response_model=MessageOut)
async def send_message(payload: MessageCreate, user=Depends(get_current_user), supabase: Client = Depends(get_supabase)):
    if payload.receiver_id == user.id:
        raise HTTPException(status_code=400, detail="Cannot message yourself")
    
    # check if conversation already exists
    convo = (
        supabase.table("conversations")
        .select("id")
        .or_(f"and(user1_id.eq.{user.id},user2_id.eq.{payload.receiver_id}),and(user1_id.eq.{payload.receiver_id},user2_id.eq.{user.id})")
        .limit(1)
        .execute()
    )

    if convo.data:
        conversation_id = convo.data[0]["id"]
    else:
        # create new conversation
        new_convo = (
            supabase.table("conversations")
            .insert({
                "user1_id": user.id,
                "user2_id": payload.receiver_id,
            })
            .execute()
        )
        if not new_convo.data:
            raise HTTPException(status_code=500, detail="Failed to create conversation")
        conversation_id = new_convo.data[0]["id"]
        
    res = supabase.table("messages").insert({
        "sender_id": user.id,
        "receiver_id": payload.receiver_id,
        "body": payload.body,
        "conversation_id": conversation_id,
    }).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail=getattr(res, "error", {"message": "Insert failed"}).get("message", "Insert failed"))

    saved = res.data[0]

    # 🔔 broadcast to the receiver (and optionally to sender too)
    await broadcast_to_user(saved["receiver_id"], saved)
    await broadcast_to_user(saved["sender_id"], saved)

    return saved

@router.get("/history/{other_user_id}", response_model=list[MessageOut])
def history(
    other_user_id: str,
    limit: int = 50,
    before: str | None = Query(None, description="ISO timestamp to paginate back"),
    user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    # two-way convo
    filter_pair = f"and(sender_id.eq.{user.id},receiver_id.eq.{other_user_id})"
    filter_pair_rev = f"and(sender_id.eq.{other_user_id},receiver_id.eq.{user.id})"
    q = supabase.table("messages").select("*").or_(f"{filter_pair},{filter_pair_rev}").order("created_at", desc=True).limit(limit)
    if before:
        q = q.lt("created_at", before)
    res = q.execute()
    data = res.data or []
    # newest first; frontend can reverse
    return data

@router.post("/read/{message_id}")
def mark_read(message_id: str, user=Depends(get_current_user), supabase: Client = Depends(get_supabase)):
    # only receiver can update read_at (policy)
    res = (
        supabase.table("messages")
        .update({"read": True})
        .eq("id", message_id)
        .eq("receiver_id", user.id)  # only receiver can mark as read
        .execute()
    )

    if not res.data:  # instead of checking res.error
        raise HTTPException(status_code=404, detail="Message not found or not yours")

    return {"status": "success", "message": res.data[0]}


@router.get("/{conversation_id}/history", response_model=list[MessageOut])
def history(conversation_id: str,
            limit: int = 50,
            before: str | None = Query(None, description="ISO timestamp to page back"),
            supabase: Client = Depends(get_supabase),
            user=Depends(get_current_user)):

    q = (supabase.table("messages")
        .select("*")
        .eq("conversation_id", conversation_id)
        .order("created_at", desc=True)
        .limit(limit))

    if before:
        q = q.lt("created_at", before)

    res = q.execute()
    return res.data or []

