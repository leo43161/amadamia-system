'use client'

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AuthGuard } from "@/components/auth-guard"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    return (
        <AuthGuard>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
                {/* SIDEBAR PARA DESKTOP (Oculto en móvil md:flex) */}
                {/* fixed hace que se quede quieto, w-64 define el ancho */}
                <aside className="hidden md:flex h-screen w-64 flex-col fixed inset-y-0 z-50">
                    <Sidebar />
                </aside>

                {/* HEADER PARA MÓVIL (Solo visible en móvil md:hidden) */}
                <header className="md:hidden flex items-center h-16 px-4 border-b bg-white sticky top-0 z-40">
                    <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="-ml-2">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Abrir menú</span>
                            </Button>
                        </SheetTrigger>
                        {/* El sidebar dentro de un "Sheet" (cajón lateral) para móvil */}
                        <SheetContent side="left" className="p-0 w-64">
                            <Sidebar />
                        </SheetContent>
                    </Sheet>
                    <span className="ml-4 text-lg font-bold text-violet-700">AMADAMIA</span>
                </header>

                {/* CONTENIDO PRINCIPAL */}
                {/* md:ml-64 empuja el contenido a la derecha en desktop para dejar lugar al sidebar */}
                <main className="md:ml-64 min-h-[calc(100vh-4rem)] md:min-h-screen p-6 sm:p-8 overflow-x-hidden">
                    {/* Aquí se renderizarán tus páginas (page.tsx) */}
                    <div className="mx-auto max-w-6xl h-full">
                        {children}
                    </div>
                </main>
            </div>
        </AuthGuard>
    )
}