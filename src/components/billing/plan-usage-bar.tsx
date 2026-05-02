import Link from 'next/link'
import { Zap, ArrowRight } from 'lucide-react'

interface PlanUsageBarProps {
  planName: string
  label: string
  current: number
  max: number | null
  showUpgrade?: boolean
}

export function PlanUsageBar({ planName, label, current, max, showUpgrade = true }: PlanUsageBarProps) {
  if (max === null) return null

  const pct = Math.min(Math.round((current / max) * 100), 100)
  const isWarning = pct >= 80
  const isOver = pct >= 100

  if (!isWarning && !showUpgrade) return null

  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 ${
        isOver
          ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
          : isWarning
          ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20'
          : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
      }`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Zap
          size={15}
          className={`shrink-0 ${
            isOver
              ? 'text-red-500'
              : isWarning
              ? 'text-amber-500'
              : 'text-gray-400 dark:text-zinc-500'
          }`}
        />
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className={`font-medium ${isOver ? 'text-red-700 dark:text-red-400' : isWarning ? 'text-amber-700 dark:text-amber-400' : 'text-gray-600 dark:text-zinc-400'}`}>
              {label} · Plan {planName}
            </span>
            <span className={`font-semibold tabular-nums ${isOver ? 'text-red-700 dark:text-red-400' : isWarning ? 'text-amber-700 dark:text-amber-400' : 'text-gray-700 dark:text-zinc-300'}`}>
              {current} / {max}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-zinc-800">
            <div
              className={`h-1.5 rounded-full transition-all ${
                isOver ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-brand-500'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
      {(isWarning || isOver) && (
        <Link
          href="/billing"
          className={`shrink-0 flex items-center gap-1 text-xs font-semibold whitespace-nowrap ${
            isOver
              ? 'text-red-600 dark:text-red-400 hover:text-red-700'
              : 'text-amber-600 dark:text-amber-400 hover:text-amber-700'
          }`}
        >
          Actualizar
          <ArrowRight size={12} />
        </Link>
      )}
    </div>
  )
}
