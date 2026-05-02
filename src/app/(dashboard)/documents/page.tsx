import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import Link from 'next/link'
import { formatDate, formatFileSize } from '@/lib/utils'
import type { Metadata } from 'next'
import { FileText } from 'lucide-react'
import { DocumentsTable } from './documents-table'

export const metadata: Metadata = { title: 'Documentos' }

export default async function DocumentsPage() {
  const session = await auth()
  const tenantId = session!.user.tenantId
  const canDelete = ['OWNER', 'SUPER_ADMIN', 'RRHH'].includes(session!.user.role)

  const documents = await db.document.findMany({
    where: { tenantId },
    include: {
      service: {
        select: {
          id: true,
          name: true,
          company: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const docs = documents.map((doc) => ({
    id: doc.id,
    name: doc.name,
    fileName: doc.fileName,
    fileSize: doc.fileSize,
    createdAt: doc.createdAt,
    serviceId: doc.service.id,
    serviceName: doc.service.name,
    companyName: doc.service.company.name,
  }))

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50">Documentos</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
          {documents.length} documento{documents.length !== 1 ? 's' : ''} registrado{documents.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm dark:shadow-none overflow-hidden">
        {documents.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800">
              <FileText size={22} className="text-gray-400 dark:text-zinc-500" />
            </div>
            <p className="font-medium text-gray-900 dark:text-zinc-100">No hay documentos</p>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Sube documentos desde el detalle de cada servicio</p>
          </div>
        ) : (
          <DocumentsTable docs={docs} canDelete={canDelete} />
        )}
      </div>
    </div>
  )
}
