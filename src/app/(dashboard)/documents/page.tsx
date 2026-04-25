import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import Link from 'next/link'
import { formatDate, formatFileSize } from '@/lib/utils'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'
import { FileText, Download } from 'lucide-react'

export const metadata: Metadata = { title: 'Documentos' }

export default async function DocumentsPage() {
  const session = await auth()
  const tenantId = session!.user.tenantId

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Documento</TableHead>
                <TableHead>Servicio</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Tamaño</TableHead>
                <TableHead>Subido</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 shrink-0">
                        <FileText size={15} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-zinc-100 text-sm">{doc.name}</p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400">{doc.fileName}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link href={`/services/${doc.service.id}`} className="text-sm text-brand-600 dark:text-brand-400 hover:underline">
                      {doc.service.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-zinc-300 text-sm">{doc.service.company.name}</TableCell>
                  <TableCell className="text-gray-600 dark:text-zinc-300 text-sm">{formatFileSize(doc.fileSize)}</TableCell>
                  <TableCell className="text-gray-500 dark:text-zinc-400 text-sm">{formatDate(doc.createdAt)}</TableCell>
                  <TableCell>
                    <Button asChild variant="outline" size="sm">
                      <a href={`/api/documents/${doc.id}/download`}>
                        <Download size={13} />
                        Descargar
                      </a>
                    </Button>
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
