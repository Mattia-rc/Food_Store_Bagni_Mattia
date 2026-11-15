import { useForm } from '@tanstack/react-form'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { Button, Campo, Card, dinero, EstadoError, EstadoVacio, FotoProducto, Input } from '../../../shared/ui/primitives'
import { useCartStore } from '../../../store/cartStore'
import { useCrearPedido } from '../hooks/usePedidos'
import type { FormaPago } from '../types/pedido'

function CompraVacia() {
  return <EstadoVacio title="Tu carrito está vacío"><Link className="button" to="/">Explorar el menú</Link></EstadoVacio>
}

export function CarritoPage() {
  const { items, cambiarCantidad, quitar, total } = useCartStore()
  return <div className="page">
    <h1>Tu carrito</h1>
    {items.length === 0 ? <CompraVacia /> : <div className="split">
      <Card className="cart-list">
        {items.map((item) => <article key={item.producto_id} className="cart-item">
          <FotoProducto url={item.imagen_url} nombre={item.nombre} />
          <div><h2>{item.nombre}</h2><p className="muted">{dinero(item.precio_unitario)} c/u</p></div>
          <div className="row qty">
            <Button className="secondary icon" disabled={item.cantidad === 1}
              aria-label={`Quitar una unidad de ${item.nombre}`}
              onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}><Minus size={16} /></Button>
            <span aria-live="polite">{item.cantidad}</span>
            <Button className="secondary icon" aria-label={`Sumar una unidad de ${item.nombre}`}
              onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}><Plus size={16} /></Button>
          </div>
          <strong>{dinero(item.precio_unitario * item.cantidad)}</strong>
          <Button className="secondary icon" aria-label={`Eliminar ${item.nombre}`}
            onClick={() => quitar(item.producto_id)}><Trash2 size={16} /></Button>
        </article>)}
      </Card>
      <Card className="summary stack">
        <h2>Resumen</h2>
        <div className="total-line"><span>Total estimado</span><strong>{dinero(total())}</strong></div>
        <Link className="button" to="/checkout">Continuar al pago</Link>
        <Link className="text-link" to="/">Seguir comprando</Link>
      </Card>
    </div>}
  </div>
}

export function CheckoutPage() {
  const { items, total, vaciar } = useCartStore()
  const crear = useCrearPedido()
  const navigate = useNavigate()
  const form = useForm({
    defaultValues: { direccion_entrega: '', forma_pago: 'EFECTIVO' as FormaPago, notas: '' },
    onSubmit: async ({ value }) => {
      try {
        const pedido = await crear.mutateAsync({
          ...value, direccion_entrega: value.direccion_entrega.trim(), notas: value.notas.trim() || null,
          items: items.map(({ producto_id, cantidad }) => ({ producto_id, cantidad })),
        })
        navigate('/mis-pedidos', { replace: true, state: { pedido: pedido.id } })
        vaciar()
      } catch {
        return
      }
    },
  })
  return <div className="page">
    <h1>Confirmá tu pedido</h1>
    {items.length === 0 ? <CompraVacia /> : <div className="split">
      <Card className="form-card">
        <h2>Entrega y pago</h2>
        <form className="stack" onSubmit={(event) => { event.preventDefault(); void form.handleSubmit() }}>
          <form.Field name="direccion_entrega" validators={{ onSubmit: ({ value }) =>
            value.trim().length >= 5 && value.trim().length <= 200 ? undefined : 'Ingresá entre 5 y 200 caracteres.' }}>
            {(field) => <Campo label="Dirección de entrega" error={field.state.meta.errors[0]}>
              <Input name={field.name} value={field.state.value} autoComplete="street-address"
                onBlur={field.handleBlur} onChange={(event) => field.handleChange(event.target.value)} />
            </Campo>}
          </form.Field>
          <form.Field name="forma_pago">
            {(field) => <Campo label="Forma de pago">
              <select className="input" value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value === 'TRANSFERENCIA' ? 'TRANSFERENCIA' : 'EFECTIVO')}>
                <option value="EFECTIVO">Efectivo</option><option value="TRANSFERENCIA">Transferencia</option>
              </select>
            </Campo>}
          </form.Field>
          <form.Field name="notas">
            {(field) => <Campo label="Notas (opcional)">
              <textarea className="input" rows={3} value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} />
            </Campo>}
          </form.Field>
          <EstadoError error={crear.error} />
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(pending) => <Button type="submit" disabled={pending}>{pending ? 'Confirmando…' : 'Confirmar pedido'}</Button>}
          </form.Subscribe>
        </form>
      </Card>
      <Card className="summary stack">
        <h2>Tu pedido</h2>
        <ul className="line-list">{items.map((item) => <li key={item.producto_id}>
          <span>{item.cantidad} × {item.nombre}</span><strong>{dinero(item.cantidad * item.precio_unitario)}</strong>
        </li>)}</ul>
        <div className="total-line"><span>Total estimado</span><strong>{dinero(total())}</strong></div>
        <Link className="text-link" to="/carrito">Editar carrito</Link>
      </Card>
    </div>}
  </div>
}
