import { ImageOff, PackageOpen } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import { handleApiError } from '../api/handleApiError'

export const dinero = (valor: number) => new Intl.NumberFormat('es-AR', {
  style: 'currency', currency: 'ARS', maximumFractionDigits: 2,
}).format(valor)

export function Button({ className = '', type = 'button', ...props }: ComponentProps<'button'>) {
  return <button type={type} className={`button ${className}`} {...props} />
}

export function Card({ className = '', ...props }: ComponentProps<'section'>) {
  return <section className={`card ${className}`} {...props} />
}

export function Input({ className = '', ...props }: ComponentProps<'input'>) {
  return <input className={`input ${className}`} {...props} />
}

export function Campo({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <label className="field">{label}{children}{error && <span className="field-error">{error}</span>}</label>
}

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { ref.current?.showModal() }, [])
  return <dialog ref={ref} className="modal" aria-label={title}
    onCancel={(event) => { event.preventDefault(); onClose() }}>
    <div className="modal-heading">
      <h2>{title}</h2>
      <Button className="secondary small" onClick={onClose}>Cerrar</Button>
    </div>
    {children}
  </dialog>
}

export function FotoProducto({ url, nombre }: { url: string | null; nombre: string }) {
  const [fallo, setFallo] = useState<string | null>(null)
  if (!url || fallo === url) return <div className="foto-vacia" aria-label="Sin imagen disponible"><ImageOff size={28} /></div>
  return <img className="foto-producto" src={url} alt={nombre} loading="lazy" onError={() => setFallo(url)} />
}

export function Skeleton({ count = 3 }: { count?: number }) {
  return <div className="skeleton-grid" role="status" aria-label="Cargando">
    {Array.from({ length: count }, (_, i) => <div className="skeleton" key={i} />)}
  </div>
}

export function EstadoVacio({ title, children }: { title: string; children?: ReactNode }) {
  return <div className="empty"><PackageOpen size={28} /><h2>{title}</h2>{children}</div>
}

export function EstadoError({ error, retry }: { error: unknown; retry?: () => void }) {
  if (!error) return null
  return <div className="error" role="alert">
    <span>{handleApiError(error)}</span>
    {retry && <Button className="secondary small" onClick={retry}>Reintentar</Button>}
  </div>
}

export function Paginacion({ page, total, limit, onChange }: {
  page: number; total: number; limit: number; onChange: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / limit))
  if (pages <= 1 && page === 0) return null
  return <nav className="pagination" aria-label="Paginación">
    <Button className="secondary small" disabled={page === 0} onClick={() => onChange(page - 1)}>Anterior</Button>
    <span>Página {page + 1} de {pages}</span>
    <Button className="secondary small" disabled={page >= pages - 1} onClick={() => onChange(page + 1)}>Siguiente</Button>
  </nav>
}
