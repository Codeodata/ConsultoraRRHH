import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getStatusLabel } from '@/lib/utils'
import { ProgressBar } from '@/components/ui/progress-bar'
import { PortalTaskList } from '@/components/portal/task-list-with-rating'
import {
  Wrench,
  GitPullRequestArrow,
  CheckCircle2,
  Clock,
  FileText,
  ArrowRight,
  PauseCircle,
  XCircle,
  CalendarDays,
  ListTodo,
  Layers,
  CircleCheck,
  Users,
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Mi Portal' }

const STAGE_LABELS: Record<string, string> = {
  RECLUTAMIENTO: 'Reclutamiento',
  SELECCION: 'Selección',
  PRE_INGRESO: 'Pre-ingreso',
  ALTA_LEGAJO: 'Alta / Legajo',
  ONBOARDING: 'Onboarding',
  SEGUIMIENTO: 'Seguimiento',
}

const STAGE_ORDER = ['RECLUTAMIENTO', 'SELECCION', 'PRE_INGRESO', 'ALTA_LEGAJO', 'ONBOARDING', 'SEGUIMIENTO']

const STAGE_DOT: Record<string, string> = {
  RECLUTAMIENTO: 'bg-blue-500',
  SELECCION: 'bg-amber-500',
  PRE_INGRESO: 'bg-orange-500',
  ALTA_LEGAJO: 'bg-emerald-500',
  ONBOARDING: 'bg-violet-500',
  SEGUIMIENTO: 'bg-rose-500',
}

const PROCESS_STATUS_CONFIG = {
  ACTIVE:    { icon: Clock,         color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-900/20',    label: 'Activo' },
  COMPLETED: { icon: CircleCheck,   color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', label: 'Completado' },
  ON_HOLD:   { icon: PauseCircle,   color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20',  label: 'En pausa' },
  CANCELLED: { icon: XCircle,       color: 'text-red-400',     bg: 'bg-red-50 dark:bg-red-900/20',      label: 'Cancelado' },
} as const

const SERVICE_STATUS_CONFIG = {
  PENDING:     { label: 'Pendiente',  dot: 'bg-yellow-400', text: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  IN_PROGRESS: { label: 'En proceso', dot: 'bg-blue-400',   text: 'text-blue-700 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
  COMPLETED:   { label: 'Finalizado', dot: 'bg-emerald-400', text: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
}

const TASK_STATUS_CONFIG = {
  PENDING:     { label: 'Pendiente',  color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' },
  IN_PROGRESS: { label: 'En proceso', color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
  COMPLETED:   { label: 'Completada', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
}

function formatShortDate(date: Date | null) {
  if (!date) return null
  return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' }).format(new Date(date))
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export default async function PortalPage() {
  const session = await auth()
  if (!session?.user.companyId) redirect('/login')

  const company = await db.company.findFirst({
    where: { id: session.user.companyId, tenantId: session.user.tenantId },
    include: {
      services: {
        include: {
          _count: { select: { documents: true, tasks: true } },
          tasks: { orderBy: { createdAt: 'desc' }, take: 20 },
        },
        orderBy: { updatedAt: 'desc' },
      },
      recruitmentProcesses: {
        where: { status: { not: 'CANCELLED' } },
        include: { _count: { select: { candidates: true } } },
        orderBy: { updatedAt: 'desc' },
        take: 6,
      },
      employees: {
        where: { isActive: true },
        select: { id: true, name: true, position: true, department: true, email: true },
        orderBy: { name: 'asc' },
      },
    },
  })

  if (!company) redirect('/login')

  const { services, recruitmentProcesses, employees } = company

  const svcPending    = services.filter((s) => s.status === 'PENDING').length
  const svcInProgress = services.filter((s) => s.status === 'IN_PROGRESS').length
  const svcCompleted  = services.filter((s) => s.status === 'COMPLETED').length

  const allTasks = services.flatMap((s) =>
    s.tasks.map((t) => ({ ...t, serviceName: s.name }))
  )
  const pendingTasks    = allTasks.filter((t) => t.status === 'PENDING').length
  const inProgressTasks = allTasks.filter((t) => t.status === 'IN_PROGRESS').length
  const recentTasks     = allTasks.slice(0, 5)

  const activeProcesses = recruitmentProcesses.filter((p) => p.status === 'ACTIVE').length

  const today = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long',
  }).format(new Date())

  return (
    <div className="space-y-8">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-medium text-brand-600 dark:text-brand-400 mb-1">
            {getGreeting()}, {session.user.name?.split(' ')[0] ?? 'bienvenido'}
          </p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-50 tracking-tight">
            {company.name}
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1 capitalize">{today}</p>
        </div>
      </div>

      {/* ── Stats bento ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Servicios activos',
            value: svcInProgress,
            sub: `${svcPending} pendiente${svcPending !== 1 ? 's' : ''}`,
            icon: Layers,
            accent: 'text-brand-600 dark:text-brand-400',
            bg: 'bg-brand-50 dark:bg-brand-900/20',
          },
          {
            label: 'Tareas abiertas',
            value: pendingTasks + inProgressTasks,
            sub: `${inProgressTasks} en progreso`,
            icon: ListTodo,
            accent: 'text-violet-600 dark:text-violet-400',
            bg: 'bg-violet-50 dark:bg-violet-900/20',
          },
          {
            label: 'Procesos activos',
            value: activeProcesses,
            sub: `${recruitmentProcesses.length} total`,
            icon: GitPullRequestArrow,
            accent: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-900/20',
          },
          {
            label: 'Servicios completados',
            value: svcCompleted,
            sub: `${services.length} en total`,
            icon: CheckCircle2,
            accent: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
          },
        ].map(({ label, value, sub, icon: Icon, accent, bg }) => (
          <div
            key={label}
            className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm"
          >
            <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${bg} mb-3`}>
              <Icon size={18} className={accent} />
            </div>
            <div className={`text-3xl font-bold tracking-tight ${accent}`}>{value}</div>
            <div className="text-sm font-medium text-gray-700 dark:text-zinc-200 mt-0.5">{label}</div>
            <div className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Main grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Services (2/3 width) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-zinc-50">Servicios contratados</h2>
            <span className="text-xs text-gray-400 dark:text-zinc-500">{services.length} total</span>
          </div>

          {services.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-6 py-14 text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 dark:bg-zinc-800">
                <Wrench size={20} className="text-gray-400 dark:text-zinc-500" />
              </div>
              <p className="font-medium text-gray-900 dark:text-zinc-100">Sin servicios asignados</p>
              <p className="text-sm text-gray-400 dark:text-zinc-500 mt-1">Contactá a tu consultora para más información</p>
            </div>
          ) : (
            <div className="space-y-3">
              {services.map((service) => {
                const sc = SERVICE_STATUS_CONFIG[service.status as keyof typeof SERVICE_STATUS_CONFIG]
                  ?? { label: service.status, dot: 'bg-gray-400', text: 'text-gray-600', bg: 'bg-gray-50' }
                return (
                  <Link
                    key={service.id}
                    href={`/portal/services/${service.id}`}
                    className="group flex items-start gap-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm hover:shadow-md hover:border-brand-200 dark:hover:border-brand-800 transition-all cursor-pointer"
                  >
                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${sc.bg}`}>
                      <Layers size={16} className={sc.text} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 dark:text-zinc-50 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">
                          {service.name}
                        </h3>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </div>
                      {service.description && (
                        <p className="text-sm text-gray-400 dark:text-zinc-500 mt-0.5 truncate">{service.description}</p>
                      )}
                      <div className="mt-3">
                        <ProgressBar value={service.progress} />
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 dark:text-zinc-500">
                        <span className="flex items-center gap-1">
                          <ListTodo size={12} />
                          {service._count.tasks} tarea{service._count.tasks !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText size={12} />
                          {service._count.documents} doc{service._count.documents !== 1 ? 's' : ''}
                        </span>
                        {service.endDate && (
                          <span className="flex items-center gap-1">
                            <CalendarDays size={12} />
                            Vence {formatShortDate(service.endDate)}
                          </span>
                        )}
                      </div>
                    </div>

                    <ArrowRight
                      size={16}
                      className="shrink-0 mt-1 text-gray-300 dark:text-zinc-600 group-hover:text-brand-500 transition-colors"
                    />
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Right column: tasks + processes */}
        <div className="space-y-6">

          {/* Recent tasks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900 dark:text-zinc-50">Tareas recientes</h2>
              <span className="text-xs text-gray-400 dark:text-zinc-500">{allTasks.length} total</span>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
              <PortalTaskList
                tasks={recentTasks.map((t) => ({
                  id: t.id,
                  serviceId: t.serviceId,
                  title: t.title,
                  serviceName: t.serviceName,
                  status: t.status,
                  rating: t.rating,
                  ratingComment: t.ratingComment,
                }))}
              />
            </div>
          </div>

          {/* Recruitment processes */}
          {recruitmentProcesses.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900 dark:text-zinc-50">Procesos de selección</h2>
                <span className="text-xs text-gray-400 dark:text-zinc-500">{activeProcesses} activo{activeProcesses !== 1 ? 's' : ''}</span>
              </div>

              <div className="space-y-2">
                {recruitmentProcesses.map((p) => {
                  const ps = PROCESS_STATUS_CONFIG[p.status as keyof typeof PROCESS_STATUS_CONFIG]
                    ?? PROCESS_STATUS_CONFIG.ACTIVE
                  const StatusIcon = ps.icon
                  const stageIdx   = STAGE_ORDER.indexOf(p.stage)

                  return (
                    <div
                      key={p.id}
                      className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-zinc-50 truncate">{p.positionTitle}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={`h-2 w-2 rounded-full ${STAGE_DOT[p.stage] ?? 'bg-gray-400'}`} />
                            <span className="text-xs text-gray-500 dark:text-zinc-400">{STAGE_LABELS[p.stage]}</span>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${ps.bg}`}>
                          <StatusIcon size={11} className={ps.color} />
                          <span className={ps.color}>{ps.label}</span>
                        </span>
                      </div>

                      {/* Stage progress dots */}
                      <div className="flex items-center gap-1">
                        {STAGE_ORDER.map((s, i) => (
                          <div
                            key={s}
                            title={STAGE_LABELS[s]}
                            className={`flex-1 h-1.5 rounded-full transition-all ${
                              i < stageIdx  ? 'bg-emerald-400' :
                              i === stageIdx ? (STAGE_DOT[s] ?? 'bg-gray-400') :
                              'bg-gray-100 dark:bg-zinc-800'
                            }`}
                          />
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-400 dark:text-zinc-500">
                        <span>{p._count.candidates} candidato{p._count.candidates !== 1 ? 's' : ''}</span>
                        <span>Abierto {Math.ceil((Date.now() - new Date(p.openedAt).getTime()) / 86400000)}d</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Empleados ──────────────────────────────────────────── */}
      {employees.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 dark:text-zinc-50">Equipo asignado</h2>
            <span className="text-xs text-gray-400 dark:text-zinc-500">
              {employees.length} empleado{employees.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {employees.map((emp) => {
              const initials = emp.name
                .split(' ')
                .slice(0, 2)
                .map((w) => w[0])
                .join('')
                .toUpperCase()
              return (
                <div
                  key={emp.id}
                  className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-4 flex flex-col items-center text-center gap-2"
                >
                  <div className="h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-700 dark:text-brand-300 text-sm font-semibold">
                    {initials}
                  </div>
                  <div className="min-w-0 w-full">
                    <p className="text-sm font-medium text-gray-900 dark:text-zinc-100 truncate">{emp.name}</p>
                    {emp.position && (
                      <p className="text-xs text-gray-500 dark:text-zinc-400 truncate mt-0.5">{emp.position}</p>
                    )}
                    {emp.department && (
                      <p className="text-xs text-gray-400 dark:text-zinc-500 truncate">{emp.department}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
