import { ArrowDown, Search } from 'lucide-react'
import { useState } from 'react'
import { EstadoError, EstadoVacio, Input, Paginacion, Skeleton } from '../../../shared/ui/primitives'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { ProductoCard } from '../components/ProductoCard'
import { useProductos } from '../hooks/useProductos'

const LIMIT = 6

export function CatalogoPage() {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [categoria, setCategoria] = useState('')
  const categorias = useCategorias()
  const productos = useProductos({
    skip: page * LIMIT, limit: LIMIT, search, categoria_id: categoria ? Number(categoria) : undefined,
  })
  return <>
    <section className="hero">
      <div className="hero-copy">
        <h1>Tu próxima comida está acá.</h1>
        <p>Elegí del menú y armá tu pedido para recibirlo en casa.</p>
        <a className="button" href="#menu">Ver menú <ArrowDown size={17} /></a>
      </div>
      <img className="hero-image" src="/menu/hamburguesa.webp" alt="Hamburguesa de la casa con cheddar" />
    </section>
    <section id="menu" className="catalogo">
      <div className="section-header">
        <h2>Menú</h2>
        <div className="filters">
          <label className="search"><Search size={18} />
            <Input aria-label="Buscar productos" placeholder="Buscar productos" value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(0) }} />
          </label>
          <select className="input" aria-label="Categoría" value={categoria}
            onChange={(event) => { setCategoria(event.target.value); setPage(0) }}>
            <option value="">Todas las categorías</option>
            {categorias.data?.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}
          </select>
        </div>
      </div>
      <EstadoError error={categorias.error} retry={() => void categorias.refetch()} />
      <EstadoError error={productos.error} retry={() => void productos.refetch()} />
      {productos.isPending && <Skeleton count={LIMIT} />}
      {productos.data && <>
        {productos.data.items.length === 0
          ? <EstadoVacio title="No encontramos productos" />
          : <div className="product-grid">{productos.data.items.map((producto) => <ProductoCard key={producto.id} producto={producto} />)}</div>}
        <Paginacion page={page} total={productos.data.total} limit={LIMIT} onChange={setPage} />
      </>}
    </section>
  </>
}
