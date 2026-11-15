export interface CategoriaInput {
  nombre: string
  descripcion: string | null
}

export interface Categoria extends CategoriaInput {
  id: number
  activo: boolean
}
