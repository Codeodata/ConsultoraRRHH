import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate, getChangeTypeLabel, getChangeTypeVariant } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PerformanceTabs } from '@/components/employees/performance-tabs'
import { EmployeeDocManager } from '@/components/employees/employee-doc-manager'
import type { Metadata } from 'next'
import {
  ChevronRight, Pencil, Clock, Users, Camera,
  Mail, Phone, Building2, Briefcase, MapPin,
  CalendarDays, IdCard, UserCircle, User,
} from 'lucide-react'

export const metadata: Metadata = { title: 'Perfil del empleado' }

export default async function EmployeeProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
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
      goals: { orderBy: { createdAt: 'desc' } },
      documents: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!employee) notFound()

  const personalFields = [
    { label: 'DNI / RUT', value: employee.rut, icon: IdCard },
    { label: 'Fecha de nacimiento', value: employee.birthDate ? formatDate(employee.birthDate) : null, icon: CalendarDays },
    { label: 'Lugar de residencia', value: employee.address, icon: MapPin },
    { label: 'Empresa', value: employee.company.name, icon: Building2 },
    { label: 'Cargo', value: employee.position, icon: Briefcase },
    { label: 'Correo laboral', value: employee.email, icon: Mail },
    { label: 'Correo personal', value: employee.personalEmail, icon: Mail },
    { label: 'Teléfono', value: employee.phone, icon: Phone },
    { label: 'Género', value: employee.gender, icon: UserCircle },
    { label: 'Fecha de ingreso', value: employee.startDate ? formatDate(employee.startDate) : null, icon: CalendarDays },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400">
        <Link
          href="/employees"
          className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          Empleados
        </Link>
        <ChevronRight size={12} />
        <span className="text-gray-700 dark:text-zinc-200">{employee.name}</span>
      </div>

      {/* ── HEADER ── */}
      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm dark:shadow-none p-6">
        <div className="flex items-start gap-5">
          {/* Avatar with photo-edit overlay */}
          <div className="group relative shrink-0">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 text-2xl font-bold select-none">
              {employee.name[0].toUpperCase()}
            </div>
            <button
              title="Editar foto"
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera size={16} className="text-white" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-50 leading-tight">
              {employee.name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
              {[employee.position, employee.department, employee.company.name]
                .filter(Boolean)
                .join(' · ')}
            </p>
            {employee.reportsTo && (
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                Reporta a{' '}
                <Link
                  href={`/employees/${employee.reportsTo.id}`}
                  className="text-brand-600 dark:text-brand-400 hover:underline font-medium"
                >
                  {employee.reportsTo.name}
                </Link>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
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
      </div>

      {/* ── DATOS PERSONALES + DESEMPEÑO ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* B. Datos personales */}
        <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm dark:shadow-none p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-zinc-50">
            <User size={15} className="text-gray-400 dark:text-zinc-500" />
            Datos personales
          </div>

          <dl className="space-y-3 text-sm">
            {personalFields.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex gap-3">
                <dt className="flex items-start gap-1.5 text-gray-500 dark:text-zinc-400 shrink-0 w-36 pt-0.5">
                  <Icon size={13} className="shrink-0 mt-0.5" />
                  <span className="text-xs">{label}</span>
                </dt>
                <dd className="font-medium text-gray-900 dark:text-zinc-100 text-sm truncate">
                  {value ?? <span className="text-gray-300 dark:text-zinc-600 font-normal">—</span>}
                </dd>
              </div>
            ))}
          </dl>

          <div className="pt-2 border-t border-gray-100 dark:border-zinc-800">
            <Button asChild size="sm" variant="outline" className="w-full">
              <Link href={`/employees/${employee.id}/edit`}>
                <Pencil size={12} />
                Completar datos
              </Link>
            </Button>
          </div>
        </div>

        {/* C. Desempeño (tabs) */}
        <div className="lg:col-span-2">
          <PerformanceTabs employeeId={employee.id} initialGoals={employee.goals} />
        </div>
      </div>

      {/* ── D. DOCUMENTACIÓN ── */}
      <EmployeeDocManager employeeId={employee.id} initialDocuments={employee.documents} />

      {/* ── E. HISTORIAL ── */}
      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm dark:shadow-none p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-zinc-50 mb-4">
          <Clock size={15} className="text-gray-400 dark:text-zinc-500" />
          Historial ({employee.history.length})
        </div>

        {employee.history.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-zinc-500 py-4 text-center">
            Sin cambios registrados. Los cambios de cargo y departamento quedan registrados
            automáticamente.
          </p>
        ) : (
          <div>
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
                    <span className="text-xs text-gray-400 dark:text-zinc-500">
                      {formatDate(entry.date)}
                    </span>
                  </div>
                  {entry.description && (
                    <p className="text-sm text-gray-600 dark:text-zinc-300 mt-1">
                      {entry.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Reportes directos ── */}
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
                  <p className="text-sm font-medium text-gray-900 dark:text-zinc-100 truncate">
                    {report.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                    {report.position ?? '—'}
                    {report.department ? ` · ${report.department}` : ''}
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
