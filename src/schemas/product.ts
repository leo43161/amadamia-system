import * as z from "zod"

// Esquema para una Variante (Fila de la tabla de combinaciones)
export const variantSchema = z.object({
  size: z.string().min(1, "El talle es obligatorio"), // Creatable: puede ser "M" o "44 Especial"
  color: z.string().min(1, "El color es obligatorio"),
  sku: z.string().optional(),
  stock_centro: z.coerce.number().min(0, "Mínimo 0"), // coerce convierte texto a número
  stock_yb: z.coerce.number().min(0, "Mínimo 0"),
})

// Esquema del Producto Principal
export const productSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 letras"),
  type: z.string().min(1, "Selecciona el tipo de prenda"), // Ej: Pantalón
  brand: z.string().min(1, "La marca es obligatoria"), // Ej: Las Locas
  fabric: z.string().optional(), // Ej: Algodón
  tags: z.string().optional(), // Ej: "verano, oferta"
  description: z.string().optional(),
  base_price: z.coerce.number().min(1, "El precio debe ser mayor a 0"),
  cost_price: z.coerce.number().min(0, "El costo no puede ser negativo").optional(),
  
  // Array de Variantes (Mínimo 1 variante para tener stock)
  variants: z.array(variantSchema).min(1, "Debes cargar al menos una variante de stock"),
})

export type ProductFormValues = z.infer<typeof productSchema>