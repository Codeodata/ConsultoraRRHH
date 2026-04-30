import { auth, signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { LogOut, Building2 } from 'lucide-react'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session) redirect('/login')
  if (session.user.role !== 'CLIENT') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-30 border-b border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
              <Building2 size={15} />
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-zinc-50">Portal Cliente</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-xs font-bold text-brand-600 dark:text-brand-400">
                {(session.user.name ?? session.user.email ?? 'U')[0].toUpperCase()}
              </div>
              <span className="text-sm text-gray-600 dark:text-zinc-400">{session.user.name ?? session.user.email}</span>
            </div>
            <form
              action={async () => {
                'use server'
                await signOut({ redirectTo: '/login' })
              }}
            >
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
              >
                <LogOut size={12} />
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8">{children}</main>
    </div>
  )
}
