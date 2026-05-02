import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { StatCard } from '@/components/ui/stat-card'
import { Badge } from '@/components/ui/badge'
import { getStatusLabel, formatDate } from '@/lib/utils'
import { DashboardCharts } from '@/components/dashboard/charts'
import { getTenantUsage } from '@/lib/plan-limits'
import { UpgradePrompt } from '@/components/billing/upgrade-prompt'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Building2, Wrench, Clock, CheckCircle2, ArrowRight } from 'lucide-react'

export const metadata: Metadata = { title: 'Dashboard' }

function getStatusVariant(status: string): 'warning' | 'info' | 'success' | 'secondary' {
  const map: Record<string, 'warning' | 'info' | 'success' | 'secondary'> = {
    PENDING: 'warning',
    IN_PROGRESS: 'info',
    COMPLETED: 'success',
  }
  return map[status] ?? 'secondary'
}

export default async function DashboardPage() {
  const session = await auth()
  const tenantId = session!.user.tenantId

  const planUsage = await getTenantUsage(tenantId, session!.user.role)

  const atLimitMsg = (() => {
    const { limits, usage, planName } = planUsage
    if (limits.maxCompanies !== null && usage.companies >= limits.maxCompanies)
      return `Alcanzaste el límite de empresas en el Plan ${planName}. Actualizá para agregar más clientes.`
    if (limits.maxEmployees !== null && usage.employees >= limits.maxEmployees)
      return `Alcanzaste el límite de empleados en el Plan ${planName}. Actualizá para seguir creciendo.`
    if (limits.maxUsers !== null && usage.users >= limits.maxUsers)
      return `Alcanzaste el límite de usuarios en el Plan ${planName}. Actualizá para agregar más miembros al equipo.`
    return null
  })()

  const [
    totalCompanies,
    totalServices,
    servicesInProgress,
    servicesCompleted,
    servicesPending,
    tasksPending,
    tasksInProgress,
    tasksCompleted,
    recentServices,
  ] = await Promise.all([
    db.company.count({ where: { tenantId } }),
    db.service.count({ where: { tenantId } }),
    db.service.count({ where: { tenantId, status: 'IN_PROGRESS' } }),
    db.service.count({ where: { tenantId, status: 'COMPLETED' } }),
    db.service.count({ where: { tenantId, status: 'PENDING' } }),
    db.serviceTask.count({ where: { tenantId, status: 'PENDING' } }),
    db.serviceTask.count({ where: { tenantId, status: 'IN_PROGRESS' } }),
    db.serviceTask.count({ where: { tenantId, status: 'COMPLETED' } }),
    db.service.findMany({
      where: { tenantId },
      include: { company: { select: { name: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    }),
  ])

  const completionRate = totalServices > 0 ? Math.round((servicesCompleted / totalServices) * 100) : 0

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50">Resumen general</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">Vista rápida del estado de la plataforma</p>
      </div>

      {atLimitMsg && <UpgradePrompt message={atLimitMsg} variant="banner" />}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Empresas clientes"
          value={totalCompanies}
          icon={Building2}
          iconClassName="bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400"
        />
        <StatCard
          title="Total servicios"
          value={totalServices}
          icon={Wrench}
          iconClassName="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
        />
        <StatCard
          title="En progreso"
          value={servicesInProgress}
          icon={Clock}
          iconClassName="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
        />
        <StatCard
          title="Finalizados"
          value={servicesCompleted}
          description={`${completionRate}% de tasa de finalización`}
          icon={CheckCircle2}
          iconClassName="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
        />
      </div>

      {/* Servicios recientes */}
      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm dark:shadow-none overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 px-6 py-4">
          <h3 className="font-semibold text-gray-900 dark:text-zinc-50">Servicios recientes</h3>
          <Link
            href="/services"
            className="flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium transition-colors"
          >
            Ver todos
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentServices.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-gray-400 dark:text-zinc-500 text-sm">No hay servicios registrados aún.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-zinc-800">
            {recentServices.map((service) => (
              <Link
                key={service.id}
                href={`/services/${service.id}`}
                className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-zinc-100 truncate text-sm">{service.name}</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 truncate mt-0.5">{service.company.name}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={getStatusVariant(service.status)}>
                    {getStatusLabel(service.status)}
                  </Badge>
                  <div className="text-right hidden sm:block">
                    <div className="w-20">
                      <div className="flex justify-between text-[10px] text-gray-400 dark:text-zinc-500 mb-1">
                        <span>{service.progress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-zinc-700">
                        <div
                          className="h-full rounded-full bg-brand-500 transition-all"
                          style={{ width: `${service.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-zinc-500 hidden md:block w-24 text-right">
                    {formatDate(service.updatedAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Gráficos */}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-zinc-50 mb-4">Análisis</h3>
        <DashboardCharts
          services={{ pending: servicesPending, inProgress: servicesInProgress, completed: servicesCompleted }}
          tasks={{ pending: tasksPending, inProgress: tasksInProgress, completed: tasksCompleted }}
        />
      </div>
    </div>
  )
}
