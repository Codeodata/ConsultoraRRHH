import { db } from '@/lib/db'

export async function getUsage(tenantId: string) {
  return db.tenantUsage.findUnique({ where: { tenantId } })
}

export async function incrementCompanies(tenantId: string) {
  await db.tenantUsage.upsert({
    where: { tenantId },
    update: { companies: { increment: 1 } },
    create: { tenantId, companies: 1 },
  })
}

export async function decrementCompanies(tenantId: string) {
  await db.tenantUsage.updateMany({
    where: { tenantId, companies: { gt: 0 } },
    data: { companies: { decrement: 1 } },
  })
}

export async function incrementUsers(tenantId: string) {
  await db.tenantUsage.upsert({
    where: { tenantId },
    update: { users: { increment: 1 } },
    create: { tenantId, users: 1 },
  })
}

export async function decrementUsers(tenantId: string) {
  await db.tenantUsage.updateMany({
    where: { tenantId, users: { gt: 0 } },
    data: { users: { decrement: 1 } },
  })
}

export async function incrementEmployees(tenantId: string) {
  await db.tenantUsage.upsert({
    where: { tenantId },
    update: { employees: { increment: 1 } },
    create: { tenantId, employees: 1 },
  })
}

export async function decrementEmployees(tenantId: string) {
  await db.tenantUsage.updateMany({
    where: { tenantId, employees: { gt: 0 } },
    data: { employees: { decrement: 1 } },
  })
}

export async function addStorageUsage(tenantId: string, bytes: number) {
  await db.tenantUsage.upsert({
    where: { tenantId },
    update: { storageUsed: { increment: bytes } },
    create: { tenantId, storageUsed: bytes },
  })
}

export async function subtractStorageUsage(tenantId: string, bytes: number) {
  await db.tenantUsage.updateMany({
    where: { tenantId },
    data: { storageUsed: { decrement: bytes } },
  })
}
