// src/services/messages.ts
import API from "./api";

export const sendMessage = (receiver_id: string, body: string) =>
  API.post("/messages", { receiver_id, body });

export const getHistory = (other_user_id: string, limit = 50) =>
  API.get(`/messages/history/${other_user_id}`, { params: { limit } });

export const getConversationHistory = async (conversation_id: string, limit = 50) => {
  return API.get(`/messages/${conversation_id}/history?limit=${limit}`);
};