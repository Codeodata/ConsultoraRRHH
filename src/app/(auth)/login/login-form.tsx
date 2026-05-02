'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2 } from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [needSlug, setNeedSlug] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const fd = new FormData(e.currentTarget)
    const email = fd.get('email') as string
    const password = fd.get('password') as string
    const tenantSlug = (fd.get('tenantSlug') as string) || undefined

    try {
      const result = await signIn('credentials', {
        email,
        password,
        tenantSlug,
        redirect: false,
      })

      if (result?.error) {
        // Si hay múltiples workspaces, pedimos el slug
        if (!tenantSlug) {
          setNeedSlug(true)
          setError('Tenés múltiples workspaces. Ingresá el slug de tu workspace.')
        } else {
          setError('Credenciales incorrectas. Intenta nuevamente.')
        }
        return
      }

      router.push('/')
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
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="tu@email.com"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
      </div>

      {needSlug && (
        <div className="space-y-1.5">
          <Label htmlFor="tenantSlug">Slug del workspace</Label>
          <Input
            id="tenantSlug"
            name="tenantSlug"
            type="text"
            placeholder="mi-consultora-1234567890"
            autoComplete="off"
          />
          <p className="text-xs text-gray-500">
            Lo encontrás en Ajustes → Workspace dentro de tu cuenta.
          </p>
        </div>
      )}

      {!needSlug && (
        <input type="hidden" name="tenantSlug" value="" />
      )}

      {error && (
        <div className="flex items-center gap-2.5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={15} className="shrink-0" />
          {error}
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Ingresando...
          </>
        ) : (
          'Iniciar sesión'
        )}
      </Button>
    </form>
  )
}
