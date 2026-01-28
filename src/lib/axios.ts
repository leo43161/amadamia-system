import axios from 'axios'
import { useAuthStore } from '@/lib/store'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor: Agrega el token a cada petición automáticamente
api.interceptors.request.use((config) => {
  // Leemos el token desde el estado de Zustand (que persiste en localStorage)
  const token = useAuthStore.getState().token
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor: Si la API dice "401 No Autorizado", cerramos sesión
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      // Opcional: Redirigir al login
      if (typeof window !== 'undefined') {
         window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api