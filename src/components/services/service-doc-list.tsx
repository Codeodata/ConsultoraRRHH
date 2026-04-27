'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, Download, Trash2, Pencil, X, Check, Loader2 } from 'lucide-react'
import { formatDate, formatFileSize } from '@/lib/utils'

interface ServiceDoc {
  id: string
  name: string
  description: string | null
  fileName: string
  fileSize: number
  version: number
  createdAt: Date
}

interface ServiceDocListProps {
  docs: ServiceDoc[]
}

function DocRow({ doc, onDelete }: { doc: ServiceDoc; onDelete: (id: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(doc.name)
  const [description, setDescription] = useState(doc.description ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const res = await fetch(`/api/documents/${doc.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    })
    setSaving(false)
    if (res.ok) setEditing(false)
  }

  function handleCancel() {
    setName(doc.name)
    setDescription(doc.description ?? '')
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="px-6 py-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Nombre</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Descripción</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} className="h-8 text-sm" placeholder="Opcional" />
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
            Guardar
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel}>
            <X size={12} />
            Cancelar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 px-6 py-3.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 shrink-0">
        <FileText size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-zinc-100 truncate text-sm">{name}</p>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
          {formatFileSize(doc.fileSize)} · v{doc.version} · {formatDate(doc.createdAt)}
        </p>
        {description && (
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5 truncate">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button asChild variant="outline" size="sm">
          <a href={`/api/documents/${doc.id}/download`}>
            <Download size={13} />
            Descargar
          </a>
        </Button>
        <button
          onClick={() => setEditing(true)}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors"
          title="Editar documento"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(doc.id)}
          className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          title="Eliminar documento"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
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
        <DocRow key={doc.id} doc={doc} onDelete={handleDelete} />
      ))}
    </div>
  )
}
