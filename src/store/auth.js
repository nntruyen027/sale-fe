import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,

            setAuth: ({ user, token }) => set({ user, token }),

            setUser: (user) =>
                set((state) => ({ ...state, user })),

            clearAuth: () => set({ user: null, token: null }),

            isLoggedIn: () => !!get().token,
        }),
        {
            name: "auth-storage", // key trong localStorage
        }
    )
);
