export interface Variant {
  id: number
  size: string
  color: string
  stock: number | string
  sku?: string | null | undefined
}

export interface Product {
  id: number
  name: string
  type: string
  brand: string
  base_price: number | string
  cover_image: string | null
  total_stock: number | string
  variants: Variant[]
  fabric: string | null
  description: string | null
  tags: string
  cost_price: string
  images: { image_url: string, id: number }[]
}

export interface ProductResponse {
  data: Product[]
  // Si agregamos paginación en el futuro, aquí irían total_pages, etc.
}