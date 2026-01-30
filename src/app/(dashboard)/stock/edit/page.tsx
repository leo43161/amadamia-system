'use client'

import { useState, useEffect, Suspense } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useSearchParams } from "next/navigation" // <--- CAMBIO IMPORTANTE
import { toast } from "sonner"
import { Plus, Trash2, Upload, X, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { productSchema, type ProductFormValues } from "@/schemas/product"
import { getProduct, updateProduct } from "@/services/products"

// Helper para url de imagenes
const getImageUrl = (path: string | null) => {
    if (!path) return ""
    if (path.startsWith("http")) return path
    return process.env.URL_SERVER + `/api/public${path}`
}

// Componente interno para manejar la lógica de búsqueda
export default function EditProductContent() {
    const searchParams = useSearchParams()
    // Leemos el ID de la URL (?id=5)
    const productId = Number(searchParams.get("id"))

    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [existingImages, setExistingImages] = useState<{ id: number, image_url: string }[]>([])
    const [deletedImageIds, setDeletedImageIds] = useState<number[]>([])
    const [newImages, setNewImages] = useState<File[]>([])
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
    const [deletedVariantIds, setDeletedVariantIds] = useState<number[]>([])

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            name: "", type: "", brand: "", fabric: "", tags: "", description: "",
            base_price: 0, cost_price: 0, variants: []
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "variants",
    })

    useEffect(() => {
        // Si no hay ID en la URL, volvemos al stock
        if (!productId) {
            toast.error("Producto no especificado")
            router.push("/stock")
            return
        }

        async function loadData() {
            try {
                const product = await getProduct(productId)
                form.reset({
                    name: product.name,
                    type: product.type,
                    brand: product.brand,
                    fabric: product.fabric || "",
                    tags: product.tags || "",
                    description: product.description || "",
                    base_price: Number(product.base_price),
                    cost_price: Number(product.cost_price),
                    // Mapeamos variantes para incluir ID y Stock actual
                    variants: product.variants.map((v: any) => ({
                        id: v.id, // Importante para editar y no crear duplicados
                        size: v.size,
                        color: v.color,
                        sku: v.sku,
                        // Buscamos el stock en el detalle (si la API lo devuelve detallado)
                        // Si la API de getOne devuelve stock_detail, úsalo. Si no, asumimos 0 por ahora para edición.
                        // *Nota: Para que esto sea perfecto, el modelo getOne debe devolver el detalle por sucursal.*
                        stock_centro: v.stock_detail?.find((s: any) => s.branch_id === 1)?.quantity || 0,
                        stock_yb: v.stock_detail?.find((s: any) => s.branch_id === 2)?.quantity || 0,
                    }))
                })
                /* DEBUG LOG: "[
    {
        "id": "4",
        "size": "S",
        "color": "Blanco",
        "sku": "REM-BAS-S-BL",
        "total_stock": "10",
        "stock_detail": [
            {
                "branch_id": 1,
                "quantity": 10
            }
        ]
    },
    {
        "id": "5",
        "size": "M",
        "color": "Blanco",
        "sku": "REM-BAS-M-BL",
        "total_stock": "8",
        "stock_detail": [
            {
                "branch_id": 2,
                "quantity": 8
            }
        ]
    },
    {
        "id": "6",
        "size": "M",
        "color": "Negro",
        "sku": "REM-BAS-M-NG",
        "total_stock": "0",
        "stock_detail": []
    }
]" */
                console.log("Producto cargado para edición:", product)
                setExistingImages(product.images || [])
            } catch (error) {
                toast.error("Error al cargar producto")
                router.push("/stock")
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [productId, form, router])

    // 2. LOGICA DE IMAGENES
    const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files)
            // Limite total (Existentes + Nuevas) < 4
            if (existingImages.length + newImages.length + filesArray.length > 4) {
                toast.warning("Máximo 4 imágenes permitidas")
                return
            }
            setNewImages([...newImages, ...filesArray])
            const previews = filesArray.map(file => URL.createObjectURL(file))
            setNewImagePreviews([...newImagePreviews, ...previews])
        }
    }

    const removeExistingImage = (id: number) => {
        setDeletedImageIds([...deletedImageIds, id])
        setExistingImages(existingImages.filter(img => img.id !== id))
    }

    const removeNewImage = (index: number) => {
        setNewImages(newImages.filter((_, i) => i !== index))
        setNewImagePreviews(newImagePreviews.filter((_, i) => i !== index))
    }

    const handleRemoveVariant = (index: number) => {
        const variant = fields[index] as any
        // Si la variante ya existía en DB (tiene ID), la marcamos para borrar
        if (variant.id) {
            setDeletedVariantIds([...deletedVariantIds, variant.id])
        }
        remove(index)
    }

    // 3. ENVIAR FORMULARIO
    async function onSubmit(data: ProductFormValues) {
        setIsSubmitting(true)
        console.log("Enviando actualización de producto...")
        /* DEBUG LOG: [
    {
        "size": "S",
        "color": "Blanco",
        "sku": "REM-BAS-S-BL",
        "stock_centro": 10,
        "stock_yb": 0
    },
    {
        "size": "M",
        "color": "Blanco",
        "sku": "REM-BAS-M-BL",
        "stock_centro": 0,
        "stock_yb": 8
    },
    {
        "size": "M",
        "color": "Negro",
        "sku": "REM-BAS-M-NG",
        "stock_centro": 0,
        "stock_yb": 0
    }
] */
        console.log("Data variants:");
        console.log(data.variants);
        try {
            const formData = new FormData()

            // Datos Base
            formData.append("name", data.name)
            formData.append("type", data.type)
            formData.append("brand", data.brand)
            formData.append("fabric", data.fabric || "")
            formData.append("tags", data.tags || "")
            formData.append("description", data.description || "")
            formData.append("base_price", data.base_price.toString())
            formData.append("cost_price", data.cost_price?.toString() || "0")

            // Imágenes Nuevas
            newImages.forEach((file) => {
                formData.append("new_images[]", file)
            })

            // IDs de Imágenes Borradas
            formData.append("deleted_images", JSON.stringify(deletedImageIds))

            // Variantes (Incluye nuevas y editadas)
            formData.append("variants", JSON.stringify(data.variants))

            // IDs de Variantes Borradas
            formData.append("deleted_variants", JSON.stringify(deletedVariantIds))
            // DEBUG LOG: "[{\"size\":\"S\",\"color\":\"Blanco\",\"sku\":\"REM-BAS-S-BL\",\"stock_centro\":10,\"stock_yb\":0},{\"size\":\"M\",\"color\":\"Blanco\",\"sku\":\"REM-BAS-M-BL\",\"stock_centro\":0,\"stock_yb\":8},{\"size\":\"M\",\"color\":\"Negro\",\"sku\":\"REM-BAS-M-NG\",\"stock_centro\":0,\"stock_yb\":0}]"
            console.log("formData to send:")
            console.log(formData.getAll("variants"))
            await updateProduct(productId, formData)

            toast.success("Producto actualizado")
            router.push("/stock")

        } catch (error: any) {
            console.error(error)
            toast.error("Error al actualizar", { description: error.response?.data?.message })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) return <div className="flex h-screen justify-center items-center"><Loader2 className="animate-spin" /></div>

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/stock"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Editar Producto</h1>
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit, (errors) => {
                        console.log("🛑 ERRORES DE VALIDACIÓN:", errors)
                        toast.error("Faltan completar datos", { description: "Revisá la consola (F12) para ver qué falta." })
                    })}
                    className="space-y-8"
                >

                    <div className="grid gap-6 md:grid-cols-2">

                        {/* --- COLUMNA 1: INFO GENERAL --- */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader><CardTitle>Información</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField control={form.control} name="name" render={({ field }) => (
                                        <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    {/* ... (Resto de inputs iguales a Create, podés copiar y pegar del otro archivo: Type, Brand, Fabric, Tags, Price) ... */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name="type" render={({ field }) => (
                                            <FormItem><FormLabel>Tipo</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                        )} />
                                        <FormField control={form.control} name="brand" render={({ field }) => (
                                            <FormItem><FormLabel>Marca</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                        )} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name="base_price" render={({ field }) => (
                                            <FormItem><FormLabel>Precio Venta</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                                        )} />
                                        <FormField control={form.control} name="cost_price" render={({ field }) => (
                                            <FormItem><FormLabel>Costo</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                                        )} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* --- COLUMNA 2: IMAGENES Y VARIANTES --- */}
                        <div className="space-y-6">
                            {/* IMAGENES */}
                            <Card>
                                <CardHeader><CardTitle>Imágenes</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-2">
                                        {/* Existentes */}
                                        {existingImages.map((img) => (
                                            <div key={img.id} className="relative aspect-square border rounded overflow-hidden group">
                                                <img src={getImageUrl(img.image_url)} className="w-full h-full object-cover" />
                                                <button type="button" onClick={() => removeExistingImage(img.id)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                        {/* Nuevas */}
                                        {newImagePreviews.map((src, idx) => (
                                            <div key={idx} className="relative aspect-square border rounded overflow-hidden">
                                                <img src={src} className="w-full h-full object-cover opacity-80" />
                                                <div className="absolute inset-0 flex items-center justify-center"><span className="text-xs bg-black/50 text-white px-1 rounded">NUEVA</span></div>
                                                <button type="button" onClick={() => removeNewImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                        {/* Botón Subir */}
                                        {(existingImages.length + newImages.length) < 4 && (
                                            <label className="flex flex-col items-center justify-center border-2 border-dashed rounded aspect-square cursor-pointer hover:bg-slate-50">
                                                <Upload className="h-6 w-6 text-slate-400" />
                                                <input type="file" accept="image/*" className="hidden" onChange={handleNewImageChange} />
                                            </label>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* VARIANTES */}
                            <Card>
                                <CardHeader><CardTitle>Variantes y Stock</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Encabezados de la tabla (Opcional, para que quede más prolijo) */}
                                    <div className="grid grid-cols-12 gap-2 text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-2 px-1">
                                        <div className="col-span-2">Talle</div>
                                        <div className="col-span-2">Color</div>
                                        <div className="col-span-3">SKU / Código</div>
                                        <div className="col-span-2 text-center">Centro</div>
                                        <div className="col-span-2 text-center">YB</div>
                                        <div className="col-span-1"></div>
                                    </div>

                                    {fields.map((field, index) => (
                                        <div key={field.id} className="relative grid grid-cols-12 gap-2 items-start border-b pb-4 mb-4 last:border-0">

                                            {/* 1. Talle (2 col) */}
                                            <div className="col-span-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`variants.${index}.size`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input placeholder="S" className="h-9 text-xs" {...field} />
                                                            </FormControl>
                                                            <FormMessage className="text-[10px]" />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            {/* 2. Color (2 col) */}
                                            <div className="col-span-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`variants.${index}.color`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input placeholder="Rojo" className="h-9 text-xs" {...field} />
                                                            </FormControl>
                                                            <FormMessage className="text-[10px]" />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            {/* 3. SKU (3 col) - ¡NUEVO! */}
                                            <div className="col-span-3">
                                                <FormField
                                                    control={form.control}
                                                    name={`variants.${index}.sku`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Auto..."
                                                                    className="h-9 text-xs font-mono uppercase placeholder:text-slate-300"
                                                                    {...field}
                                                                    value={field.value ?? ""}
                                                                />
                                                            </FormControl>
                                                            <FormMessage className="text-[10px]" />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            {/* 4. Stock Centro (2 col) */}
                                            <div className="col-span-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`variants.${index}.stock_centro`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input type="number" className="h-9 text-xs text-center" {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            {/* 5. Stock YB (2 col) */}
                                            <div className="col-span-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`variants.${index}.stock_yb`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input type="number" className="h-9 text-xs text-center" {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            {/* 6. Botón Borrar (1 col) */}
                                            <div className="col-span-1 flex justify-end">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                                    onClick={() => handleRemoveVariant(index)} // Ojo: en "new" se llama remove(index) directo
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="w-full border-dashed text-slate-500 hover:text-violet-600 hover:border-violet-200 hover:bg-violet-50"
                                        onClick={() => append({ size: "", color: "", sku: "", stock_centro: 0, stock_yb: 0 })}
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Agregar otra variante
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 pb-10">
                        <Button type="submit" size="lg" className="bg-violet-600 w-full md:w-auto" disabled={isSubmitting}>
                            {isSubmitting ? "Guardando..." : "Actualizar Producto"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}