import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number
  full_name: string
  role: 'admin' | 'seller'
  branch_id: number | null
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
        localStorage.removeItem('auth-storage') // Limpia el storage
      },
    }),
    {
      name: 'auth-storage', // Esto guarda la sesión en el navegador automáticamente
    }
  )
)