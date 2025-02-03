import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { User } from "@/types/index";

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      checkAuth: async () => {
        try {
          set({ isLoading: true });
          const response = await axios.get("/api/auth/check", {
            withCredentials: true,
          });

          if (response.data.user) {
            set({ user: response.data.user });
          } else {
            set({ user: null });
          }
        } catch (error) {
          console.error("Auth check error:", error);
          set({ user: null });
        } finally {
          set({ isLoading: false });
        }
      },
      logout: async () => {
        try {
          set({ isLoading: true });
          await axios.post(
            "/api/auth/logout",
            {},
            {
              withCredentials: true,
            }
          );
          set({ user: null });
          window.location.href = "/login";
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      skipHydration: true,
    }
  )
);
