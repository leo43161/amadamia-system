'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Lock, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import api from "@/lib/axios"
import { useAuthStore } from "@/lib/store"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { loginSchema, type LoginFormValues } from "@/schemas/auth"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const setAuth = useAuthStore((state) => state.setAuth)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  })

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)
    try {
      console.log('Submitting login form with data:', data);
      // 1. LLAMADA REAL A LA API
      const response = await api.post('/auth/login', data)

      // 2. Si llegamos acá, es éxito (200 OK)
      const { user, token } = response.data
      console.log('Login successful:', response.data)
      /* console.log('Login successful:', user) */
      // 3. Guardamos en Zustand (Persistencia automática)
      setAuth(user, token)

      toast.success(`¡Hola de nuevo, ${user.full_name.split(' ')[0]}!`, {
        description: "Has ingresado al sistema correctamente."
      })

      // 4. Redirigimos
      router.push("/")

    } catch (error: any) {
      console.error(error)
      // Manejo de errores que vienen de la API PHP
      const message = error.response?.data?.message || "Ocurrió un error inesperado."

      toast.error("Error de acceso", { description: message })
    } finally {
      setIsLoading(false)
    }
  }

  // ... (El resto del return con el diseño Split Screen queda IGUAL) ...
  return (
    <div className="w-full min-h-screen grid lg:grid-cols-2">
      {/* ... Copia el mismo JSX de diseño que tenías antes ... */}
      {/* Solo asegúrate de que el <form> use onSubmit={form.handleSubmit(onSubmit)} */}
      <div className="hidden lg:flex flex-col justify-between bg-zinc-900 relative p-12 text-white h-full">
        {/* Imagen de fondo */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60 mix-blend-overlay"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1350&auto=format&fit=crop")' }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-zinc-900/90 via-zinc-900/50 to-zinc-900/30" />

        <div className="relative z-10 flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400"><path d="m19.2 8.2-1.5-2a7 7 0 0 0-11.4 0l-1.5 2a2 2 0 0 0-.6 3.8c.5.3 1.1.4 1.8.3V21h12v-8.7c.7.1 1.3 0 1.8-.3a2 2 0 0 0-.6-3.8Z" /></svg>
          <span className="text-xl font-bold tracking-tight">AMADAMIA SYSTEM</span>
        </div>

        <div className="relative z-10 mb-10">
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Gestiona tu moda,<br /> simplifica tu negocio.
          </h2>
          <p className="text-zinc-300 text-lg max-w-md">
            El control total de tus locales, stock y clientas en un solo lugar.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 h-full">
        <div className="mx-auto w-full max-w-100 space-y-8">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Bienvenida</h1>
            <p className="text-sm text-muted-foreground">Ingresa tus credenciales.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="identifier" // <--- CAMBIO
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuario o Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          placeholder="usuario o nombre@amadamia.com"
                          className="pl-11 h-11 bg-white"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                        <Input type="password" placeholder="••••••" className="pl-11 h-11 bg-white" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-base font-medium" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Ingresar"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}