import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { formatDate, getRoleLabel } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { PlanUsageBar } from '@/components/billing/plan-usage-bar'
import { getTenantUsage } from '@/lib/plan-limits'
import type { Metadata } from 'next'
import { Plus } from 'lucide-react'

export const metadata: Metadata = { title: 'Usuarios' }

function getRoleBadgeVariant(role: string): 'default' | 'info' | 'secondary' {
  const map: Record<string, 'default' | 'info' | 'secondary'> = {
    SUPER_ADMIN: 'default',
    RRHH: 'info',
    CLIENT: 'secondary',
  }
  return map[role] ?? 'secondary'
}

export default async function UsersPage() {
  const session = await auth()

  if (session?.user.role !== 'SUPER_ADMIN') redirect('/dashboard')

  const tenantId = session.user.tenantId

  const [users, usage] = await Promise.all([
    db.user.findMany({
      where: { tenantId },
      include: { company: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    getTenantUsage(tenantId),
  ])

  const atLimit = usage.limits.maxUsers !== null && usage.usage.users >= usage.limits.maxUsers

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50">Usuarios</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
            {users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}
          </p>
        </div>
        {atLimit ? (
          <Button asChild variant="outline">
            <Link href="/billing">Actualizar plan para agregar más</Link>
          </Button>
        ) : (
          <Button asChild>
            <Link href="/users/new">
              <Plus size={15} />
              Nuevo usuario
            </Link>
          </Button>
        )}
      </div>

      <PlanUsageBar
        planName={usage.planName}
        label="Usuarios del sistema"
        current={usage.usage.users}
        max={usage.limits.maxUsers}
        showUpgrade={true}
      />

      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm dark:shadow-none overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Creado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-xs font-semibold shrink-0">
                      {user.name?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-zinc-100 text-sm">{user.name ?? '—'}</p>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {getRoleLabel(user.role)}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-600 dark:text-zinc-300 text-sm">{user.company?.name ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant={user.isActive ? 'success' : 'destructive'}>
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-500 dark:text-zinc-400 text-sm">{formatDate(user.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
