'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export function SubscribeButton({ plan, label = 'Suscribirse' }: { plan: 'STARTER' | 'PRO' | 'BUSINESS'; label?: string }) {
  const [loading, setLoading] = useState(false)

  async function handleSubscribe() {
    setLoading(true)
    try {
      const res = await fetch('/api/billing/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleSubscribe} disabled={loading} className="w-full">
      {loading ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
      {loading ? 'Redirigiendo a MercadoPago...' : label}
    </Button>
  )
}

export function CancelButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)

  async function handleCancel() {
    setLoading(true)
    try {
      await fetch('/api/billing/cancel', { method: 'POST' })
      router.refresh()
    } finally {
      setLoading(false)
      setConfirm(false)
    }
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-zinc-400">¿Confirmar cancelación?</span>
        <Button variant="destructive" size="sm" onClick={handleCancel} disabled={loading}>
          {loading ? <Loader2 size={12} className="animate-spin mr-1" /> : null}
          {loading ? 'Cancelando...' : 'Sí, cancelar'}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setConfirm(false)} disabled={loading}>
          No
        </Button>
      </div>
    )
  }

  return (
    <Button variant="outline" size="sm" onClick={() => setConfirm(true)}>
      Cancelar suscripción
    </Button>
  )
}
