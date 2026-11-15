import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Producto } from '../features/productos/types/producto'

export interface CartItem {
  producto_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
  imagen_url: string | null
}

interface CartState {
  items: CartItem[]
  agregar: (producto: Producto) => void
  quitar: (id: number) => void
  cambiarCantidad: (id: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
}

export const useCartStore = create<CartState>()(persist((set, get) => ({
  items: [],
  agregar: (producto) => set(({ items }) => {
    const actual = items.find((item) => item.producto_id === producto.id)
    if (!producto.disponible || (actual?.cantidad ?? 0) >= producto.stock) return { items }
    const nuevo: CartItem = {
      producto_id: producto.id, nombre: producto.nombre, precio_unitario: producto.precio_base,
      imagen_url: producto.imagen_url, cantidad: (actual?.cantidad ?? 0) + 1,
    }
    return { items: actual ? items.map((item) => item.producto_id === producto.id ? nuevo : item) : [...items, nuevo] }
  }),
  quitar: (id) => set(({ items }) => ({ items: items.filter((item) => item.producto_id !== id) })),
  cambiarCantidad: (id, cantidad) => {
    if (!Number.isSafeInteger(cantidad) || cantidad < 1) return
    set(({ items }) => ({
      items: items.map((item) => item.producto_id === id ? { ...item, cantidad } : item),
    }))
  },
  vaciar: () => set({ items: [] }),
  total: () => get().items.reduce((total, item) => total + item.cantidad * item.precio_unitario, 0),
}), {
  name: 'food-store-cart',
  partialize: (state) => ({ items: state.items }),
}))
