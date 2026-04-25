import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import type { Metadata } from 'next'
import { Plus, Users, ArrowRight, GitBranch } from 'lucide-react'

export const metadata: Metadata = { title: 'Empleados' }

export default async function EmployeesPage() {
  const session = await auth()
  const tenantId = session!.user.tenantId

  const employees = await db.employee.findMany({
    where: { tenantId },
    include: {
      company: { select: { name: true } },
      reportsTo: { select: { name: true } },
      _count: { select: { reports: true } },
    },
    orderBy: [{ company: { name: 'asc' } }, { name: 'asc' }],
  })

  const active = employees.filter((e) => e.isActive).length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50">Empleados</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
            {active} activo{active !== 1 ? 's' : ''} · {employees.length} total
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="secondary">
            <Link href="/employees/org-chart">
              <GitBranch size={15} />
              Organigrama
            </Link>
          </Button>
          <Button asChild>
            <Link href="/employees/new">
              <Plus size={15} />
              Nuevo empleado
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm dark:shadow-none overflow-hidden">
        {employees.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800">
              <Users size={22} className="text-gray-400 dark:text-zinc-500" />
            </div>
            <p className="font-medium text-gray-900 dark:text-zinc-100">No hay empleados aún</p>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1 mb-4">Registrá el primer empleado</p>
            <Button asChild size="sm">
              <Link href="/employees/new">
                <Plus size={14} />
                Crear empleado
              </Link>
            </Button>
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
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 text-xs font-bold shrink-0">
                        {emp.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-zinc-100 text-sm">{emp.name}</p>
                        {emp.email && <p className="text-xs text-gray-500 dark:text-zinc-400">{emp.email}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-zinc-300 text-sm">{emp.position ?? '—'}</TableCell>
                  <TableCell className="text-gray-600 dark:text-zinc-300 text-sm">{emp.department ?? '—'}</TableCell>
                  <TableCell className="text-gray-600 dark:text-zinc-300 text-sm">{emp.company.name}</TableCell>
                  <TableCell className="text-gray-600 dark:text-zinc-300 text-sm">
                    {emp.reportsTo ? (
                      <span className="flex items-center gap-1">
                        <span className="text-gray-400 dark:text-zinc-500">↳</span>
                        {emp.reportsTo.name}
                      </span>
                    ) : (
                      emp._count.reports > 0
                        ? <span className="text-brand-600 dark:text-brand-400 text-xs font-medium">{emp._count.reports} reporte{emp._count.reports !== 1 ? 's' : ''}</span>
                        : <span className="text-gray-400">—</span>
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
                  <TableCell>
                    <Link
                      href={`/employees/${emp.id}`}
                      className="flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium transition-colors"
                    >
                      Ver
                      <ArrowRight size={13} />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
