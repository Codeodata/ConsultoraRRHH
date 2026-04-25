import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400',
        secondary: 'border-transparent bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300',
        success: 'border-transparent bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
        warning: 'border-transparent bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
        destructive: 'border-transparent bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
        info: 'border-transparent bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
        outline: 'text-gray-700 dark:text-zinc-300 border-gray-300 dark:border-zinc-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
