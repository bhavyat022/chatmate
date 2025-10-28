// src/services/auth.ts
import API from "./api";

export const signup = async (email: string, password: string, username: string) => {
  return API.post("/auth/signup", {
    email,
    password,
    username,
  });
};

export const login = async (email: string, password: string) => {
  return API.post("/auth/login", { email, password });
};

export const getProfile = async () => {
  return API.get("/profiles/me");
};
