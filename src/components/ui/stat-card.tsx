import { cn } from '@/lib/utils'
import { type LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: number | string
  description?: string
  icon: LucideIcon
  iconClassName?: string
  trend?: { value: number; label: string }
}

export function StatCard({ title, value, description, icon: Icon, iconClassName, trend }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm dark:shadow-none">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 dark:text-zinc-400 truncate">{title}</p>
          <p className="mt-1.5 text-3xl font-bold text-gray-900 dark:text-zinc-50">{value}</p>
          {description && <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500">{description}</p>}
          {trend && (
            <p className={cn('mt-1.5 text-xs font-medium', trend.value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400')}>
              {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl shrink-0', iconClassName ?? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400')}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  )
}
