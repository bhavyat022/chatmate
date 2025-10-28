import { create } from "zustand";
import { sendMessage, getHistory } from "../services/messages";

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  body: string;
  created_at: string;
  read: boolean;
  conversation_id: string | null;
}

interface MessageState {
  messages: Message[];
  loading: boolean;
  fetchHistory: (otherUserId: string) => Promise<void>;
  sendNewMessage: (receiver_id: string, body: string) => Promise<Message | null>;
  addOne: (msg: Message) => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  loading: false,

  // 📜 Load chat history
  fetchHistory: async (otherUserId) => {
    set({ loading: true });
    try {
      const res = await getHistory(otherUserId);
      const data: Message[] = res.data || [];
      // backend returns newest first; reverse for top→bottom
      set({ messages: data.slice().reverse(), loading: false });
    } catch (e) {
      console.error("❌ Failed to load history:", e);
      set({ loading: false });
    }
  },

  // ✉️ Send a message (persist + optimistic update)
  sendNewMessage: async (receiver_id, body) => {
    try {
      const res = await sendMessage(receiver_id, body);
      const saved: Message = res.data;

      // only add if not already in store
      const current = get().messages;
      if (!current.find((m) => m.id === saved.id)) {
        set({ messages: [...current, saved] });
      }

      return saved;
    } catch (e) {
      console.error("❌ Failed to send message:", e);
      alert("Failed to send message");
      return null;
    }
  },

  // 💬 Add one (from WebSocket broadcast)
  addOne: (msg) =>
    set((state) => {
      if (state.messages.find((m) => m.id === msg.id)) return state;
      return { messages: [...state.messages, msg] };
    }),
}));
