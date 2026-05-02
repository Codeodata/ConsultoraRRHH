'use client'

import Link from 'next/link'
import { AlertTriangle, ArrowRight, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UpgradePromptProps {
  message: string
  variant?: 'inline' | 'banner'
}

/**
 * Mostrar cuando una API devuelve 402 con upgradeRequired: true.
 * variant="inline"  → bloque de error dentro de un formulario
 * variant="banner"  → banner en la parte superior de la página
 */
export function UpgradePrompt({ message, variant = 'inline' }: UpgradePromptProps) {
  if (variant === 'banner') {
    return (
      <div className="flex items-start justify-between gap-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-4 py-3">
        <div className="flex items-start gap-3">
          <Zap size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-300">{message}</p>
        </div>
        <Link href="/billing" className="shrink-0">
          <Button size="sm" variant="outline" className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 whitespace-nowrap gap-1.5">
            Ver planes
            <ArrowRight size={13} />
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 space-y-3">
      <div className="flex items-start gap-2.5">
        <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800 dark:text-amber-300">{message}</p>
      </div>
      <Link href="/billing">
        <Button size="sm" className="gap-1.5">
          <Zap size={13} />
          Actualizar plan
          <ArrowRight size={13} />
        </Button>
      </Link>
    </div>
  )
}
