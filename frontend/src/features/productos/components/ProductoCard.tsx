import { Plus } from 'lucide-react'
import { Button, Card, dinero, FotoProducto } from '../../../shared/ui/primitives'
import { useCartStore } from '../../../store/cartStore'
import type { Producto } from '../types/producto'

export function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((state) => state.agregar)
  const cantidad = useCartStore((state) => state.items.find((item) => item.producto_id === producto.id)?.cantidad ?? 0)
  const disponible = producto.disponible && producto.stock > 0
  const limite = cantidad >= producto.stock
  return <Card className="producto-card">
    <FotoProducto url={producto.imagen_url} nombre={producto.nombre} />
    <div className="producto-info">
      <p className="category">{producto.categoria.nombre}</p>
      <h2>{producto.nombre}</h2>
      {producto.descripcion && <p className="muted">{producto.descripcion}</p>}
      <div className="producto-footer">
        <strong>{dinero(producto.precio_base)}</strong>
        <Button className="small" disabled={!disponible || limite} onClick={() => agregar(producto)}
          aria-label={disponible && !limite ? `Agregar ${producto.nombre} al carrito` : undefined}>
          {disponible && !limite && <Plus size={15} />}
          {!disponible ? 'Agotado' : limite ? 'Stock en carrito' : cantidad ? `Agregar (${cantidad})` : 'Agregar'}
        </Button>
      </div>
    </div>
  </Card>
}
