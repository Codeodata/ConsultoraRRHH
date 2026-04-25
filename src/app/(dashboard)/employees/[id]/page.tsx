import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate, getChangeTypeLabel, getChangeTypeVariant } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'
import { ChevronRight, Pencil, User, Clock, Users } from 'lucide-react'

export const metadata: Metadata = { title: 'Detalle del empleado' }

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const tenantId = session!.user.tenantId

  const employee = await db.employee.findFirst({
    where: { id, tenantId },
    include: {
      company: { select: { id: true, name: true } },
      reportsTo: { select: { id: true, name: true, position: true } },
      reports: {
        where: { isActive: true },
        select: { id: true, name: true, position: true, department: true },
        orderBy: { name: 'asc' },
      },
      history: { orderBy: { date: 'desc' } },
    },
  })

  if (!employee) notFound()

  const info = [
    { label: 'RUT', value: employee.rut },
    { label: 'Email', value: employee.email },
    { label: 'Teléfono', value: employee.phone },
    { label: 'Cargo', value: employee.position },
    { label: 'Departamento', value: employee.department },
    { label: 'Empresa', value: employee.company.name },
    { label: 'Ingreso', value: employee.startDate ? formatDate(employee.startDate) : null },
    { label: 'Registrado', value: formatDate(employee.createdAt) },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400 mb-1.5">
            <Link href="/employees" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Empleados
            </Link>
            <ChevronRight size={12} />
            <span className="text-gray-700 dark:text-zinc-200">{employee.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 text-sm font-bold shrink-0">
              {employee.name[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50">{employee.name}</h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                {employee.position ?? 'Sin cargo'}
                {employee.department ? ` · ${employee.department}` : ''}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={employee.isActive ? 'success' : 'secondary'}>
            {employee.isActive ? 'Activo' : 'Inactivo'}
          </Badge>
          <Button asChild size="sm" variant="secondary">
            <Link href={`/employees/${employee.id}/edit`}>
              <Pencil size={13} />
              Editar
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Info card */}
        <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm dark:shadow-none space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-zinc-50">
            <User size={15} className="text-gray-400 dark:text-zinc-500" />
            Información
          </div>
          <dl className="space-y-2.5 text-sm">
            {info.map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-gray-500 dark:text-zinc-400 shrink-0">{label}</dt>
                <dd className="font-medium text-gray-900 dark:text-zinc-100 text-right truncate">{value ?? '—'}</dd>
              </div>
            ))}
            {employee.reportsTo && (
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500 dark:text-zinc-400 shrink-0">Reporta a</dt>
                <dd className="text-right">
                  <Link
                    href={`/employees/${employee.reportsTo.id}`}
                    className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    {employee.reportsTo.name}
                  </Link>
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* History */}
        <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm dark:shadow-none lg:col-span-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-zinc-50 mb-4">
            <Clock size={15} className="text-gray-400 dark:text-zinc-500" />
            Historial de cambios ({employee.history.length})
          </div>

          {employee.history.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-zinc-500 py-4 text-center">
              Sin cambios registrados. Los cambios de cargo y departamento se registran automáticamente.
            </p>
          ) : (
            <div className="relative space-y-0">
              {employee.history.map((entry, i) => (
                <div key={entry.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="mt-1 h-2 w-2 rounded-full bg-brand-400 dark:bg-brand-500 shrink-0" />
                    {i < employee.history.length - 1 && (
                      <div className="w-px flex-1 bg-gray-200 dark:bg-zinc-700 mt-1" />
                    )}
                  </div>
                  <div className="pb-4 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={getChangeTypeVariant(entry.changeType)}>
                        {getChangeTypeLabel(entry.changeType)}
                      </Badge>
                      <span className="text-xs text-gray-400 dark:text-zinc-500">{formatDate(entry.date)}</span>
                    </div>
                    {entry.description && (
                      <p className="text-sm text-gray-600 dark:text-zinc-300 mt-1">{entry.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Direct reports */}
      {employee.reports.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm dark:shadow-none overflow-hidden">
          <div className="border-b border-gray-100 dark:border-zinc-800 px-6 py-4 flex items-center gap-2">
            <Users size={15} className="text-gray-400 dark:text-zinc-500" />
            <h3 className="font-semibold text-gray-900 dark:text-zinc-50 text-sm">
              Reportes directos ({employee.reports.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-zinc-800">
            {employee.reports.map((report) => (
              <Link
                key={report.id}
                href={`/employees/${report.id}`}
                className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 text-xs font-semibold shrink-0">
                  {report.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-zinc-100 truncate">{report.name}</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                    {report.position ?? '—'}{report.department ? ` · ${report.department}` : ''}
                  </p>
                </div>
                <ChevronRight size={14} className="text-gray-400 dark:text-zinc-500 shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
