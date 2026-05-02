import { db } from '@/lib/db'
import { getActivePlan } from '@/lib/plan-limits'
import type { PlanTier, Role } from '@prisma/client'
import { NextResponse } from 'next/server'

// --- Feature flags por plan (fuente de verdad) ---
// Analytics y organigrama son features premium: PRO/BUSINESS únicamente.
// El chequeo se hace SIEMPRE en backend; el frontend solo lo refleja.

export type Feature =
  | 'analytics'
  | 'organigrama'
  | 'performance_evaluations'
  | 'job_descriptions'
  | 'procesos'
  | 'tareas'

export const PLAN_FEATURES: Record<PlanTier, Feature[]> = {
  FREE:     [],
  STARTER:  ['job_descriptions', 'tareas', 'procesos'],
  PRO:      ['analytics', 'organigrama', 'performance_evaluations', 'job_descriptions', 'tareas', 'procesos'],
  BUSINESS: ['analytics', 'organigrama', 'performance_evaluations', 'job_descriptions', 'tareas', 'procesos'],
}

// Grupos de roles reutilizables
export const OPERATOR_ROLES: Role[] = ['SUPER_ADMIN', 'OWNER', 'RRHH']
export const ADMIN_ROLES: Role[] = ['SUPER_ADMIN', 'OWNER']

// --- Respuestas de error estándar ---

export function unauthorized() {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
}

export function forbidden(message = 'Acceso denegado') {
  return NextResponse.json({ error: message }, { status: 403 })
}

// --- Guards sincrónicos ---

/**
 * Verifica que el usuario tiene uno de los roles requeridos.
 * Retorna un NextResponse de error, o null si el acceso es válido.
 */
export function requireRole(session: any, roles: Role[]): NextResponse | null {
  if (!session?.user) return unauthorized()
  if (!roles.includes(session.user.role as Role)) return forbidden()
  return null
}

// --- Guards asíncronos ---

/**
 * Verifica que el plan activo del tenant incluye la feature solicitada.
 * SUPER_ADMIN tiene acceso sin restricciones de plan.
 * Retorna un NextResponse de error, o null si el acceso es válido.
 */
export async function requireFeature(
  session: any,
  feature: Feature
): Promise<NextResponse | null> {
  if (!session?.user) return unauthorized()
  if (session.user.role === 'SUPER_ADMIN') return null

  const plan = await getActivePlan(session.user.tenantId)
  if (!(PLAN_FEATURES[plan] as Feature[]).includes(feature)) {
    return NextResponse.json(
      {
        error: 'Esta función no está disponible en tu plan actual.',
        feature,
        currentPlan: plan,
        upgradeRequired: true,
      },
      { status: 403 }
    )
  }
  return null
}

/**
 * Comprueba si el plan activo de un tenant incluye una feature.
 * Útil en Server Components (donde no se puede retornar NextResponse).
 */
export async function canAccessFeature(tenantId: string, feature: Feature): Promise<boolean> {
  const plan = await getActivePlan(tenantId)
  return (PLAN_FEATURES[plan] as Feature[]).includes(feature)
}

// --- Validación de propiedad de recursos ---

/**
 * Verifica que una company pertenece al tenant.
 * Previene inyección de recursos cross-tenant en POST con companyId externo.
 */
export async function validateCompanyOwnership(
  tenantId: string,
  companyId: string
): Promise<boolean> {
  const company = await db.company.findFirst({
    where: { id: companyId, tenantId },
    select: { id: true },
  })
  return company !== null
}
