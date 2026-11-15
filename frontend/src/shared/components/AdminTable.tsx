import {
  flexRender, getCoreRowModel, getPaginationRowModel, useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { EstadoVacio, Paginacion } from '../ui/primitives'

export function AdminTable<T>({ data, columns, empty, pageSize = 8 }: { data: T[]; columns: ColumnDef<T>[]; empty: string; pageSize?: number }) {
  const table = useReactTable({
    data, columns, initialState: { pagination: { pageIndex: 0, pageSize } },
    getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(),
  })
  const { pageIndex } = table.getState().pagination

  if (data.length === 0) return <EstadoVacio title={empty} />
  return <>
    <div className="table-wrap">
      <table>
        <thead>{table.getHeaderGroups().map((group) => <tr key={group.id}>
          {group.headers.map((header) => <th key={header.id} scope="col">
            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
          </th>)}
        </tr>)}</thead>
        <tbody>{table.getRowModel().rows.map((row) => <tr key={row.id}>
          {row.getVisibleCells().map((cell) => <td key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>)}
        </tr>)}</tbody>
      </table>
    </div>
    <Paginacion page={pageIndex} limit={pageSize} total={data.length} onChange={table.setPageIndex} />
  </>
}
