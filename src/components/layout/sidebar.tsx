'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Building2,
  Wrench,
  FileText,
  Users,
  UserSquare2,
  ClipboardList,
  CreditCard,
  GitPullRequestArrow,
  LogOut,
  type LucideIcon,
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

const adminNav: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/companies', label: 'Empresas', icon: Building2 },
  { href: '/services', label: 'Servicios', icon: Wrench },
  { href: '/tasks', label: 'Tareas', icon: ClipboardList },
  { href: '/documents', label: 'Documentos', icon: FileText },
  { href: '/employees', label: 'Empleados', icon: UserSquare2 },
  { href: '/procesos', label: 'Procesos', icon: GitPullRequestArrow },
  { href: '/users', label: 'Usuarios', icon: Users },
  { href: '/billing', label: 'Facturación', icon: CreditCard },
]

const rrhhNav: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/companies', label: 'Empresas', icon: Building2 },
  { href: '/services', label: 'Servicios', icon: Wrench },
  { href: '/tasks', label: 'Tareas', icon: ClipboardList },
  { href: '/documents', label: 'Documentos', icon: FileText },
  { href: '/employees', label: 'Empleados', icon: UserSquare2 },
  { href: '/procesos', label: 'Procesos', icon: GitPullRequestArrow },
]

interface SidebarProps {
  role: string
  userName: string
}

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname()
  const navItems = role === 'SUPER_ADMIN' ? adminNav : rrhhNav
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U'

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-gray-100 dark:border-zinc-800 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white text-sm font-bold shadow-sm">
          C
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900 dark:text-zinc-50 leading-tight">Consultora RRHH</span>
          <span className="text-xs text-gray-400 dark:text-zinc-500 leading-tight">Panel de gestión</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-600">
          Menú principal
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 shadow-[inset_3px_0_0_theme(colors.brand.600)] pl-[calc(0.75rem-3px)]'
                  : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-zinc-100'
              )}
            >
              <Icon
                size={16}
                className={cn(
                  'shrink-0 transition-colors',
                  isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-zinc-500'
                )}
              />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-gray-100 dark:border-zinc-800 p-3 space-y-1">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-default">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white text-xs font-semibold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-gray-900 dark:text-zinc-100 leading-tight">{userName}</p>
            <p className="truncate text-xs text-gray-400 dark:text-zinc-500 leading-tight mt-0.5">{role}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <LogOut size={16} className="shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
