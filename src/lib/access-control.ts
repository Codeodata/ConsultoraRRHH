import { getActivePlan } from '@/lib/plan-limits'
import { PLAN_FEATURES } from '@/lib/permissions'
import type { Feature } from '@/lib/permissions'
import type { Role } from '@prisma/client'

export type AppRoute =
  | 'dashboard'
  | 'companies'
  | 'employees'
  | 'services'
  | 'documents'
  | 'users'
  | 'billing'
  | 'tasks'
  | 'procesos'
  | 'org-chart'
  | 'analytics'

type RouteAccess = {
  roles: Role[]
  feature?: Feature
}

// Fuente de verdad para acceso a rutas — roles + feature flags por plan.
// El middleware hace la verificación de roles; este módulo añade la capa de plan.
export const ROUTE_ACCESS: Record<AppRoute, RouteAccess> = {
  dashboard:  { roles: ['SUPER_ADMIN', 'OWNER', 'RRHH'] },
  companies:  { roles: ['SUPER_ADMIN', 'OWNER', 'RRHH'] },
  employees:  { roles: ['SUPER_ADMIN', 'OWNER', 'RRHH'] },
  services:   { roles: ['SUPER_ADMIN', 'OWNER', 'RRHH'] },
  documents:  { roles: ['SUPER_ADMIN', 'OWNER', 'RRHH'] },
  users:      { roles: ['SUPER_ADMIN', 'OWNER'] },
  billing:    { roles: ['SUPER_ADMIN', 'OWNER'] },
  tasks:      { roles: ['SUPER_ADMIN', 'OWNER'], feature: 'tareas' },
  procesos:   { roles: ['SUPER_ADMIN', 'OWNER'], feature: 'procesos' },
  'org-chart': { roles: ['SUPER_ADMIN', 'OWNER', 'RRHH'], feature: 'organigrama' },
  analytics:  { roles: ['SUPER_ADMIN', 'OWNER'], feature: 'analytics' },
}

/**
 * Verifica si un usuario puede acceder a una ruta, considerando rol y plan.
 * SUPER_ADMIN siempre tiene acceso completo.
 */
export async function canAccessRoute(
  role: Role,
  tenantId: string,
  route: AppRoute,
): Promise<boolean> {
  const access = ROUTE_ACCESS[route]
  if (!access) return false
  if (!access.roles.includes(role)) return false
  if (role === 'SUPER_ADMIN') return true

  if (access.feature) {
    const plan = await getActivePlan(tenantId)
    return (PLAN_FEATURES[plan] as Feature[]).includes(access.feature)
  }

  return true
}

/**
 * Verificación sincrónica solo por rol (sin consulta a DB).
 * Útil para checks rápidos que no necesitan validar el plan.
 */
export function canAccessRouteByRole(role: Role, route: AppRoute): boolean {
  const access = ROUTE_ACCESS[route]
  if (!access) return false
  return access.roles.includes(role)
}
