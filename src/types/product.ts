export interface Product {
  id: number
  name: string
  type: string
  brand: string
  base_price: number | string // La API puede devolver string decimal
  cover_image: string | null
  total_stock: number | string
}

export interface ProductResponse {
  data: Product[]
  // Si agregamos paginación en el futuro, aquí irían total_pages, etc.
}