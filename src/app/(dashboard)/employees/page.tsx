import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EmployeesTable } from '@/components/employees/employees-table'
import type { Metadata } from 'next'
import { Plus, Users, GitBranch } from 'lucide-react'

export const metadata: Metadata = { title: 'Empleados' }

export default async function EmployeesPage() {
  const session = await auth()
  const tenantId = session!.user.tenantId

  const employees = await db.employee.findMany({
    where: { tenantId },
    include: {
      company: { select: { name: true } },
      reportsTo: { select: { name: true } },
      _count: { select: { reports: true } },
    },
    orderBy: [{ company: { name: 'asc' } }, { name: 'asc' }],
  })

  const active = employees.filter((e) => e.isActive).length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50">Empleados</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
            {active} activo{active !== 1 ? 's' : ''} · {employees.length} total
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="secondary">
            <Link href="/employees/org-chart">
              <GitBranch size={15} />
              Organigrama
            </Link>
          </Button>
          <Button asChild>
            <Link href="/employees/new">
              <Plus size={15} />
              Nuevo empleado
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm dark:shadow-none overflow-hidden">
        {employees.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800">
              <Users size={22} className="text-gray-400 dark:text-zinc-500" />
            </div>
            <p className="font-medium text-gray-900 dark:text-zinc-100">No hay empleados aún</p>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1 mb-4">
              Registrá el primer empleado
            </p>
            <Button asChild size="sm">
              <Link href="/employees/new">
                <Plus size={14} />
                Crear empleado
              </Link>
            </Button>
          </div>
        ) : (
          <EmployeesTable employees={employees} />
        )}
      </div>
    </div>
  )
}
