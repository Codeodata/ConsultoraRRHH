import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProcessStageView } from '@/components/processes/process-stage-view'
import type { Metadata } from 'next'
import { ArrowLeft, Building2, Calendar, GitPullRequestArrow } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  ON_HOLD: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Activo',
  COMPLETED: 'Completado',
  ON_HOLD: 'En pausa',
  CANCELLED: 'Cancelado',
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const session = await auth()
  const p = await db.recruitmentProcess.findFirst({
    where: { id, tenantId: session!.user.tenantId },
    select: { positionTitle: true },
  })
  return { title: p ? `Proceso: ${p.positionTitle}` : 'Proceso' }
}

export default async function ProcesoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const { id } = await params

  const process = await db.recruitmentProcess.findFirst({
    where: { id, tenantId: session!.user.tenantId },
    include: {
      company: { select: { id: true, name: true } },
      employee: { select: { id: true, name: true, position: true } },
      candidates: { orderBy: { createdAt: 'asc' } },
      onboardingTasks: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!process) notFound()

  const daysOpen = Math.ceil((Date.now() - new Date(process.openedAt).getTime()) / 86400000)

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button asChild variant="secondary" size="sm">
          <Link href="/procesos">
            <ArrowLeft size={13} /> Procesos
          </Link>
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/20 shrink-0 mt-0.5">
            <GitPullRequestArrow size={18} className="text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50">{process.positionTitle}</h2>
              <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', STATUS_STYLES[process.status])}>
                {STATUS_LABELS[process.status]}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Building2 size={12} /> {process.company.name}
              </span>
              {process.department && <span>{process.department}</span>}
              <span className="flex items-center gap-1.5">
                <Calendar size={12} />
                {new Date(process.openedAt).toLocaleDateString('es-CL')} · {daysOpen}d abierto
              </span>
            </div>
          </div>
        </div>
      </div>

      {process.notes && (
        <div className="rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 px-4 py-3 text-sm text-gray-600 dark:text-zinc-400">
          {process.notes}
        </div>
      )}

      {/* Pipeline */}
      <ProcessStageView process={JSON.parse(JSON.stringify(process))} />
    </div>
  )
}
