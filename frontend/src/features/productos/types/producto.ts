import type { Categoria } from '../../categorias/types/categoria'

export interface ProductoInput {
  categoria_id: number
  nombre: string
  descripcion: string | null
  precio_base: number
  imagen_url: string | null
  stock: number
  disponible: boolean
}

export interface Producto extends ProductoInput {
  id: number
  activo: boolean
  categoria: Categoria
}

export interface FiltrosProducto {
  skip: number
  limit: number
  search?: string
  categoria_id?: number
  disponible?: boolean
}
