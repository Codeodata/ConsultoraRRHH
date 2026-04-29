import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { BILLING_PLANS, formatARS } from '@/lib/mercadopago'
import { SubscribeButton, CancelButton } from './_components/billing-actions'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Building2, Users, CheckCircle2, AlertTriangle, Clock } from 'lucide-react'
import type { Metadata } from 'next'
import type { LucideIcon } from 'lucide-react'

export const metadata: Metadata = { title: 'Facturación' }

const STATUS_CONFIG = {
  TRIAL: { label: 'Prueba gratuita', variant: 'secondary' as const, icon: Clock },
  ACTIVE: { label: 'Activo', variant: 'default' as const, icon: CheckCircle2 },
  PAST_DUE: { label: 'Pago pendiente', variant: 'destructive' as const, icon: AlertTriangle },
  CANCELLED: { label: 'Cancelado', variant: 'destructive' as const, icon: AlertTriangle },
  PAUSED: { label: 'Pausado', variant: 'secondary' as const, icon: Clock },
}

export default async function BillingPage() {
  const session = await auth()
  if (!session || session.user.role !== 'SUPER_ADMIN') redirect('/dashboard')

  const tenantId = session.user.tenantId

  const [subscription, companiesCount, usersCount] = await Promise.all([
    db.subscription.findUnique({
      where: { tenantId },
      include: { payments: { orderBy: { createdAt: 'desc' }, take: 10 } },
    }),
    db.company.count({ where: { tenantId, isActive: true } }),
    db.user.count({ where: { tenantId, isActive: true } }),
  ])

  const isActive =
    subscription?.status === 'ACTIVE' ||
    subscription?.status === 'PAST_DUE' ||
    subscription?.status === 'PAUSED'
  const currentPlan =
    subscription?.planTier ? BILLING_PLANS[subscription.planTier as keyof typeof BILLING_PLANS] : null
  const statusConfig = subscription
    ? STATUS_CONFIG[subscription.status as keyof typeof STATUS_CONFIG]
    : null
  const showPlanCards =
    !subscription || subscription.status === 'CANCELLED' || subscription.status === 'TRIAL'

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50">Facturación</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
          Gestión de tu suscripción y plan
        </p>
      </div>

      {subscription?.status === 'PAST_DUE' && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-4 py-3">
          <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Hay un problema con tu último pago. Actualizá tu método de pago en MercadoPago para
            evitar la suspensión del servicio.
          </p>
        </div>
      )}

      {subscription?.status === 'CANCELLED' && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3">
          <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 dark:text-red-300">
            Tu suscripción fue cancelada. Elegí un plan para continuar usando la plataforma.
          </p>
        </div>
      )}

      {subscription?.status === 'PAUSED' && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-4 py-3">
          <Clock size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Tu suscripción está pausada. Los cobros reanudarán automáticamente cuando se reactive.
          </p>
        </div>
      )}

      {/* Suscripción activa */}
      {isActive && currentPlan && subscription && statusConfig && (
        <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/20">
                <CreditCard size={18} className="text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 dark:text-zinc-100">
                    Plan {currentPlan.name}
                  </p>
                  <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                </div>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
                  {formatARS(currentPlan.price)} / mes
                </p>
              </div>
            </div>
            {subscription.status === 'ACTIVE' && <CancelButton />}
          </div>

          {subscription.currentPeriodEnd && (
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Próximo cobro:{' '}
              <span className="font-medium text-gray-700 dark:text-zinc-300">
                {new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' }).format(
                  subscription.currentPeriodEnd
                )}
              </span>
            </p>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
            <UsageMeter
              icon={Building2}
              label="Empresas"
              current={companiesCount}
              max={currentPlan.maxCompanies}
            />
            <UsageMeter
              icon={Users}
              label="Usuarios activos"
              current={usersCount}
              max={currentPlan.maxUsers}
            />
          </div>
        </div>
      )}

      {/* Cards de planes */}
      {showPlanCards && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
            {subscription?.status === 'TRIAL'
              ? 'Elegí tu plan para comenzar'
              : 'Planes disponibles'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Object.values(BILLING_PLANS).map((plan) => (
              <PlanCard key={plan.tier} plan={plan} recommended={plan.tier === 'BUSINESS'} />
            ))}
          </div>
          <p className="text-xs text-gray-400 dark:text-zinc-500 text-center">
            Los pagos se procesan a través de MercadoPago. Podés cancelar cuando quieras.
          </p>
        </div>
      )}

      {/* Historial de pagos */}
      {subscription && subscription.payments.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-zinc-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
              Historial de pagos
            </h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-zinc-800">
            {subscription.payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">
                    {formatARS(payment.amount)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">
                    {new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(
                      new Date(payment.createdAt)
                    )}
                  </p>
                </div>
                <Badge variant={payment.status === 'approved' ? 'default' : 'secondary'}>
                  {payment.status === 'approved' ? 'Aprobado' : payment.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PlanCard({
  plan,
  recommended,
}: {
  plan: (typeof BILLING_PLANS)[keyof typeof BILLING_PLANS]
  recommended?: boolean
}) {
  return (
    <div
      className={`relative rounded-xl border bg-white dark:bg-zinc-900 shadow-sm p-6 flex flex-col gap-5 ${
        recommended
          ? 'border-brand-300 dark:border-brand-700 ring-1 ring-brand-200 dark:ring-brand-800'
          : 'border-gray-200 dark:border-zinc-800'
      }`}
    >
      {recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-brand-600 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
            Recomendado
          </span>
        </div>
      )}

      <div>
        <h4 className="font-bold text-gray-900 dark:text-zinc-100 text-lg">{plan.name}</h4>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-2xl font-bold text-gray-900 dark:text-zinc-50">
            {formatARS(plan.price)}
          </span>
          <span className="text-sm text-gray-500 dark:text-zinc-400">/ mes</span>
        </div>
        <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">{plan.description}</p>
      </div>

      <ul className="space-y-2 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-300">
            <CheckCircle2 size={14} className="text-brand-500 shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      <SubscribeButton plan={plan.tier as 'STARTER' | 'PRO' | 'BUSINESS'} />
    </div>
  )
}

function UsageMeter({
  icon: Icon,
  label,
  current,
  max,
}: {
  icon: LucideIcon
  label: string
  current: number
  max: number | null
}) {
  if (max === null) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-zinc-400">
            <Icon size={13} />
            <span>{label}</span>
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-zinc-100">
            {current} <span className="text-gray-400 dark:text-zinc-500 font-normal">/ ilimitados</span>
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-zinc-800">
          <div className="h-1.5 w-full rounded-full bg-brand-200 dark:bg-brand-900/40" />
        </div>
      </div>
    )
  }

  const pct = Math.min(Math.round((current / max) * 100), 100)
  const isWarning = pct >= 80
  const isOver = pct >= 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-zinc-400">
          <Icon size={13} />
          <span>{label}</span>
        </div>
        <span
          className={`text-sm font-medium ${
            isOver
              ? 'text-red-600 dark:text-red-400'
              : isWarning
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-gray-900 dark:text-zinc-100'
          }`}
        >
          {current} / {max}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-zinc-800">
        <div
          className={`h-1.5 rounded-full transition-all ${
            isOver ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-brand-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
