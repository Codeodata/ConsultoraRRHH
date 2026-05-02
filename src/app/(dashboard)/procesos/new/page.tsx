import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { ProcessForm } from '@/components/processes/process-form'
import type { Metadata } from 'next'
import { GitPullRequestArrow } from 'lucide-react'

export const metadata: Metadata = { title: 'Nuevo proceso de selección' }

export default async function NewProcesoPage() {
  const session = await auth()
  if (!['OWNER', 'SUPER_ADMIN', 'RRHH'].includes(session!.user.role)) redirect('/procesos')

  const companies = await db.company.findMany({
    where: { tenantId: session!.user.tenantId, isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="p-6 max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/20">
          <GitPullRequestArrow size={18} className="text-brand-600 dark:text-brand-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50">Nuevo proceso</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400">Inicio de un proceso de selección</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-6">
        <ProcessForm companies={companies} />
      </div>
    </div>
  )
}
