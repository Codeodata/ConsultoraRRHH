import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate, getStatusLabel } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/ui/progress-bar'
import type { Metadata } from 'next'
import { Plus, ChevronRight, Wrench } from 'lucide-react'
import { DeleteButton } from '@/components/ui/delete-button'

export const metadata: Metadata = { title: 'Detalle empresa' }

function getStatusVariant(status: string): 'warning' | 'info' | 'success' | 'secondary' {
  const map: Record<string, 'warning' | 'info' | 'success' | 'secondary'> = {
    PENDING: 'warning',
    IN_PROGRESS: 'info',
    COMPLETED: 'success',
  }
  return map[status] ?? 'secondary'
}

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const tenantId = session!.user.tenantId
  const isSuperAdmin = session!.user.role === 'SUPER_ADMIN'

  const company = await db.company.findFirst({
    where: { id, tenantId },
    include: {
      services: {
        include: { _count: { select: { documents: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!company) notFound()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400 mb-1.5">
            <Link href="/companies" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Empresas</Link>
            <ChevronRight size={12} />
            <span className="text-gray-700 dark:text-zinc-200">{company.name}</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50">{company.name}</h2>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href={`/services/new?companyId=${company.id}`}>
              <Plus size={15} />
              Nuevo servicio
            </Link>
          </Button>
          {isSuperAdmin && (
            <DeleteButton
              url={`/api/companies/${company.id}`}
              confirmMessage={`¿Eliminar la empresa "${company.name}"? Se eliminarán todos sus servicios. Esta acción no se puede deshacer.`}
              redirectTo="/companies"
              label="Eliminar empresa"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm dark:shadow-none space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-zinc-50 text-sm">Información de la empresa</h3>
          <dl className="space-y-2.5 text-sm">
            {[
              { label: 'RUT', value: company.rut },
              { label: 'Email', value: company.email },
              { label: 'Teléfono', value: company.phone },
              { label: 'Contacto', value: company.contactName },
              { label: 'Dirección', value: company.address },
              { label: 'Cliente desde', value: formatDate(company.createdAt) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-gray-500 dark:text-zinc-400 shrink-0">{label}</dt>
                <dd className="font-medium text-gray-900 dark:text-zinc-100 text-right truncate">{value ?? '—'}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm dark:shadow-none">
          <h3 className="font-semibold text-gray-900 dark:text-zinc-50 text-sm mb-4">Resumen de servicios</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { status: 'PENDING', textColor: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/10' },
              { status: 'IN_PROGRESS', textColor: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/10' },
              { status: 'COMPLETED', textColor: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/10' },
            ].map(({ status, textColor, bg }) => {
              const count = company.services.filter((s) => s.status === status).length
              return (
                <div key={status} className={`rounded-lg ${bg} p-3 text-center`}>
                  <div className={`text-2xl font-bold ${textColor}`}>{count}</div>
                  <div className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{getStatusLabel(status)}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm dark:shadow-none overflow-hidden">
        <div className="border-b border-gray-100 dark:border-zinc-800 px-6 py-4">
          <h3 className="font-semibold text-gray-900 dark:text-zinc-50">Servicios ({company.services.length})</h3>
        </div>

        {company.services.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 dark:text-zinc-500 text-sm">
            No hay servicios asignados a esta empresa.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-zinc-800">
            {company.services.map((service) => (
              <Link
                key={service.id}
                href={`/services/${service.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 shrink-0">
                  <Wrench size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-zinc-100 truncate text-sm">{service.name}</p>
                  {service.description && (
                    <p className="text-xs text-gray-500 dark:text-zinc-400 truncate mt-0.5">{service.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <ProgressBar value={service.progress} className="w-24 hidden sm:block" showLabel={false} />
                  <Badge variant={getStatusVariant(service.status)}>
                    {getStatusLabel(service.status)}
                  </Badge>
                  <span className="text-xs text-gray-400 dark:text-zinc-500 hidden md:block">
                    {service._count.documents} doc{service._count.documents !== 1 ? 's' : ''}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
