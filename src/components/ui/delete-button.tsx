'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, Trash2 } from 'lucide-react'

interface DeleteButtonProps {
  url: string
  confirmMessage: string
  redirectTo: string
  label?: string
}

export function DeleteButton({ url, confirmMessage, redirectTo, label = 'Eliminar' }: DeleteButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm(confirmMessage)) return
    setLoading(true)
    try {
      const res = await fetch(url, { method: 'DELETE' })
      if (res.ok) {
        router.push(redirectTo)
        router.refresh()
      } else {
        const d = await res.json()
        alert(d.error ?? 'Error al eliminar')
      }
    } catch {
      alert('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
      {label}
    </Button>
  )
}
