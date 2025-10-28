from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import Client
from app.core.supabase_client import get_supabase
from app.core.security import get_current_user
from app.schemas.connections import ConnectionCreate, ConnectionRespond, ConnectionOut

router = APIRouter(prefix="/connections", tags=["connections"])

@router.post("", response_model=ConnectionOut)
def request_connection(
    payload: ConnectionCreate,
    user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    if payload.addressee_id == user.id:
        raise HTTPException(status_code=400, detail="Cannot connect to self")

    try:
        # Try to insert a new connection
        res = (
            supabase.table("connections")
            .insert({
                "requester_id": user.id,
                "addressee_id": payload.addressee_id,
            })
            .execute()
        )

    except Exception as e:
        # Catch Postgres duplicate key constraint (error code 23505)
        if "duplicate key value violates unique constraint" in str(e):
            # Fetch the existing connection and return it
            existing = (
                supabase.table("connections")
                .select("*")
                .or_(f"and(requester_id.eq.{user.id},addressee_id.eq.{payload.addressee_id}),and(requester_id.eq.{payload.addressee_id},addressee_id.eq.{user.id})")
                .single()
                .execute()
            )
            connection = existing.data
        else:
            raise e
    else:
        # No error, use the newly inserted record
        connection = res.data[0]

    # fetch profile info to enrich response
    profiles_res = (
        supabase.table("profiles")
        .select("id, username, first_name, last_name")
        .in_("id", [user.id, payload.addressee_id])
        .execute()
    )
    profiles = {p["id"]: p for p in (profiles_res.data or [])}

    connection["self"] = profiles.get(user.id)
    connection["other"] = profiles.get(payload.addressee_id)
    connection["direction"] = "outgoing" if connection["requester_id"] == user.id else "incoming"

    return connection

@router.get("", response_model=list[ConnectionOut])
def list_connections(
    status: str | None = None,
    user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    # Base query to fetch user’s connections
    query = (
        supabase.table("connections")
        .select("*")
        .or_(f"requester_id.eq.{user.id},addressee_id.eq.{user.id}")
    )
    if status:
        query = query.eq("status", status)

    res = query.execute()

    # Fetch profiles manually (safe even without FK)
    connections = res.data or []
    if not connections:
        return []

    # collect unique user ids
    user_ids = set()
    for c in connections:
        user_ids.add(c["requester_id"])
        user_ids.add(c["addressee_id"])

    # fetch profiles
    profiles_res = supabase.table("profiles").select("id, username, first_name, last_name").in_("id", list(user_ids)).execute()
    profiles = {p["id"]: p for p in (profiles_res.data or [])}

    # enrich connections with profile data
    for c in connections:
        #c["sender"] = profiles.get(c["requester_id"])
        #c["addressee"] = profiles.get(c["addressee_id"])
        if c["requester_id"] == user.id:
            c["self"] = profiles.get(user.id)
            c["other"] = profiles.get(c["addressee_id"])
            c["direction"] = "outgoing"
        else:
            c["self"] = profiles.get(user.id)
            c["other"] = profiles.get(c["requester_id"])
            c["direction"] = "incoming"

    return connections


@router.post("/respond", response_model=ConnectionOut)
def respond_connection(
    payload: ConnectionRespond,
    user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    conn = supabase.table("connections").select("*").eq("id", payload.connection_id).execute()

    if not conn.data:
        raise HTTPException(status_code=404, detail="Connection not found")

    if conn.data[0]["addressee_id"] != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to respond")

    new_status = "accepted" if payload.action == "accept" else "rejected"
    res = (
        supabase.table("connections")
        .update({"status": new_status})
        .eq("id", payload.connection_id)
        .execute()
    )

    if not res.data:
        raise HTTPException(status_code=400, detail=res.error.message)

    connection = res.data[0]

    # enrich with profiles
    profiles_res = supabase.table("profiles").select("id, username, first_name, last_name").in_(
        "id", [connection["requester_id"], connection["addressee_id"]]
    ).execute()
    profiles = {p["id"]: p for p in (profiles_res.data or [])}

    if connection["requester_id"] == user.id:
        connection["self"] = profiles.get(user.id)
        connection["other"] = profiles.get(connection["addressee_id"])
        connection["direction"] = "outgoing"
    else:
        connection["self"] = profiles.get(user.id)
        connection["other"] = profiles.get(connection["requester_id"])
        connection["direction"] = "incoming"

    return connection
