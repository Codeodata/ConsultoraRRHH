'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2 } from 'lucide-react'
import { UpgradePrompt } from '@/components/billing/upgrade-prompt'

export function CompanyForm({ company }: { company?: any }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [upgradeMsg, setUpgradeMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setUpgradeMsg('')
    setLoading(true)

    const fd = new FormData(e.currentTarget)
    const body = Object.fromEntries(fd.entries())

    try {
      const url = company ? `/api/companies/${company.id}` : '/api/companies'
      const method = company ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 402 && data.upgradeRequired) {
          setUpgradeMsg(data.error)
          return
        }
        setError(data.error ?? 'Error al guardar la empresa')
        return
      }

      router.push('/companies')
      router.refresh()
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm dark:shadow-none space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nombre de la empresa <span className="text-red-500">*</span></Label>
          <Input id="name" name="name" defaultValue={company?.name} required placeholder="ACME Ltda." />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rut">RUT</Label>
          <Input id="rut" name="rut" defaultValue={company?.rut} placeholder="76.123.456-7" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={company?.email} placeholder="contacto@empresa.cl" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" name="phone" defaultValue={company?.phone} placeholder="+56 2 2345 6789" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contactName">Nombre del contacto</Label>
          <Input id="contactName" name="contactName" defaultValue={company?.contactName} placeholder="Juan Pérez" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="address">Dirección</Label>
          <Input id="address" name="address" defaultValue={company?.address} placeholder="Av. Principal 123, Santiago" />
        </div>
      </div>

      {upgradeMsg && <UpgradePrompt message={upgradeMsg} />}

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
            company ? 'Actualizar empresa' : 'Crear empresa'
          )}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
