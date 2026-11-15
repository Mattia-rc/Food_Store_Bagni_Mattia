import { useForm } from '@tanstack/react-form'
import { Button, Campo, EstadoError, Input, Modal } from '../../../shared/ui/primitives'
import type { Categoria } from '../../categorias/types/categoria'
import { useGuardarProducto, useGuardarStock } from '../hooks/useProductos'
import type { Producto } from '../types/producto'

const validarStock = (value: string) =>
  value.trim() !== '' && Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) <= 2147483647
    ? undefined : 'Ingresá un número entero entre 0 y 2147483647.'

export function ProductoForm({ producto, categorias, onClose }: {
  producto?: Producto; categorias: Categoria[]; onClose: () => void;
}) {
  const guardar = useGuardarProducto(producto)
  const form = useForm({
    defaultValues: {
      categoria: producto ? String(producto.categoria_id) : '',
      nombre: producto?.nombre ?? '', descripcion: producto?.descripcion ?? '',
      precio: producto ? String(producto.precio_base) : '',
      stock: '0', disponible: true, imagen: producto?.imagen_url ?? '',
    },
    onSubmit: async ({ value }) => {
      try {
        await guardar.mutateAsync({
          categoria_id: Number(value.categoria), nombre: value.nombre.trim(),
          descripcion: value.descripcion.trim() || null, precio_base: Number(value.precio),
          imagen_url: value.imagen.trim() || null, stock: Number(value.stock), disponible: value.disponible,
        })
        onClose()
      } catch {
        return
      }
    },
  })
  const categoriaInactiva = producto && !categorias.some((categoria) => categoria.id === producto.categoria_id)

  return <Modal title={producto ? 'Editar producto' : 'Nuevo producto'} onClose={onClose}>
    <form noValidate className="stack" onSubmit={(event) => { event.preventDefault(); void form.handleSubmit() }}>
      <form.Field name="nombre" validators={{ onSubmit: ({ value }) => value.trim() ? undefined : 'Ingresá un nombre.' }}>
        {(field) => <Campo label="Nombre" error={field.state.meta.errors[0]}>
          <Input value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} />
        </Campo>}
      </form.Field>
      <div className="form-grid">
        <form.Field name="categoria" validators={{ onSubmit: ({ value }) => value ? undefined : 'Elegí una categoría.' }}>
          {(field) => <Campo label="Categoría" error={field.state.meta.errors[0]}>
            <select className="input" value={field.state.value} onChange={(event) => field.handleChange(event.target.value)}>
              <option value="">Elegí una categoría</option>
              {categoriaInactiva && <option value={producto.categoria_id}>{producto.categoria.nombre} (inactiva)</option>}
              {categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>)}
            </select>
          </Campo>}
        </form.Field>
        <form.Field name="precio" validators={{ onSubmit: ({ value }) =>
          value.trim() && Number.isFinite(Number(value)) && Number(value) >= 0 ? undefined : 'Ingresá un precio mayor o igual a 0.' }}>
          {(field) => <Campo label="Precio base" error={field.state.meta.errors[0]}>
            <Input type="number" min={0} step="any" value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} />
          </Campo>}
        </form.Field>
      </div>
      <form.Field name="descripcion">
        {(field) => <Campo label="Descripción"><textarea rows={2} className="input" value={field.state.value}
          onChange={(event) => field.handleChange(event.target.value)} /></Campo>}
      </form.Field>
      <form.Field name="imagen">
        {(field) => <Campo label="URL de la imagen"><Input value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} /></Campo>}
      </form.Field>
      {!producto && <div className="form-grid">
        <form.Field name="stock" validators={{ onSubmit: ({ value }) => validarStock(value) }}>
          {(field) => <Campo label="Stock inicial" error={field.state.meta.errors[0]}>
            <Input type="number" min={0} value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} />
          </Campo>}
        </form.Field>
        <form.Field name="disponible">
          {(field) => <label className="check"><input type="checkbox" checked={field.state.value}
            onChange={(event) => field.handleChange(event.target.checked)} /> Disponible</label>}
        </form.Field>
      </div>}
      <EstadoError error={guardar.error} />
      <Button type="submit" disabled={guardar.isPending}>Guardar producto</Button>
    </form>
  </Modal>
}

export function StockForm({ producto, onClose }: { producto: Producto; onClose: () => void }) {
  const guardar = useGuardarStock(producto.id)
  const form = useForm({
    defaultValues: { stock: String(producto.stock), disponible: producto.disponible },
    onSubmit: async ({ value }) => {
      try {
        await guardar.mutateAsync({ stock: Number(value.stock), disponible: value.disponible })
        onClose()
      } catch {
        return
      }
    },
  })
  return <Modal title={`Stock de ${producto.nombre}`} onClose={onClose}>
    <form noValidate className="stack" onSubmit={(event) => { event.preventDefault(); void form.handleSubmit() }}>
      <form.Field name="stock" validators={{ onSubmit: ({ value }) => validarStock(value) }}>
        {(field) => <Campo label="Stock" error={field.state.meta.errors[0]}>
          <Input type="number" min={0} value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} />
        </Campo>}
      </form.Field>
      <form.Field name="disponible">
        {(field) => <label className="check"><input type="checkbox" checked={field.state.value}
          onChange={(event) => field.handleChange(event.target.checked)} /> Disponible</label>}
      </form.Field>
      <EstadoError error={guardar.error} />
      <Button type="submit" disabled={guardar.isPending}>Guardar stock</Button>
    </form>
  </Modal>
}
