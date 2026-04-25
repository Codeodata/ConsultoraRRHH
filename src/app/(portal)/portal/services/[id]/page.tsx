import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDate, formatFileSize, getStatusColor, getStatusLabel } from '@/lib/utils'
import { ProgressBar } from '@/components/ui/progress-bar'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Detalle servicio' }

export default async function PortalServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user.companyId) redirect('/login')

  const service = await db.service.findFirst({
    where: {
      id,
      tenantId: session.user.tenantId,
      companyId: session.user.companyId,
    },
    include: {
      documents: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!service) notFound()

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <Link href="/portal" className="hover:text-brand-600">Mis servicios</Link>
          <span>/</span>
          <span>{service.name}</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">{service.name}</h1>
          <span className={`badge text-sm px-3 py-1 ${getStatusColor(service.status)}`}>
            {getStatusLabel(service.status)}
          </span>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        {service.description && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Descripción</h3>
            <p className="text-gray-900">{service.description}</p>
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Progreso del servicio</h3>
          <ProgressBar value={service.progress} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Fecha inicio</p>
            <p className="font-medium">{formatDate(service.startDate)}</p>
          </div>
          <div>
            <p className="text-gray-500">Fecha fin estimado</p>
            <p className="font-medium">{formatDate(service.endDate)}</p>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="font-semibold text-gray-900">
            Documentos disponibles ({service.documents.length})
          </h3>
        </div>

        {service.documents.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">
            No hay documentos disponibles aún
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {service.documents.map((doc) => (
              <div key={doc.id} className="flex items-center gap-4 px-6 py-4">
                <span className="text-2xl">📄</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{doc.name}</p>
                  {doc.description && (
                    <p className="text-sm text-gray-500">{doc.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatFileSize(doc.fileSize)} · Versión {doc.version} · {formatDate(doc.createdAt)}
                  </p>
                </div>
                <a
                  href={`/api/documents/${doc.id}/download`}
                  className="btn-secondary text-sm"
                >
                  ↓ Descargar
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
