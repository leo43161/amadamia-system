import { ChevronDown, ChevronUp, Pencil, Shirt, Trash2, Plus, Minus, Loader2, Store } from "lucide-react"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner" // Asumo que usas Sonner para notificaciones
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Product } from "@/types/product"
import Link from "next/link"
// Importar tu función de actualizar stock real
import { updateVariantStock } from "@/services/products" 

interface StockControlProps {
    variantId: number
    branchId: number
    initialStock: number
    branchName: string
}

export const StockControl = ({ 
    variantId, 
    branchId, 
    initialStock, 
    branchName 
}: StockControlProps) => {
    const queryClient = useQueryClient()
    
    // Estado local para visualización inmediata (Optimistic UI Local)
    const [localStock, setLocalStock] = useState(initialStock)

    const { mutate, isPending } = useMutation({
        mutationFn: async (newQuantity: number) => {
            // Llamada a la API
            return await updateVariantStock(variantId, branchId, newQuantity)
        },
        onMutate: async (newQuantity) => {
            // 1. Cancelar refetches salientes para que no sobrescriban nuestra actualización optimista
            await queryClient.cancelQueries({ queryKey: ['products'] })

            // 2. Guardar el valor anterior por si hay error
            const previousStock = localStock

            // 3. Actualizar UI inmediatamente (Optimistic Update)
            setLocalStock(newQuantity)

            // Retornamos el contexto para usarlo en onError
            return { previousStock }
        },
        onError: (err, newQuantity, context) => {
            // Si falla, volvemos al valor anterior (Rollback)
            if (context?.previousStock !== undefined) {
                setLocalStock(context.previousStock)
            }
            toast.error("Error al sincronizar stock", {
                description: "Verificá tu conexión e intentá de nuevo."
            })
        },
        onSettled: () => {
            // Siempre (haya error o éxito), revalidamos la lista de productos.
            // ESTO ES CLAVE: Hará que el "Total Stock" de la tarjeta padre se recalcule solo.
            queryClient.invalidateQueries({ queryKey: ['products'] })
        },
    })

    const handleDecrement = () => {
        if (localStock > 0) {
            mutate(localStock - 1)
        }
    }

    const handleIncrement = () => {
        mutate(localStock + 1)
    }

    return (
        <div className="flex flex-col items-center bg-white border border-slate-100 rounded-lg p-2 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <Store className="h-3 w-3 text-slate-400" />
                {branchName}
            </div>
            
            <div className="flex items-center gap-2">
                <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 rounded-full bg-slate-50 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                    onClick={handleDecrement}
                    disabled={isPending || localStock <= 0}
                >
                    <Minus className="h-3.5 w-3.5" />
                </Button>
                
                <div className="w-10 text-center relative">
                    {/* Indicador sutil de carga si la petición está volando, 
                        pero el número ya cambió gracias al Optimistic UI */}
                    {isPending && (
                        <span className="absolute -top-3 right-0 left-0 flex justify-center">
                            <Loader2 className="h-2 w-2 animate-spin text-violet-400" />
                        </span>
                    )}
                    
                    <span className={cn(
                        "text-base font-bold transition-colors", 
                        localStock === 0 ? "text-slate-300" : "text-slate-800"
                    )}>
                        {localStock}
                    </span>
                </div>

                <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 rounded-full bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                    onClick={handleIncrement}
                    disabled={isPending}
                >
                    <Plus className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    )
}

// --- COMPONENTE PRINCIPAL ---

const StockBadge = ({ stock, className }: { stock: number | string, className?: string }) => {
    const s = Number(stock)
    if (s === 0) return <Badge variant="destructive" className={cn("px-2 py-0.5 text-xs font-medium", className)}>Sin Stock</Badge>
    if (s < 5) return <Badge className={cn("bg-amber-500 hover:bg-amber-600 px-2 py-0.5 text-xs font-medium", className)}>Bajo: {s}</Badge>
    return <Badge variant="secondary" className={cn("bg-emerald-100 text-emerald-800 border-emerald-200 px-2 py-0.5 text-xs font-medium", className)}>Total: {s}</Badge>
}

export default function MobileProductCard({
    product,
    onDelete,
    getImageUrl
}: {
    product: Product,
    onDelete: (id: number) => void,
    getImageUrl: (path: string) => string
}) {
    const [showDetails, setShowDetails] = useState(false)
    const hasStock = Number(product.total_stock) > 0
    const variants = product.variants || []
    console.log("Variants:", variants)

    return (
        <Card className="overflow-hidden shadow-sm border-slate-200 rounded-xl transition-all hover:shadow-md p-0">
            <CardContent className="p-0">
                <div className="flex">
                    {/* ... (SECCIÓN IMAGEN E INFO PRINCIPAL - IGUAL QUE ANTES) ... */}
                    {/* IMAGEN */}
                    <div className="relative w-28 h-auto min-h-32 shrink-0 bg-slate-100 border-r border-slate-100">
                        {product.cover_image ? (
                            <img
                                src={getImageUrl(product.cover_image)}
                                alt={product.name}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full text-slate-300">
                                <Shirt className="h-10 w-10" />
                            </div>
                        )}
                        {!hasStock && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center">
                                <Badge variant="secondary" className="bg-slate-900 text-white font-bold shadow-sm scale-90">AGOTADO</Badge>
                            </div>
                        )}
                    </div>

                    {/* INFO PRINCIPAL */}
                    <div className="flex-1 p-3 flex flex-col justify-between gap-1">
                        <div>
                            <div className="flex justify-between items-start gap-1">
                                <h3 className="font-semibold text-slate-900 leading-snug line-clamp-2 text-[15px]">
                                    {product.name}
                                </h3>
                                {/* Botones de acción */}
                                <div className="flex items-center -mt-1 -mr-2 shrink-0">
                                    <Link href={`/stock/edit?id=${product.id}`}>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-violet-600 rounded-full">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 rounded-full" onClick={() => onDelete(product.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal text-slate-500 border-slate-200">
                                    {product.brand}
                                </Badge>
                                <span className="text-xs text-slate-400">{product.type}</span>
                            </div>
                        </div>

                        <div className="flex items-end justify-between mt-2">
                            <span className="font-bold text-lg text-slate-900 leading-none">
                                ${Number(product.base_price).toLocaleString("es-AR")}
                            </span>
                            <StockBadge stock={product.total_stock} className="text-[10px] px-2" />
                        </div>
                    </div>
                </div>

                {/* BOTÓN DESPLEGABLE */}
                {variants.length > 0 && (
                    <>
                        <Separator className="bg-slate-100" />
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full flex items-center justify-between rounded-none h-auto py-2.5 px-4 text-xs font-medium transition-colors",
                                showDetails ? "bg-slate-100 text-violet-700" : "bg-slate-50/50 text-slate-600 hover:bg-slate-100"
                            )}
                            onClick={() => setShowDetails(!showDetails)}
                        >
                            <span>
                                {showDetails ? "Ocultar Stock" : `Gestionar Stock (${variants.length} variantes)`}
                            </span>
                            {showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
                        </Button>
                    </>
                )}

                {/* --- ZONA DE GESTIÓN DE STOCK (DESPLEGADA) --- */}
                {showDetails && (
                    <div className="bg-slate-50/50 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex flex-col divide-y divide-slate-100">
                            {variants.map((variant) => (
                                <div key={variant.id} className="p-3">
                                    {/* Encabezado Variante */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <Badge variant="outline" className="bg-white font-bold text-slate-700 border-slate-200">
                                            {variant.size}
                                        </Badge>
                                        <span className="text-sm text-slate-600 font-medium">{variant.color}</span>
                                        {variant.sku && <span className="text-[10px] text-slate-400 ml-auto font-mono">{variant.sku}</span>}
                                    </div>

                                    {/* Controles de Sucursales (Grid 2 columnas) */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Sucursal 1: Centro (ID hardcodeado o dinámico según tu data) */}
                                        <StockControl 
                                            variantId={variant.id}
                                            branchId={1} // ID 1 = Centro
                                            branchName="Centro"
                                            // Buscamos el stock específico de la sucursal en el detalle
                                            initialStock={variant.stock_detail?.find((s: any) => s.branch_id === 1)?.quantity || 0}
                                        />

                                        {/* Sucursal 2: Yerba Buena */}
                                        <StockControl 
                                            variantId={variant.id}
                                            branchId={2} // ID 2 = YB
                                            branchName="Y. Buena"
                                            initialStock={variant.stock_detail?.find((s: any) => s.branch_id === 2)?.quantity || 0}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}