import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate, formatFileSize, getStatusLabel } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/ui/progress-bar'
import { ServiceStatusForm } from '@/components/services/service-status-form'
import { DocumentUpload } from '@/components/documents/document-upload'
import type { Metadata } from 'next'
import { ChevronRight, FileText, Download, CalendarDays } from 'lucide-react'

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

  const service = await db.service.findFirst({
    where: { id, tenantId },
    include: {
      company: { select: { id: true, name: true } },
      documents: { orderBy: { createdAt: 'desc' } },
    },
  })

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
        <Badge variant={getStatusVariant(service.status)} className="text-sm px-3 py-1">
          {getStatusLabel(service.status)}
        </Badge>
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

            {service.documents.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800">
                  <FileText size={18} className="text-gray-400 dark:text-zinc-500" />
                </div>
                <p className="text-sm text-gray-400 dark:text-zinc-500">No hay documentos subidos aún</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                {service.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-4 px-6 py-3.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 shrink-0">
                      <FileText size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-zinc-100 truncate text-sm">{doc.name}</p>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                        {formatFileSize(doc.fileSize)} · v{doc.version} · {formatDate(doc.createdAt)}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <a href={`/api/documents/${doc.id}/download`}>
                        <Download size={13} />
                        Descargar
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            )}
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
