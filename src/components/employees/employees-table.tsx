'use client'

import { useState, useMemo } from 'react'
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

const selectClass =
  'h-8 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors'

export function EmployeesTable({ employees }: { employees: TableEmployee[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [companyFilter, setCompanyFilter] = useState('ALL')
  const [deptFilter, setDeptFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')

  const companies = useMemo(() => {
    return Array.from(new Set(employees.map((e) => e.company.name))).sort()
  }, [employees])

  const departments = useMemo(() => {
    return Array.from(
      new Set(employees.map((e) => e.department).filter(Boolean) as string[])
    ).sort()
  }, [employees])

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      if (search) {
        const q = search.toLowerCase()
        if (
          !e.name.toLowerCase().includes(q) &&
          !(e.email ?? '').toLowerCase().includes(q) &&
          !(e.position ?? '').toLowerCase().includes(q)
        ) return false
      }
      if (companyFilter !== 'ALL' && e.company.name !== companyFilter) return false
      if (deptFilter !== 'ALL' && e.department !== deptFilter) return false
      if (statusFilter === 'ACTIVE' && !e.isActive) return false
      if (statusFilter === 'INACTIVE' && e.isActive) return false
      return true
    })
  }, [employees, search, companyFilter, deptFilter, statusFilter])

  const hasFilter =
    search || companyFilter !== 'ALL' || deptFilter !== 'ALL' || statusFilter !== 'ALL'

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 dark:border-zinc-800 px-6 py-4 bg-gray-50/50 dark:bg-zinc-800/20">
        <input
          type="text"
          placeholder="Buscar nombre, email, cargo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-56 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 px-3 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors"
        />
        {companies.length > 1 && (
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className={selectClass}
          >
            <option value="ALL">Todas las empresas</option>
            {companies.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        )}
        {departments.length > 1 && (
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className={selectClass}
          >
            <option value="ALL">Todos los departamentos</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        )}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
          className={selectClass}
        >
          <option value="ALL">Todos</option>
          <option value="ACTIVE">Activos</option>
          <option value="INACTIVE">Inactivos</option>
        </select>
        {hasFilter && (
          <span className="text-xs text-gray-400 dark:text-zinc-500">
            {filtered.length} de {employees.length}
          </span>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-gray-400 dark:text-zinc-500">
            {hasFilter ? 'Sin empleados con los filtros aplicados' : 'No hay empleados'}
          </p>
        </div>
      ) : (
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
            {filtered.map((emp) => (
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
      )}
    </div>
  )
}
