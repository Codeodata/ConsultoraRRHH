'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2 } from 'lucide-react'

interface Company {
  id: string
  name: string
}

interface ServiceFormProps {
  companies: Company[]
  defaultCompanyId?: string
  service?: any
}

export function ServiceForm({ companies, defaultCompanyId, service }: ServiceFormProps) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const fd = new FormData(e.currentTarget)
    const progress = Number(fd.get('progress'))
    const body = {
      name: fd.get('name'),
      description: fd.get('description'),
      companyId: fd.get('companyId'),
      status: fd.get('status'),
      progress: isNaN(progress) ? 0 : progress,
      startDate: fd.get('startDate') || undefined,
      endDate: fd.get('endDate') || undefined,
    }

    try {
      const url = service ? `/api/services/${service.id}` : '/api/services'
      const method = service ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Error al guardar')
        return
      }

      router.push('/services')
      router.refresh()
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const selectClass =
    'flex h-9 w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500 focus-visible:border-brand-500 dark:focus-visible:ring-brand-400 transition-colors'

  const textareaClass =
    'flex min-h-[80px] w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500 focus-visible:border-brand-500 dark:focus-visible:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-colors'

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm dark:shadow-none space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="companyId">Empresa cliente <span className="text-red-500">*</span></Label>
        <select id="companyId" name="companyId" defaultValue={service?.companyId ?? defaultCompanyId ?? ''} required className={selectClass}>
          <option value="">Selecciona una empresa</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Nombre del servicio <span className="text-red-500">*</span></Label>
        <Input id="name" name="name" defaultValue={service?.name} required placeholder="Implementación Sistema RRHH" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Descripción</Label>
        <textarea id="description" name="description" defaultValue={service?.description} rows={3} className={textareaClass} placeholder="Descripción detallada del servicio..." />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="status">Estado</Label>
          <select id="status" name="status" defaultValue={service?.status ?? 'PENDING'} className={selectClass}>
            <option value="PENDING">Pendiente</option>
            <option value="IN_PROGRESS">En proceso</option>
            <option value="COMPLETED">Finalizado</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="progress">Progreso (%)</Label>
          <Input id="progress" name="progress" type="number" min={0} max={100} defaultValue={service?.progress ?? 0} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="startDate">Fecha inicio</Label>
          <Input id="startDate" name="startDate" type="date" defaultValue={service?.startDate?.split('T')[0]} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="endDate">Fecha fin estimado</Label>
          <Input id="endDate" name="endDate" type="date" defaultValue={service?.endDate?.split('T')[0]} />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          <AlertCircle size={15} className="shrink-0" />
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <><Loader2 size={14} className="animate-spin" />Guardando...</>
          ) : (
            service ? 'Actualizar' : 'Crear servicio'
          )}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
