import * as React from 'react'
import { cn } from '@/lib/utils'

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-11 w-11 text-base',
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = 'md', children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-center rounded-full bg-brand-100 text-brand-700 font-semibold shrink-0',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
Avatar.displayName = 'Avatar'

export { Avatar }
