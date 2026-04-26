'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileText, Download, Trash2 } from 'lucide-react'
import { formatDate, formatFileSize } from '@/lib/utils'

interface ServiceDoc {
  id: string
  name: string
  fileName: string
  fileSize: number
  version: number
  createdAt: Date
}

interface ServiceDocListProps {
  docs: ServiceDoc[]
}

export function ServiceDocList({ docs: initialDocs }: ServiceDocListProps) {
  const [docs, setDocs] = useState<ServiceDoc[]>(initialDocs)

  async function handleDelete(docId: string) {
    const res = await fetch(`/api/documents/${docId}`, { method: 'DELETE' })
    if (res.ok) setDocs((prev) => prev.filter((d) => d.id !== docId))
  }

  if (docs.length === 0) {
    return (
      <div className="px-6 py-10 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800">
          <FileText size={18} className="text-gray-400 dark:text-zinc-500" />
        </div>
        <p className="text-sm text-gray-400 dark:text-zinc-500">No hay documentos subidos aún</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-zinc-800">
      {docs.map((doc) => (
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
          <div className="flex items-center gap-1 shrink-0">
            <Button asChild variant="outline" size="sm">
              <a href={`/api/documents/${doc.id}/download`}>
                <Download size={13} />
                Descargar
              </a>
            </Button>
            <button
              onClick={() => handleDelete(doc.id)}
              className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              title="Eliminar documento"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
