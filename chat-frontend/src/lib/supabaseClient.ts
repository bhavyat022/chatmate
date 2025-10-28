import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 1️⃣ Realtime client — pure anon, no headers
let realtimeClient: SupabaseClient | null = null;
export const getRealtimeClient = (): SupabaseClient => {
    if (!realtimeClient) {
    console.log("⚡ Creating Supabase realtime client (anon key only)");
    realtimeClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        realtime: { params: { eventsPerSecond: 10 } },
    });
    }
    return realtimeClient;
};

// 2️⃣ API client — with optional FastAPI JWT for REST calls
let apiClient: SupabaseClient | null = null;
let currentToken: string | null = null;

export const getApiClient = (): SupabaseClient => {
    const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!apiClient || token !== currentToken) {
    console.log("🔁 Creating new Supabase API client (for REST)");
    apiClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
    });
    currentToken = token;
    }

    return apiClient;
};

