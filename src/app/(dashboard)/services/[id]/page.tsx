import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate, getStatusLabel } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ProgressBar } from '@/components/ui/progress-bar'
import { ServiceStatusForm } from '@/components/services/service-status-form'
import { DocumentUpload } from '@/components/documents/document-upload'
import { ServiceDocList } from '@/components/services/service-doc-list'
import { ServiceTaskList } from '@/components/services/service-task-list'
import type { Metadata } from 'next'
import { ChevronRight, CalendarDays } from 'lucide-react'
import { DeleteButton } from '@/components/ui/delete-button'

export const metadata: Metadata = { title: 'Detalle servicio' }

function getStatusVariant(status: string): 'warning' | 'info' | 'success' | 'secondary' {
  const map: Record<string, 'warning' | 'info' | 'success' | 'secondary'> = {
    PENDING: 'warning',
    IN_PROGRESS: 'info',
    COMPLETED: 'success',
  }
  return map[status] ?? 'secondary'
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const tenantId = session!.user.tenantId
  const canEdit = session!.user.role !== 'CLIENT'

  const [service, rrhhUsers] = await Promise.all([
    db.service.findFirst({
      where: { id, tenantId },
      include: {
        company: { select: { id: true, name: true } },
        documents: { orderBy: { createdAt: 'desc' } },
        tasks: {
          orderBy: { createdAt: 'asc' },
          include: { assignedUser: { select: { id: true, name: true, email: true } } },
        },
      },
    }),
    db.user.findMany({
      where: { tenantId, role: { in: ['OWNER', 'SUPER_ADMIN', 'RRHH'] }, isActive: true },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    }),
  ])

  if (!service) notFound()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400 mb-1.5">
            <Link href="/services" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Servicios</Link>
            <ChevronRight size={12} />
            <span className="text-gray-700 dark:text-zinc-200 truncate max-w-xs">{service.name}</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50">{service.name}</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
            <Link href={`/companies/${service.company.id}`} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              {service.company.name}
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={getStatusVariant(service.status)} className="text-sm px-3 py-1">
            {getStatusLabel(service.status)}
          </Badge>
          {canEdit && (
            <DeleteButton
              url={`/api/services/${service.id}`}
              confirmMessage={`¿Eliminar el servicio "${service.name}"? Esta acción no se puede deshacer.`}
              redirectTo="/services"
              label="Eliminar"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm dark:shadow-none space-y-5">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-zinc-50 mb-2">Descripción</h3>
              <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
                {service.description ?? 'Sin descripción'}
              </p>
            </div>

            <ProgressBar value={service.progress} />

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="flex items-start gap-2.5">
                <CalendarDays size={15} className="text-gray-400 dark:text-zinc-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">Inicio</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">{formatDate(service.startDate)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CalendarDays size={15} className="text-gray-400 dark:text-zinc-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">Fin estimado</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">{formatDate(service.endDate)}</p>
                </div>
              </div>
            </div>
          </div>

          <ServiceTaskList
            serviceId={service.id}
            tasks={service.tasks.map((t) => ({
              ...t,
              dueDate: t.dueDate?.toISOString() ?? null,
            }))}
            rrhhUsers={rrhhUsers}
            canEdit={canEdit}
          />

          <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm dark:shadow-none overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 px-6 py-4">
              <h3 className="font-semibold text-gray-900 dark:text-zinc-50">
                Documentos
                <span className="ml-2 text-xs font-normal text-gray-400 dark:text-zinc-500">({service.documents.length})</span>
              </h3>
            </div>

            {canEdit && (
              <div className="border-b border-gray-100 dark:border-zinc-800 px-6 py-4 bg-gray-50/50 dark:bg-zinc-800/30">
                <DocumentUpload serviceId={service.id} />
              </div>
            )}

            <ServiceDocList docs={service.documents} />
          </div>
        </div>

        {canEdit && (
          <div className="space-y-4">
            <ServiceStatusForm service={service} />
          </div>
        )}
      </div>
    </div>
  )
}
