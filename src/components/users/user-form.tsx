'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UpgradePrompt } from '@/components/billing/upgrade-prompt'

interface UserFormProps {
  companies: { id: string; name: string }[]
  user?: any
}

export function UserForm({ companies, user }: UserFormProps) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [upgradeMsg, setUpgradeMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState(user?.role ?? 'CLIENT')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const fd = new FormData(e.currentTarget)
    const body: Record<string, any> = {
      name: fd.get('name'),
      email: fd.get('email'),
      role: fd.get('role'),
      companyId: fd.get('companyId') || null,
    }

    const password = fd.get('password')
    if (password) body.password = password

    try {
      const url = user ? `/api/users/${user.id}` : '/api/users'
      const method = user ? 'PATCH' : 'POST'

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
        setError(data.error ?? 'Error al guardar')
        return
      }

      router.push('/users')
      router.refresh()
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      <div>
        <label className="label">Nombre completo *</label>
        <input name="name" defaultValue={user?.name} required className="input" placeholder="Juan Pérez" />
      </div>

      <div>
        <label className="label">Email *</label>
        <input name="email" type="email" defaultValue={user?.email} required className="input" placeholder="juan@empresa.cl" />
      </div>

      <div>
        <label className="label">{user ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}</label>
        <input
          name="password"
          type="password"
          required={!user}
          minLength={8}
          className="input"
          placeholder="Mínimo 8 caracteres"
        />
      </div>

      <div>
        <label className="label">Rol *</label>
        <select
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
          className="input"
        >
          <option value="OWNER">Administrador</option>
          <option value="RRHH">RRHH</option>
          <option value="CLIENT">Cliente</option>
        </select>
      </div>

      {role === 'CLIENT' && (
        <div>
          <label className="label">Empresa cliente</label>
          <select name="companyId" defaultValue={user?.companyId ?? ''} className="input">
            <option value="">Sin empresa asignada</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {upgradeMsg && <UpgradePrompt message={upgradeMsg} />}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Guardando...' : user ? 'Actualizar usuario' : 'Crear usuario'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
  )
}
