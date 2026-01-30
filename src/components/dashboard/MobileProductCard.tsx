import { ChevronDown, ChevronUp, Pencil, Shirt, Trash2 } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import { cn } from "@/lib/utils"
import { Product } from "@/types/product"
import Link from "next/link"

const StockBadge = ({ stock, className }: { stock: number | string, className?: string }) => {
    const s = Number(stock)
    if (s === 0) return <Badge variant="destructive" className={cn("px-2 py-0.5 text-xs font-medium", className)}>Sin Stock</Badge>
    if (s < 5) return <Badge className={cn("bg-amber-500 hover:bg-amber-600 px-2 py-0.5 text-xs font-medium", className)}>Bajo: {s}</Badge>
    return <Badge variant="secondary" className={cn("bg-emerald-100 text-emerald-800 border-emerald-200 px-2 py-0.5 text-xs font-medium", className)}>Stock: {s}</Badge>
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
    const variants = product.variants || [] // Aseguramos que sea array

    // Lógica: ¿Es variante única?
    const isSingleVariant = variants.length === 1
    const singleVariant = isSingleVariant ? variants[0] : null
console.log('Rendering MobileProductCard for product:', product);
    return (
        <Card className="overflow-hidden shadow-sm border-slate-200 rounded-xl transition-all hover:shadow-md p-0">
            <CardContent className="p-0">
                <div className="flex">
                    {/* IMAGEN */}
                    <div className="relative w-30 h-auto min-h-35 shrink-0 bg-slate-100 border-r border-slate-100">
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
                    <div className="flex-1 p-3 flex flex-col justify-between gap-2">
                        <div>
                            <div className="flex justify-between items-start gap-2">
                                <h3 className="font-semibold text-slate-900 leading-snug line-clamp-2 text-[15px]">
                                    {product.name}
                                </h3>

                                {/* Botones de acción mini */}
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

                        {/* PRECIO + INDICADOR STOCK */}
                        <div className="flex items-end justify-between mt-1">
                            <span className="font-bold text-lg text-slate-900 leading-none">
                                ${Number(product.base_price).toLocaleString("es-AR")}
                            </span>

                            {/* Si es VARIANTE ÚNICA, mostramos el detalle aquí mismo y ahorramos el click */}
                            {isSingleVariant && singleVariant ? (
                                <div className="text-right">
                                    <div className="text-[10px] uppercase text-slate-500 font-semibold mb-0.5">
                                        {singleVariant.size} • {singleVariant.color}
                                    </div>
                                    <StockBadge stock={singleVariant.stock} className="text-[10px] px-2" />
                                </div>
                            ) : (
                                // Si son muchas, mostramos el total global
                                <StockBadge stock={product.total_stock} className="text-[10px] px-2" />
                            )}
                        </div>
                    </div>
                </div>

                {/* SECCIÓN DESPLEGABLE (Solo si hay múltiples variantes y hay stock) */}
                {hasStock && !isSingleVariant && variants.length > 0 && (
                    <>
                        <Separator className="bg-slate-100" />
                        <Button
                            variant="ghost"
                            className="w-full flex items-center justify-between rounded-none h-auto py-2 px-4 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-violet-700 bg-slate-50/30"
                            onClick={() => setShowDetails(!showDetails)}
                        >
                            <span>Ver {variants.length} variantes disponibles</span>
                            {showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
                        </Button>
                    </>
                )}

                {/* CONTENIDO DEL DESPLEGABLE (LISTA REAL) */}
                {showDetails && !isSingleVariant && (
                    <div className="bg-slate-50 border-t border-slate-100 animate-in slide-in-from-top-1 duration-200">
                        <div className="grid grid-cols-12 gap-y-0 text-xs text-slate-500 font-medium px-4 py-2 border-b border-slate-200/50">
                            <div className="col-span-3">Talle</div>
                            <div className="col-span-5">Color</div>
                            <div className="col-span-4 text-right">Stock</div>
                        </div>
                        {variants.map((variant, idx) => (
                            <div key={variant.id} className={cn(
                                "grid grid-cols-12 gap-y-0 px-4 py-2.5 text-sm items-center",
                                idx !== variants.length - 1 && "border-b border-slate-100"
                            )}>
                                <div className="col-span-3 font-bold text-slate-700">
                                    {variant.size}
                                </div>
                                <div className="col-span-5 text-slate-600 truncate pr-2">
                                    {variant.color}
                                </div>
                                <div className="col-span-4 text-right">
                                    {Number(variant.stock) > 0 ? (
                                        <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full text-[11px]">
                                            {variant.stock} u.
                                        </span>
                                    ) : (
                                        <span className="text-red-400 font-medium text-[11px]">Agotado</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
