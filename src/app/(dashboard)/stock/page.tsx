'use client'

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Package, Pencil, Plus, Search, Shirt, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import MobileProductCard from "@/components/dashboard/MobileProductCard"
import { cn } from "@/lib/utils"
import { deleteProduct, getProducts } from "@/services/products"

// --- HELPERS ---
const getImageUrl = (path: string | null) => {
    if (!path) return ""
    if (path.startsWith("http")) return path
    return  process.env.URL_SERVER + `/api/public${path}`
}

// Componente de Badge de Stock (Reutilizable)
const StockBadge = ({ stock, className }: { stock: number | string, className?: string }) => {
    const s = Number(stock)
    if (s === 0) return <Badge variant="destructive" className={cn("px-2 py-0.5 text-xs font-medium", className)}>Sin Stock</Badge>
    if (s < 5) return <Badge className={cn("bg-amber-500 hover:bg-amber-600 px-2 py-0.5 text-xs font-medium", className)}>Bajo: {s}</Badge>
    return <Badge variant="secondary" className={cn("bg-emerald-100 text-emerald-800 border-emerald-200 px-2 py-0.5 text-xs font-medium", className)}>Stock: {s}</Badge>
}

// --- PÁGINA PRINCIPAL ---
export default function StockPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const queryClient = useQueryClient()

    const { data: products, isLoading } = useQuery({
        queryKey: ["products", searchTerm],
        queryFn: () => getProducts(1, searchTerm),
        staleTime: 1000 * 60 * 5,
    })

    const deleteMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            toast.success("Producto eliminado")
            queryClient.invalidateQueries({ queryKey: ["products"] })
        },
        onError: () => {
            toast.error("Error", { description: "No se pudo borrar el producto." })
        }
    })

    const handleDelete = (id: number) => {
        // Usamos un confirm nativo por rapidez, luego podemos usar un Dialog de Shadcn
        if (window.confirm("¿Estás segura de borrar este producto? Se borrará todo su stock.")) {
            deleteMutation.mutate(id)
        }
    }

    return (
        <div className="space-y-4 pb-24">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inventario</h1>
                    <p className="text-sm text-slate-500">Gestiona tus prendas y disponibilidad.</p>
                </div>

                <Button asChild className="hidden sm:flex bg-violet-600 hover:bg-violet-700 shadow-sm">
                    <Link href="/stock/new">
                        <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
                    </Link>
                </Button>
            </div>

            {/* BUSCADOR */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Buscar jean, remera, marca..."
                    className="pl-9 bg-white h-12 text-base shadow-sm rounded-xl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* --- VISTA MÓVIL (Cards V2) --- */}
            <div className="grid grid-cols-1 gap-4 md:hidden mt-4">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex gap-3 p-3 bg-white rounded-xl border shadow-sm">
                            <Skeleton className="h-24 w-24 rounded-lg shrink-0" />
                            <div className="flex-1 space-y-2 py-1">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <div className="flex justify-between pt-2">
                                    <Skeleton className="h-6 w-20" />
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                </div>
                            </div>
                        </div>
                    ))
                ) : products?.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed">
                        <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p className="font-medium">No se encontraron productos.</p>
                        <p className="text-sm mt-1">Prueba con otra búsqueda o agrega uno nuevo.</p>
                    </div>
                ) : (
                    // Usamos el nuevo componente de tarjeta
                    products?.map((product) => (
                        <MobileProductCard
                            key={product.id}
                            product={product}
                            onDelete={handleDelete}
                            getImageUrl={getImageUrl}
                        />
                    ))
                )}
            </div>

            {/* --- VISTA ESCRITORIO (Tabla limpia) --- */}
            <div className="hidden md:block rounded-lg border bg-white shadow-sm overflow-hidden">
                {/* ... (La tabla de escritorio queda igual que antes, la omito para ahorrar espacio, si la necesitas la pego) ... */}
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50">
                            <TableHead>Producto</TableHead>
                            <TableHead>Marca / Tipo</TableHead>
                            <TableHead>Precio</TableHead>
                            <TableHead className="text-center">Stock Total</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products?.map((product) => (
                            <TableRow key={product.id} className="hover:bg-slate-50/50">
                                <TableCell className="flex items-center gap-3 py-3">
                                    <div className="h-12 w-12 rounded-md bg-slate-100 overflow-hidden border shrink-0">
                                        {product.cover_image ? (
                                            <img src={getImageUrl(product.cover_image)} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-slate-300"><Shirt className="h-6 w-6" /></div>
                                        )}
                                    </div>
                                    <span className="font-medium text-slate-900">{product.name}</span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">{product.brand}</span>
                                        <span className="text-xs text-slate-500">{product.type}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">${Number(product.base_price).toLocaleString("es-AR")}</TableCell>
                                <TableCell className="text-center"><StockBadge stock={product.total_stock} /></TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        {/* Botones de escritorio */}
                                        <Link href={`/stock/edit?id=${product.id}`}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-violet-600 hover:bg-violet-50">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(product.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* FAB MÓVIL */}
            <Link href="/stock/new" className="md:hidden fixed bottom-6 right-6 z-50">
                <Button size="icon" className="h-14 w-14 rounded-full bg-violet-600 hover:bg-violet-700 shadow-xl shadow-violet-600/20 transition-transform active:scale-95">
                    <Plus className="h-6 w-6 text-white" />
                </Button>
            </Link>
        </div>
    )
}
