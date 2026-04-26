'use client'

import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { formatDate } from '@/lib/utils'

interface TableEmployee {
  id: string
  name: string
  email: string | null
  position: string | null
  department: string | null
  isActive: boolean
  startDate: Date | null
  company: { name: string }
  reportsTo: { name: string } | null
  _count: { reports: number }
}

export function EmployeesTable({ employees }: { employees: TableEmployee[] }) {
  const router = useRouter()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Empleado</TableHead>
          <TableHead>Cargo</TableHead>
          <TableHead>Departamento</TableHead>
          <TableHead>Empresa</TableHead>
          <TableHead>Reporta a</TableHead>
          <TableHead>Ingreso</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((emp) => (
          <TableRow
            key={emp.id}
            onClick={() => router.push(`/employees/${emp.id}`)}
            className="cursor-pointer"
          >
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 text-xs font-bold shrink-0">
                  {emp.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-zinc-100 text-sm">{emp.name}</p>
                  {emp.email && (
                    <p className="text-xs text-gray-500 dark:text-zinc-400">{emp.email}</p>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell className="text-gray-600 dark:text-zinc-300 text-sm">
              {emp.position ?? '—'}
            </TableCell>
            <TableCell className="text-gray-600 dark:text-zinc-300 text-sm">
              {emp.department ?? '—'}
            </TableCell>
            <TableCell className="text-gray-600 dark:text-zinc-300 text-sm">
              {emp.company.name}
            </TableCell>
            <TableCell className="text-gray-600 dark:text-zinc-300 text-sm">
              {emp.reportsTo ? (
                <span className="flex items-center gap-1">
                  <span className="text-gray-400 dark:text-zinc-500">↳</span>
                  {emp.reportsTo.name}
                </span>
              ) : emp._count.reports > 0 ? (
                <span className="text-brand-600 dark:text-brand-400 text-xs font-medium">
                  {emp._count.reports} reporte{emp._count.reports !== 1 ? 's' : ''}
                </span>
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </TableCell>
            <TableCell className="text-gray-500 dark:text-zinc-400 text-sm">
              {emp.startDate ? formatDate(emp.startDate) : '—'}
            </TableCell>
            <TableCell>
              <Badge variant={emp.isActive ? 'success' : 'secondary'}>
                {emp.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
