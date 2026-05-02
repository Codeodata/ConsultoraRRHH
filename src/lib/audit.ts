import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export type AuditAction = 'LOGIN' | 'REGISTER' | 'DELETE' | 'UPDATE_ROLE' | 'UPDATE_PLAN'

interface LogParams {
  action: AuditAction
  tenantId?: string
  userId?: string
  targetId?: string
  targetType?: string
  metadata?: Prisma.InputJsonValue
  ipAddress?: string
}

export async function logAction(params: LogParams): Promise<void> {
  try {
    await db.auditLog.create({ data: params })
  } catch (e) {
    console.error('[audit] failed:', e)
  }
}

export function getIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  )
}
