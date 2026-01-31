import api from "@/lib/axios"
import type { Product } from "@/types/product"

export const getProducts = async (page = 1, search = "") => {
  // Enviamos los parámetros de búsqueda y paginación
  const { data } = await api.get<Product[]>("/products", {
    params: { page, limit: 50, search }
  })
  return data
}

export const getProduct = async (id: number) => {
  const { data } = await api.get<Product>(`/products/${id}`)
  return data
}

// Actualizar (Usamos FormData)
export const updateProduct = async (id: number, formData: FormData) => {
  const { data } = await api.post(`/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
  })
  return data
}

export const deleteProduct = async (id: number) => {
  const { data } = await api.delete(`/products/${id}`)
  return data
}

// Obtener Tipos de Productos
export async function getProductTypes(): Promise<string[]> {
    const { data } = await api.get('/product-types')
    return data
}

export const updateVariantStock = async (variantId: number, branchId: number, quantity: number) => {
    // Usamos PATCH porque estamos modificando una parte del recurso
    // Endpoint sugerido: /api/variants/{id}/stock
    const { data } = await api.post(`/variants/${variantId}/stock`, {
        branch_id: branchId,
        quantity: quantity
    })
    
    return data
}