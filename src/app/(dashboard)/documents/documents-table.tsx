'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { FileText, Download, Trash2 } from 'lucide-react'
import { formatDate, formatFileSize } from '@/lib/utils'

interface Doc {
  id: string
  name: string
  fileName: string
  fileSize: number
  createdAt: Date
  serviceId: string
  serviceName: string
  companyName: string
}

interface DocumentsTableProps {
  docs: Doc[]
  canDelete: boolean
}

export function DocumentsTable({ docs: initialDocs, canDelete }: DocumentsTableProps) {
  const [docs, setDocs] = useState<Doc[]>(initialDocs)

  async function handleDelete(docId: string) {
    const res = await fetch(`/api/documents/${docId}`, { method: 'DELETE' })
    if (res.ok) setDocs((prev) => prev.filter((d) => d.id !== docId))
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Documento</TableHead>
          <TableHead>Servicio</TableHead>
          <TableHead>Empresa</TableHead>
          <TableHead>Tamaño</TableHead>
          <TableHead>Subido</TableHead>
          <TableHead className="w-28" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {docs.map((doc) => (
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
              <Link href={`/services/${doc.serviceId}`} className="text-sm text-brand-600 dark:text-brand-400 hover:underline">
                {doc.serviceName}
              </Link>
            </TableCell>
            <TableCell className="text-gray-600 dark:text-zinc-300 text-sm">{doc.companyName}</TableCell>
            <TableCell className="text-gray-600 dark:text-zinc-300 text-sm">{formatFileSize(doc.fileSize)}</TableCell>
            <TableCell className="text-gray-500 dark:text-zinc-400 text-sm">{formatDate(doc.createdAt)}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Button asChild variant="outline" size="sm">
                  <a href={`/api/documents/${doc.id}/download`}>
                    <Download size={13} />
                    Descargar
                  </a>
                </Button>
                {canDelete && (
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    title="Eliminar documento"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
