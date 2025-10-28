from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import Client
from app.core.supabase_client import get_supabase
from app.core.security import get_current_user
from app.schemas.conversations import ConversationOut, CreateDMOut

router = APIRouter(prefix="/conversations", tags=["conversations"])

def _dm_pair(a: str, b: str) -> str:
    return f"{min(a,b)}|{max(a,b)}"

@router.post("/dm/{other_user_id}", response_model=CreateDMOut)
def get_or_create_dm(other_user_id: str,
                    user=Depends(get_current_user),
                    supabase: Client = Depends(get_supabase)):

    if other_user_id == user.id:
        raise HTTPException(status_code=400, detail="Cannot DM yourself")

    pair = _dm_pair(user.id, other_user_id)

    # 1) find or create conversation with this dm_pair
    existing = supabase.table("conversations").select("*").eq("dm_pair", pair).execute()
    if existing.data:
        convo = existing.data[0]
    else:
        # Optional: check settings/blocks to decide is_request
        is_request = False  # set True if you want DM requests when not connected
        ins = supabase.table("conversations").insert({
            "type": "dm",
            "dm_pair": pair,
            "is_request": is_request
        }).execute()
        if not ins.data:
            raise HTTPException(status_code=500, detail="Failed to create conversation")
        convo = ins.data[0]
        # add both participants
        supabase.table("conversation_participants").insert([
            {"conversation_id": convo["id"], "user_id": user.id},
            {"conversation_id": convo["id"], "user_id": other_user_id},
        ]).execute()

    return {
        "id": convo["id"],
        "type": convo["type"],
        "is_request": convo["is_request"],
    }

@router.get("", response_model=list[ConversationOut])
def list_inbox(
    limit: int = 20,
    supabase: Client = Depends(get_supabase),
    user=Depends(get_current_user),
):
    # conversations for this user ordered by updated_at desc
    convos = supabase.rpc("exec_sql", {  # if you don't have rpc, use a join in app
        "query": """
        select c.id, c.type, c.is_request
        from conversations c
        join conversation_participants p on p.conversation_id = c.id
        where p.user_id = %(uid)s
        order by c.updated_at desc
        limit %(lim)s
        """,
        "params": {"uid": user.id, "lim": limit}
    }).execute()  # Alternative: do select on participants then fetch convos by ids
    return convos.data or []
