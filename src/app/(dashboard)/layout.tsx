import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { getTenantUsage } from '@/lib/plan-limits'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session) redirect('/login')
  if (session.user.role === 'CLIENT') redirect('/portal')

  const usage = await getTenantUsage(session.user.tenantId, session.user.role)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-zinc-950">
      <Sidebar
        role={session.user.role}
        userName={session.user.name ?? session.user.email ?? ''}
        planInfo={usage}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
