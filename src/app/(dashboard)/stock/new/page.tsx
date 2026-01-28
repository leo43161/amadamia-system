'use client'

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Trash2, Upload, X, Save, ArrowLeft } from "lucide-react"
import api from "@/lib/axios"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { productSchema, type ProductFormValues } from "@/schemas/product"

export default function NewProductPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  // 1. Configuración del Formulario
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema as any),
    defaultValues: {
      name: "",
      type: "",
      brand: "",
      fabric: "",
      tags: "",
      description: "",
      base_price: 0,
      cost_price: 0,
      // Iniciamos con una fila de variante vacía
      variants: [{ size: "", color: "", stock_centro: 0, stock_yb: 0 }] 
    },
  })

  // Hook para manejar el array dinámico de variantes
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  })

  // 2. Manejador de Imágenes (Preview y Selección)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      // Limitamos a 4 imágenes máximo
      const combinedFiles = [...selectedImages, ...filesArray].slice(0, 4)
      
      setSelectedImages(combinedFiles)

      // Generar URLs para previsualizar
      const previews = combinedFiles.map(file => URL.createObjectURL(file))
      setImagePreviews(previews)
    }
  }

  const removeImage = (index: number) => {
    const newFiles = selectedImages.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setSelectedImages(newFiles)
    setImagePreviews(newPreviews)
  }

  // 3. Envío del Formulario
  async function onSubmit(data: ProductFormValues) {
    if (selectedImages.length === 0) {
      toast.error("Faltan imágenes", { description: "Debes subir al menos una foto del producto." })
      return
    }

    setIsSubmitting(true)
    try {
      // Creamos el FormData para enviar Archivos + Datos
      const formData = new FormData()

      // Datos simples
      formData.append("name", data.name)
      formData.append("type", data.type)
      formData.append("brand", data.brand)
      formData.append("fabric", data.fabric || "")
      formData.append("tags", data.tags || "")
      formData.append("description", data.description || "")
      formData.append("base_price", data.base_price.toString())
      formData.append("cost_price", data.cost_price?.toString() || "0")

      // Imágenes
      selectedImages.forEach((file) => {
        formData.append("images[]", file) // Importante los corchetes [] para PHP
      })

      // Variantes (Lo enviamos como JSON String porque FormData no maneja arrays de objetos bien)
      formData.append("variants", JSON.stringify(data.variants))

      // Enviar a la API
      await api.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      toast.success("Producto creado", { description: "Ya está disponible para la venta." })
      router.push("/stock") // Volver al listado

    } catch (error: any) {
      console.error(error)
      toast.error("Error al guardar", { description: error.response?.data?.message || "Ocurrió un error." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/stock"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Nuevo Producto</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="grid gap-6 md:grid-cols-2">
            {/* COLUMNA IZQUIERDA: Datos Generales */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información Básica</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Producto</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Jean Mom Fit Rígido" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Pantalón">Pantalón</SelectItem>
                              <SelectItem value="Remera">Remera</SelectItem>
                              <SelectItem value="Vestido">Vestido</SelectItem>
                              <SelectItem value="Abrigo">Abrigo</SelectItem>
                              <SelectItem value="Accesorio">Accesorio</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Marca</FormLabel>
                          {/* Aquí podrías usar un Combobox para sugerir marcas previas */}
                          <FormControl>
                            <Input placeholder="Ej: Las Locas" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fabric"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tela</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Algodón / Jean" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Etiquetas (Tags)</FormLabel>
                          <FormControl>
                            <Input placeholder="verano, nuevo, oferta..." {...field} />
                          </FormControl>
                          <FormDescription className="text-xs">Separadas por coma</FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Detalles de calce, cuidados..." className="resize-none" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Precios</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="base_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio Venta ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cost_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio Costo ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormDescription>Solo visible por la dueña</FormDescription>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* COLUMNA DERECHA: Variantes y Fotos */}
            <div className="space-y-6">
               <Card>
                <CardHeader>
                  <CardTitle>Imágenes (Max 4)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {imagePreviews.map((src, index) => (
                      <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                        <img src={src} alt="Preview" className="object-cover w-full h-full" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white p-1 rounded-full transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-0 w-full bg-black/60 text-white text-xs text-center py-1">
                            Portada
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {selectedImages.length < 4 && (
                      <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-md aspect-square cursor-pointer hover:bg-slate-50 transition-colors">
                        <Upload className="h-8 w-8 text-slate-400 mb-2" />
                        <span className="text-xs text-slate-500">Subir Foto</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleImageChange}
                        />
                      </label>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Variantes y Stock</CardTitle>
                  <FormDescription>Define los talles, colores y cantidad por local.</FormDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="relative grid grid-cols-12 gap-2 items-end border-b pb-4 mb-4 last:border-0 last:mb-0">
                      
                      {/* Talle (Creatable Manual: Es un Input texto simple que permite poner lo que quieras) */}
                      <div className="col-span-3">
                        <FormField
                          control={form.control}
                          name={`variants.${index}.size`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Talle</FormLabel>
                              <FormControl>
                                <Input placeholder="S, 38..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Color */}
                      <div className="col-span-3">
                        <FormField
                          control={form.control}
                          name={`variants.${index}.color`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Color</FormLabel>
                              <FormControl>
                                <Input placeholder="Rojo..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Stock Centro */}
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name={`variants.${index}.stock_centro`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs truncate">Stk. Centro</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} className="text-center" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                       {/* Stock YB */}
                       <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name={`variants.${index}.stock_yb`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs truncate">Stk. YB</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} className="text-center" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-2 flex justify-end pb-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1} // No borrar si es la única
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
                    className="w-full border-dashed"
                    onClick={() => append({ size: "", color: "", stock_centro: 0, stock_yb: 0 })}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Agregar otra variante
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end pt-4">
             <Button type="submit" size="lg" className="bg-violet-600 hover:bg-violet-700" disabled={isSubmitting}>
              {isSubmitting ? (
                <>Guardando...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" /> Guardar Producto</>
              )}
             </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}