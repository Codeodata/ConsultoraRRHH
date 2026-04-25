import { Role, ServiceStatus } from '@prisma/client'

export type { Role, ServiceStatus }

export interface TenantUser {
  id: string
  email: string
  name: string | null
  role: Role
  tenantId: string
  companyId: string | null
}

export interface DashboardStats {
  totalCompanies: number
  totalServices: number
  servicesInProgress: number
  servicesCompleted: number
  servicesPending: number
}

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}
