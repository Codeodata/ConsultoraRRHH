import { db } from '@/lib/db'
import type { PlanTier } from '@prisma/client'

// --- Límites por plan (fuente de verdad) ---
// FREE:     1 empresa, 15 empleados totales, 2 usuarios, 50MB storage
// STARTER:  5 empresas, empleados ∞, 8 usuarios, 2GB storage
// PRO:      20 empresas, empleados ∞, 25 usuarios, 10GB storage
// BUSINESS: 60 empresas, empleados ∞, usuarios ∞, storage ∞

export type PlanLimits = {
  maxCompanies: number | null
  maxEmployees: number | null
  maxUsers: number | null
  maxStorageBytes: number | null
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  FREE:     { maxCompanies: 1,  maxEmployees: 15,   maxUsers: 2,    maxStorageBytes: 50 * 1024 * 1024 },
  STARTER:  { maxCompanies: 5,  maxEmployees: null,  maxUsers: 8,    maxStorageBytes: 2 * 1024 * 1024 * 1024 },
  PRO:      { maxCompanies: 20, maxEmployees: null,  maxUsers: 25,   maxStorageBytes: 10 * 1024 * 1024 * 1024 },
  BUSINESS: { maxCompanies: 60, maxEmployees: null,  maxUsers: null, maxStorageBytes: null },
}

export const PLAN_NAMES: Record<PlanTier, string> = {
  FREE:     'Free',
  STARTER:  'Starter',
  PRO:      'Pro',
  BUSINESS: 'Business',
}

export type LimitDenied = {
  allowed: false
  reason: string
  upgradeRequired: true
  currentPlan: PlanTier
}

export type LimitCheckResult = { allowed: true } | LimitDenied

// Devuelve el plan activo del tenant. Si no tiene suscripción o está cancelada → FREE.
export async function getActivePlan(tenantId: string): Promise<PlanTier> {
  const sub = await db.subscription.findUnique({
    where: { tenantId },
    select: { planTier: true, status: true },
  })
  if (!sub || sub.status === 'CANCELLED') return 'FREE'
  return sub.planTier
}

export async function canCreateCompany(tenantId: string, role?: string): Promise<LimitCheckResult> {
  if (role === 'OWNER' || role === 'SUPER_ADMIN') return { allowed: true }
  const plan = await getActivePlan(tenantId)
  const { maxCompanies } = PLAN_LIMITS[plan]
  if (maxCompanies === null) return { allowed: true }

  const count = await db.company.count({ where: { tenantId, isActive: true } })
  if (count >= maxCompanies) {
    return {
      allowed: false,
      reason: `Tu plan ${PLAN_NAMES[plan]} permite hasta ${maxCompanies} empresa${maxCompanies > 1 ? 's' : ''}. Actualizá tu plan para agregar más.`,
      upgradeRequired: true,
      currentPlan: plan,
    }
  }
  return { allowed: true }
}

export async function canCreateEmployee(tenantId: string, role?: string): Promise<LimitCheckResult> {
  if (role === 'OWNER' || role === 'SUPER_ADMIN') return { allowed: true }
  const plan = await getActivePlan(tenantId)
  const { maxEmployees } = PLAN_LIMITS[plan]
  if (maxEmployees === null) return { allowed: true }

  const count = await db.employee.count({ where: { tenantId, isActive: true } })
  if (count >= maxEmployees) {
    return {
      allowed: false,
      reason: `Tu plan ${PLAN_NAMES[plan]} permite hasta ${maxEmployees} empleados en total. Actualizá tu plan para agregar más.`,
      upgradeRequired: true,
      currentPlan: plan,
    }
  }
  return { allowed: true }
}

export async function canCreateUser(tenantId: string, role?: string): Promise<LimitCheckResult> {
  if (role === 'OWNER' || role === 'SUPER_ADMIN') return { allowed: true }
  const plan = await getActivePlan(tenantId)
  const { maxUsers } = PLAN_LIMITS[plan]
  if (maxUsers === null) return { allowed: true }

  const count = await db.user.count({ where: { tenantId, isActive: true } })
  if (count >= maxUsers) {
    return {
      allowed: false,
      reason: `Tu plan ${PLAN_NAMES[plan]} permite hasta ${maxUsers} usuario${maxUsers > 1 ? 's' : ''}. Actualizá tu plan para agregar más.`,
      upgradeRequired: true,
      currentPlan: plan,
    }
  }
  return { allowed: true }
}

export function getPlanLimits(plan: PlanTier): PlanLimits {
  return PLAN_LIMITS[plan]
}

export async function canUploadFile(
  tenantId: string,
  fileSizeBytes: number,
): Promise<LimitCheckResult> {
  const plan = await getActivePlan(tenantId)
  const { maxStorageBytes } = PLAN_LIMITS[plan]
  if (maxStorageBytes === null) return { allowed: true }

  const usage = await db.tenantUsage.findUnique({ where: { tenantId } })
  const currentBytes = Number(usage?.storageUsed ?? 0)

  if (currentBytes + fileSizeBytes > maxStorageBytes) {
    const maxMb = maxStorageBytes / (1024 * 1024)
    const label = maxMb >= 1024 ? `${maxMb / 1024}GB` : `${maxMb}MB`
    return {
      allowed: false,
      reason: `Tu plan ${PLAN_NAMES[plan]} permite hasta ${label} de almacenamiento. Actualizá tu plan para subir más archivos.`,
      upgradeRequired: true,
      currentPlan: plan,
    }
  }
  return { allowed: true }
}

export async function getTenantUsage(tenantId: string, role?: string) {
  const plan = await getActivePlan(tenantId)
  const baseLimits = PLAN_LIMITS[plan]
  // OWNER y SUPER_ADMIN no tienen restricciones de límite
  const limits: PlanLimits = (role === 'OWNER' || role === 'SUPER_ADMIN')
    ? { maxCompanies: null, maxEmployees: null, maxUsers: null, maxStorageBytes: null }
    : baseLimits

  const [companies, employees, users] = await Promise.all([
    db.company.count({ where: { tenantId, isActive: true } }),
    db.employee.count({ where: { tenantId, isActive: true } }),
    db.user.count({ where: { tenantId, isActive: true } }),
  ])

  return {
    plan,
    planName: PLAN_NAMES[plan],
    limits,
    usage: { companies, employees, users },
  }
}
