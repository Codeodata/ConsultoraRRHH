'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

export function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const fd = new FormData(e.currentTarget)
    const name = fd.get('name') as string
    const email = fd.get('email') as string
    const password = fd.get('password') as string
    const confirm = fd.get('confirm') as string

    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Error al registrarse')
        return
      }

      // Auto-login con tenantSlug para evitar ambigüedad multi-tenant
      const result = await signIn('credentials', {
        email,
        password,
        tenantSlug: data.tenantSlug,
        redirect: false,
      })
      if (result?.error) {
        router.push('/login')
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Error de conexión. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nombre completo</Label>
        <Input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          placeholder="María García"
          minLength={2}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="tu@consultora.com"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Mínimo 8 caracteres"
          minLength={8}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirm">Confirmar contraseña</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Repetí tu contraseña"
          minLength={8}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          <AlertCircle size={15} className="shrink-0" />
          {error}
        </div>
      )}

      <div className="rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700 px-4 py-3 space-y-1.5">
        <p className="text-xs font-medium text-gray-600 dark:text-zinc-400">Plan Free incluye:</p>
        {['1 empresa cliente', '15 empleados', '2 usuarios del sistema'].map((f) => (
          <div key={f} className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
            <CheckCircle2 size={12} className="text-green-500 shrink-0" />
            {f}
          </div>
        ))}
        <p className="text-xs text-gray-400 dark:text-zinc-500 pt-0.5">Sin tarjeta requerida</p>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Creando cuenta...
          </>
        ) : (
          'Crear cuenta gratis'
        )}
      </Button>
    </form>
  )
}
