// src/store/connectionStore.ts
import { create } from "zustand";
import { requestConnection, listConnections, respondToConnection } from "../services/connections";

interface Connection {
  id: string;
  status: string;
  direction?: "incoming" | "outgoing";
  self?: any;
  other?: any;
}

interface ConnectionState {
  connections: Connection[];
  loading: boolean;
  fetchConnections: (status?: string) => Promise<void>;
  sendRequest: (userId: string) => Promise<void>;
  acceptRequest: (connectionId: string) => Promise<void>;
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  connections: [],
  loading: false,

  fetchConnections: async (status) => {
    set({ loading: true });
    try {
      const res = await listConnections(status);
      set({ connections: res.data, loading: false });
    } catch (err) {
      console.error("Failed to fetch connections:", err);
      set({ loading: false });
    }
  },

  sendRequest: async (userId) => {
    try {
      const res = await requestConnection(userId);
      // optimistic update
      set({ connections: [...get().connections, res.data] });
    } catch (err) {
      console.error("Failed to send request:", err);
      throw err;
    }
  },

  acceptRequest: async (connectionId) => {
    try {
      const res = await respondToConnection(connectionId, "accept");
      // refresh all connections after accepting
      await get().fetchConnections();
      return res.data;
    } catch (err) {
      console.error("Failed to accept request:", err);
      throw err;
    }
  },
}));
