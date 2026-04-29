import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'
import { Plus, GitPullRequestArrow, Clock, CheckCircle2, PauseCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Procesos de selección' }

const STAGE_LABELS: Record<string, string> = {
  RECLUTAMIENTO: 'Reclutamiento',
  SELECCION: 'Selección',
  PRE_INGRESO: 'Pre-ingreso',
  ALTA_LEGAJO: 'Alta / Legajo',
  ONBOARDING: 'Onboarding',
  SEGUIMIENTO: 'Seguimiento',
}

const STAGE_COLORS: Record<string, string> = {
  RECLUTAMIENTO: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  SELECCION: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  PRE_INGRESO: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  ALTA_LEGAJO: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  ONBOARDING: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  SEGUIMIENTO: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
}

const STAGE_ORDER = ['RECLUTAMIENTO', 'SELECCION', 'PRE_INGRESO', 'ALTA_LEGAJO', 'ONBOARDING', 'SEGUIMIENTO']

const STATUS_ICONS = {
  ACTIVE: <Clock size={12} className="text-blue-500" />,
  COMPLETED: <CheckCircle2 size={12} className="text-emerald-500" />,
  ON_HOLD: <PauseCircle size={12} className="text-amber-500" />,
  CANCELLED: <XCircle size={12} className="text-red-400" />,
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Activo',
  COMPLETED: 'Completado',
  ON_HOLD: 'En pausa',
  CANCELLED: 'Cancelado',
}

export default async function ProcesosPage() {
  const session = await auth()
  const tenantId = session!.user.tenantId

  const processes = await db.recruitmentProcess.findMany({
    where: { tenantId },
    include: {
      company: { select: { name: true } },
      _count: { select: { candidates: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  const active = processes.filter((p) => p.status === 'ACTIVE').length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50">Procesos de selección</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
            {active} activo{active !== 1 ? 's' : ''} · {processes.length} total
          </p>
        </div>
        <Button asChild>
          <Link href="/procesos/new">
            <Plus size={15} /> Nuevo proceso
          </Link>
        </Button>
      </div>

      {processes.length === 0 ? (
        <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800">
            <GitPullRequestArrow size={22} className="text-gray-400 dark:text-zinc-500" />
          </div>
          <p className="font-medium text-gray-900 dark:text-zinc-100">No hay procesos aún</p>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1 mb-4">
            Creá el primer proceso de selección
          </p>
          <Button asChild size="sm">
            <Link href="/procesos/new">
              <Plus size={14} /> Crear proceso
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {processes.map((p) => {
            const stageIdx = STAGE_ORDER.indexOf(p.stage)
            const daysOpen = Math.ceil((Date.now() - new Date(p.openedAt).getTime()) / 86400000)

            return (
              <Link
                key={p.id}
                href={`/procesos/${p.id}`}
                className="group rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm dark:shadow-none hover:shadow-md hover:border-gray-300 dark:hover:border-zinc-700 transition-all p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-zinc-50 truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {p.positionTitle}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{p.company.name}</p>
                  </div>
                  <span className={cn('shrink-0 text-xs font-medium px-2.5 py-1 rounded-full', STAGE_COLORS[p.stage])}>
                    {STAGE_LABELS[p.stage]}
                  </span>
                </div>

                {/* Mini stage progress */}
                <div className="flex gap-1">
                  {STAGE_ORDER.map((s, i) => (
                    <div
                      key={s}
                      className={cn(
                        'flex-1 h-1.5 rounded-full transition-all',
                        i < stageIdx ? 'bg-emerald-400' :
                        i === stageIdx ? (STAGE_COLORS[s].includes('blue') ? 'bg-blue-400' :
                          STAGE_COLORS[s].includes('amber') ? 'bg-amber-400' :
                          STAGE_COLORS[s].includes('orange') ? 'bg-orange-400' :
                          STAGE_COLORS[s].includes('emerald') ? 'bg-emerald-400' :
                          STAGE_COLORS[s].includes('violet') ? 'bg-violet-400' : 'bg-rose-400') :
                        'bg-gray-100 dark:bg-zinc-800'
                      )}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400">
                  <div className="flex items-center gap-1">
                    {STATUS_ICONS[p.status as keyof typeof STATUS_ICONS]}
                    {STATUS_LABELS[p.status]}
                  </div>
                  <div className="flex items-center gap-3">
                    <span>{p._count.candidates} candidato{p._count.candidates !== 1 ? 's' : ''}</span>
                    <span>{daysOpen}d abierto</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
