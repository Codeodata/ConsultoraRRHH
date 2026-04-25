'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

export function ServiceStatusForm({ service }: { service: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const fd = new FormData(e.currentTarget)
    const body = {
      status: fd.get('status'),
      progress: Number(fd.get('progress')),
    }

    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Error al actualizar')
        return
      }

      router.refresh()
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const selectClass =
    'flex h-9 w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500 focus-visible:border-brand-500 dark:focus-visible:ring-brand-400 transition-colors'

  return (
    <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm dark:shadow-none">
      <h3 className="font-semibold text-gray-900 dark:text-zinc-50 mb-4">Actualizar estado</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="status">Estado</Label>
          <select id="status" name="status" defaultValue={service.status} className={selectClass}>
            <option value="PENDING">Pendiente</option>
            <option value="IN_PROGRESS">En proceso</option>
            <option value="COMPLETED">Finalizado</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="progress">Progreso (%)</Label>
          <Input id="progress" name="progress" type="number" min={0} max={100} defaultValue={service.progress} />
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <><Loader2 size={14} className="animate-spin" />Guardando...</>
          ) : (
            'Actualizar'
          )}
        </Button>
      </form>
    </div>
  )
}
