import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            accessToken: null,

            setAuth: (user, accessToken) => set({ user, accessToken }),
            setAccessToken: (accessToken) => set({ accessToken }),
            logout: () => set({ user: null, accessToken: null }),

            isAuthenticated: () => {
                const state = useAuthStore.getState()
                return !!state.accessToken && !!state.user
            },
        }),
        {
            name: 'auth-storage',
            // Only persist user info, not the access token
            // Access token is short-lived — refresh token in cookie handles re-auth
            partialize: (state) => ({ user: state.user }),
        }
    )
)

export default useAuthStore