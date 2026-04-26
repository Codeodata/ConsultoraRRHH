'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, FileText, Trash2, Download, Loader2, FolderOpen } from 'lucide-react'
import { formatFileSize, formatDate } from '@/lib/utils'

interface EmployeeDocument {
  id: string
  name: string
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
  createdAt: Date
}

interface EmployeeDocManagerProps {
  employeeId: string
  initialDocuments: EmployeeDocument[]
}

const MIME_EMOJI: Record<string, string> = {
  pdf: '📄',
  image: '🖼️',
  word: '📝',
  document: '📝',
  excel: '📊',
  sheet: '📊',
}

function docEmoji(mimeType: string): string {
  for (const [key, emoji] of Object.entries(MIME_EMOJI)) {
    if (mimeType.includes(key)) return emoji
  }
  return '📎'
}

export function EmployeeDocManager({ employeeId, initialDocuments }: EmployeeDocManagerProps) {
  const [documents, setDocuments] = useState<EmployeeDocument[]>(initialDocuments)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError('')

    const fd = new FormData()
    fd.append('file', file)
    fd.append('name', file.name.replace(/\.[^/.]+$/, ''))

    try {
      const res = await fetch(`/api/employees/${employeeId}/documents`, {
        method: 'POST',
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) { setUploadError(data.error ?? 'Error al subir archivo'); return }
      setDocuments((prev) => [data.data, ...prev])
    } catch {
      setUploadError('Error de conexión')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleDelete(docId: string) {
    const res = await fetch(`/api/employees/${employeeId}/documents/${docId}`, { method: 'DELETE' })
    if (res.ok) setDocuments((prev) => prev.filter((d) => d.id !== docId))
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm dark:shadow-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <FolderOpen size={15} className="text-gray-400 dark:text-zinc-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-50">
            Documentación ({documents.length})
          </h3>
          <span className="text-xs text-gray-400 dark:text-zinc-500">CV, contratos, certificados...</span>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            onChange={handleUpload}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip"
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <><Loader2 size={13} className="animate-spin" />Subiendo...</>
            ) : (
              <><Upload size={13} />Subir archivo</>
            )}
          </Button>
        </div>
      </div>

      {uploadError && (
        <p className="px-6 py-2 bg-red-50 dark:bg-red-900/20 text-sm text-red-600 dark:text-red-400">
          {uploadError}
        </p>
      )}

      {documents.length === 0 ? (
        <div className="py-12 text-center">
          <FileText size={22} className="mx-auto mb-2 text-gray-300 dark:text-zinc-600" />
          <p className="text-sm text-gray-400 dark:text-zinc-500">Sin documentos adjuntos</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-zinc-800">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors">
              <span className="text-lg select-none">{docEmoji(doc.mimeType)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-zinc-100 truncate">{doc.name}</p>
                <p className="text-xs text-gray-400 dark:text-zinc-500 truncate">
                  {doc.fileName} · {formatFileSize(doc.fileSize)} · {formatDate(doc.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={`/api/employees/${employeeId}/documents/${doc.id}/download`}
                  download={doc.fileName}
                  className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
                  title="Descargar"
                >
                  <Download size={14} />
                </a>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
