import { auth, signOut } from '@/lib/auth'
import { getRoleLabel } from '@/lib/utils'
import { LogOut } from 'lucide-react'

interface HeaderProps {
  title: string
}

export async function Header({ title }: HeaderProps) {
  const session = await auth()

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6">
      <h1 className="text-base font-semibold text-gray-900 dark:text-zinc-50">{title}</h1>

      <div className="flex items-center gap-3">
        <span className="hidden sm:block text-xs font-medium text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
          {getRoleLabel(session?.user?.role ?? '')}
        </span>
        <form
          action={async () => {
            'use server'
            await signOut({ redirectTo: '/login' })
          }}
        >
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-zinc-100 transition-colors"
          >
            <LogOut size={13} />
            Salir
          </button>
        </form>
      </div>
    </header>
  )
}
