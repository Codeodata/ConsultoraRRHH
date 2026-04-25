'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, Loader2 } from 'lucide-react'

export function DocumentUpload({ serviceId }: { serviceId: string }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess('')

    const file = fileRef.current?.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const fd = new FormData(e.currentTarget)
      fd.append('serviceId', serviceId)

      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Error al subir el archivo')
        return
      }

      setSuccess('Documento subido correctamente')
      if (fileRef.current) fileRef.current.value = ''
      router.refresh()
    } catch {
      setError('Error de conexión')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleUpload} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Nombre del documento</Label>
          <Input name="name" required placeholder="Propuesta técnica" />
        </div>
        <div className="space-y-1.5">
          <Label>Descripción</Label>
          <Input name="description" placeholder="Descripción opcional" />
        </div>
        <div className="space-y-1.5">
          <Label>Archivo <span className="text-red-500">*</span></Label>
          <input
            ref={fileRef}
            name="file"
            type="file"
            required
            className="flex h-9 w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-sm text-gray-900 dark:text-zinc-100 shadow-sm file:mr-3 file:rounded file:border-0 file:bg-brand-50 dark:file:bg-brand-900/20 file:px-3 file:py-1 file:text-xs file:font-medium file:text-brand-700 dark:file:text-brand-400 focus-visible:outline-none"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {success && <p className="text-sm text-green-600 dark:text-green-400">{success}</p>}

      <Button type="submit" disabled={uploading} size="sm">
        {uploading ? (
          <><Loader2 size={13} className="animate-spin" />Subiendo...</>
        ) : (
          <><Upload size={13} />Subir documento</>
        )}
      </Button>
    </form>
  )
}
