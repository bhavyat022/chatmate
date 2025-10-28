// src/services/connections.ts
import API from "./api";

export const requestConnection = async (addressee_id: string) => {
  return API.post("/connections", { addressee_id });
};

export const listConnections = async (status?: string) => {
  const res = await API.get("/connections", {
    params: status ? { status } : {},
  });
  return res;
};

export const respondToConnection = async (connectionId: string, action: string) => {
  const res = await API.post("/connections/respond", {
    connection_id: connectionId,
    action,
  });
  return res;
};