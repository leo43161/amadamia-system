'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Lock, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"

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

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)
    try {
      // Simulación de API
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log("Datos:", data)
      toast.success("¡Bienvenida, Andrea!", { // Personalizado para la dueña
        description: "Has ingresado al sistema correctamente."
      })
      router.push("/") // Redirige al Dashboard
    } catch (error) {
      toast.error("Error de acceso", { description: "Credenciales inválidas." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen grid lg:grid-cols-2">
      {/* COLUMNA IZQUIERDA: Imagen y Branding (Solo visible en desktop lg:) */}
      <div className="hidden lg:flex flex-col justify-between bg-zinc-900 relative p-12 text-white h-full">
        {/* Imagen de fondo con overlay oscuro para que se lea el texto */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60 mix-blend-overlay"
          // Usamos una imagen de Unsplash de moda como placeholder. 
          // LUEGO LA CAMBIAREMOS POR UNA FOTO REAL DEL LOCAL.
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1350&auto=format&fit=crop")' }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-zinc-900/90 via-zinc-900/50 to-zinc-900/30" />

        {/* Contenido sobre la imagen */}
        <div className="relative z-10 flex items-center space-x-2">
           {/* Icono de "Hanger" (Percha) para dar contexto de ropa */}
           <span className="text-xl font-bold tracking-tight">AMADAMIA</span>
        </div>
        
        <div className="relative z-10 mb-10">
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Gestiona tu moda,<br/> simplifica tu negocio.
          </h2>
          <p className="text-zinc-300 text-lg max-w-md">
            El control total de tus locales, stock y clientas en un solo lugar, diseñado para crecer con vos.
          </p>
        </div>
      </div>

      {/* COLUMNA DERECHA: Formulario */}
      <div className="flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 h-full">
        <div className="mx-auto w-full max-w-100 space-y-8">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Bienvenida de nuevo</h1>
            <p className="text-sm text-muted-foreground">
              Ingresa tus credenciales para acceder al panel.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Inputs con un diseño un poco más grande (h-11) */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="nombre@amadamia.com" className="pl-11 h-11 bg-white" {...field} />
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
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Ingresar al Sistema"}
              </Button>
            </form>
          </Form>
          
          <p className="px-8 text-center text-sm text-muted-foreground">
            <Link href="/forgot-password" className="hover:text-violet-600 underline underline-offset-4">
              ¿Olvidaste tu contraseña?
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}