'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Company {
  id: string
  name: string
}

interface Props {
  companies: Company[]
}

export function ProcessForm({ companies }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    companyId: '',
    positionTitle: '',
    department: '',
    notes: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/processes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const json = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(json.error || 'Error al crear el proceso')
      return
    }

    router.push(`/procesos/${json.data.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="companyId">Empresa *</Label>
        <select
          id="companyId"
          required
          value={form.companyId}
          onChange={(e) => setForm({ ...form, companyId: e.target.value })}
          className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">Seleccionar empresa...</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="positionTitle">Puesto a cubrir *</Label>
        <Input
          id="positionTitle"
          required
          placeholder="Ej: Analista Contable"
          value={form.positionTitle}
          onChange={(e) => setForm({ ...form, positionTitle: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="department">Área / Departamento</Label>
        <Input
          id="department"
          placeholder="Ej: Finanzas"
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notas internas</Label>
        <textarea
          id="notes"
          rows={3}
          placeholder="Requisitos especiales, contexto del proceso..."
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex gap-3 pt-1">
        <Button type="submit" disabled={loading}>
          {loading ? 'Creando...' : 'Crear proceso'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
