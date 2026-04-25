import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  className?: string
  showLabel?: boolean
}

export function ProgressBar({ value, className, showLabel = true }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))
  const color =
    clamped === 100
      ? 'bg-green-500'
      : clamped >= 50
        ? 'bg-blue-500'
        : clamped > 0
          ? 'bg-yellow-500'
          : 'bg-gray-300 dark:bg-zinc-600'

  return (
    <div className={cn('space-y-1', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-500 dark:text-zinc-400">
          <span>Progreso</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-zinc-700 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
