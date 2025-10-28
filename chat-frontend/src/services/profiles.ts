// src/services/profiles.ts
import API from "./api";

export const createProfile = async (data: any) => {
  return API.post("/profiles", data);
};

export const getMyProfile = async () => {
  return API.get("/profiles/me");
};

export const updateProfile = (data: any) => API.patch("/profiles/me", data);