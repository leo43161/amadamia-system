'use client'

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Tags, 
  Users, 
  LogOut 
} from "lucide-react"

// Definimos los ítems de navegación
const navItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Ventas", href: "/ventas", icon: ShoppingBag },
  { title: "Productos & Stock", href: "/stock", icon: Tags },
  { title: "Clientas", href: "/clientes", icon: Users },
]

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className={cn("pb-12 min-h-screen bg-white dark:bg-slate-950 border-r", className)}>
      <div className="space-y-4 py-4">
        <div className="px-6 py-2 mb-4 flex items-center">
          {/* Logo simplificado para el sidebar */}
          <span className="text-xl font-bold text-violet-700 tracking-tight">AMADAMIA</span>
        </div>
        
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-slate-500 uppercase">
            Gestión
          </h2>
          <div className="space-y-1">
            <nav className="grid items-start gap-1">
              {navItems.map((item, index) => {
                const isActive = pathname === item.href || pathname.slice(0, -1) === item.href;
                return (
                  <Link
                    key={index}
                    href={item.href}
                  >
                    <span
                      className={cn(
                        "group flex items-center rounded-md px-4 py-2.5 text-sm font-medium hover:bg-violet-50 hover:text-violet-700 transition-colors",
                        isActive ? "bg-violet-100 text-violet-800" : "text-slate-700",
                        "dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-50"
                      )}
                    >
                      <item.icon className={cn("mr-3 h-5 w-5 shrink-0", isActive ? "text-violet-700" : "text-slate-500")} />
                      {item.title}
                    </span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Botón de Salir al final */}
      <div className="absolute bottom-4 w-full px-3">
          <button className="w-full group flex items-center rounded-md px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors" onClick={()=> router.push('/login')}>
             <LogOut className="mr-3 h-5 w-5 shrink-0" />
             Cerrar Sesión
          </button>
      </div>
    </div>
  )
}