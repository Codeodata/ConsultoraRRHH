import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getStatusLabel } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ProgressBar } from '@/components/ui/progress-bar'
import { Wrench } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Mi Portal' }

function getStatusVariant(status: string): 'warning' | 'info' | 'success' | 'secondary' {
  const map: Record<string, 'warning' | 'info' | 'success' | 'secondary'> = {
    PENDING: 'warning',
    IN_PROGRESS: 'info',
    COMPLETED: 'success',
  }
  return map[status] ?? 'secondary'
}

export default async function PortalPage() {
  const session = await auth()
  if (!session?.user.companyId) redirect('/login')

  const company = await db.company.findFirst({
    where: { id: session.user.companyId, tenantId: session.user.tenantId },
    include: {
      services: {
        include: { _count: { select: { documents: true } } },
        orderBy: { updatedAt: 'desc' },
      },
    },
  })

  if (!company) redirect('/login')

  const pending = company.services.filter((s) => s.status === 'PENDING').length
  const inProgress = company.services.filter((s) => s.status === 'IN_PROGRESS').length
  const completed = company.services.filter((s) => s.status === 'COMPLETED').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-50">{company.name}</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Resumen de tus servicios contratados</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pendientes', count: pending, textColor: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/10' },
          { label: 'En proceso', count: inProgress, textColor: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/10' },
          { label: 'Finalizados', count: completed, textColor: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/10' },
        ].map(({ label, count, textColor, bg }) => (
          <div key={label} className={`rounded-xl border border-gray-200 dark:border-zinc-800 ${bg} p-5 text-center`}>
            <div className={`text-3xl font-bold ${textColor}`}>{count}</div>
            <div className="text-sm text-gray-500 dark:text-zinc-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {company.services.length === 0 ? (
          <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-14 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800">
              <Wrench size={20} className="text-gray-400 dark:text-zinc-500" />
            </div>
            <p className="font-medium text-gray-900 dark:text-zinc-100">No hay servicios asignados</p>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Contacta a tu consultora para más información</p>
          </div>
        ) : (
          company.services.map((service) => (
            <Link
              key={service.id}
              href={`/portal/services/${service.id}`}
              className="block rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:shadow-md dark:hover:bg-zinc-800/50 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-zinc-50">{service.name}</h3>
                  {service.description && (
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1 truncate">{service.description}</p>
                  )}
                  <div className="mt-3">
                    <ProgressBar value={service.progress} />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Badge variant={getStatusVariant(service.status)}>
                    {getStatusLabel(service.status)}
                  </Badge>
                  <span className="text-xs text-gray-400 dark:text-zinc-500">
                    {service._count.documents} documento{service._count.documents !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
