// src/store/profileStore.ts
import { create } from "zustand";
import { createProfile, getMyProfile, updateProfile } from "../services/profiles";

interface ProfileState {
  profile: any | null;
  loading: boolean;
  loaded: boolean;   
  createUserProfile: (data: any) => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateUserProfile: (data: any) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  loading: false,
  loaded: false,

  createUserProfile: async (data) => {
    set({ loading: true });
    try {
      const res = await createProfile(data);
      set({ profile: res.data, loading: false, loaded: true });
    } catch (e) {
      console.error("Create profile failed", e);
      set({ loading: false, loaded: true });
    }
  },

  fetchProfile: async () => {
    set({ loading: true });
    try {
      const res = await getMyProfile();
      set({ profile: res.data, loading: false, loaded: true });
    } catch (e: any) {
      console.warn("No profile found or failed to fetch", e);
      // ✅ Important: still mark as loaded, even if 404
      set({ profile: null, loading: false, loaded: true });
    }
  },

  updateUserProfile: async (data) => {
    set({ loading: true });
    try {
      const res = await updateProfile(data);
      set({ profile: res.data, loading: false, loaded: true });
    } catch (e) {
      console.error("Update profile failed", e);
      set({ loading: false, loaded: true });
    }
  },
}));