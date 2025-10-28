// src/store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { signup, login, getProfile } from "../services/auth";

interface AuthState {
  user: any | null;
  token: string | null;
  loading: boolean;
  signupUser: (email: string, password: string, username: string) => Promise<void>;
  loginUser: (email: string, password: string) => Promise<void>;
  fetchUser: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,

      signupUser: async (email, password, username) => {
        set({ loading: true });
        try {
          await signup(email, password, username);
          alert("Signup successful! Please verify your email and then log in.");
          window.location.href = "/login";
        } catch (err) {
          console.error("Signup failed", err);
          alert("Signup failed, please try again.");
        } finally {
          set({ loading: false });
        }
      },

      loginUser: async (email, password) => {
        set({ loading: true });
        try {
          const res = await login(email, password);
          const token = res.data.access_token;
          localStorage.setItem("token", token);
          const me = await getProfile();

          // ✅ FIXED: store user directly (not me.data.user)
          set({ token, user: me.data, loading: false });
          console.log("✅ Logged in user:", me.data);
        } catch (err: any) {
          console.error("Login failed", err);
          set({ loading: false });
          alert("Invalid credentials or unregistered user.");
          window.location.href = "/signup";
        }
      },

      fetchUser: async () => {
        set({ loading: true });
        try {
          const res = await getProfile();
          console.log("👤 fetchUser() received:", res.data);

          // ✅ FIXED: store user directly (not res.data.user)
          set({ user: res.data });
        } catch (err) {
          console.warn("No profile found");
          set({ user: null });
        } finally {
          set({ loading: false });
        }
      },

      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null });
        window.location.href = "/login";
      },
    }),
    { name: "auth-storage" }
  )
);
