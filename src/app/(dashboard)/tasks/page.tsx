import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { ClipboardList } from 'lucide-react'
import type { Metadata } from 'next'
import { TasksTable } from './tasks-table'
import { canAccessFeature } from '@/lib/permissions'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Tareas' }

export default async function TasksPage() {
  const session = await auth()
  const tenantId = session!.user.tenantId
  const userId = session!.user.id
  const role = session!.user.role

  if (role !== 'SUPER_ADMIN') {
    const allowed = await canAccessFeature(tenantId, 'tareas')
    if (!allowed) redirect('/billing?upgrade=tareas')
  }

  const tasks = await db.serviceTask.findMany({
    where: { tenantId },
    include: {
      assignedUser: { select: { id: true, name: true, email: true } },
      service: {
        select: {
          id: true,
          name: true,
          company: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: [{ dueDate: 'asc' }, { createdAt: 'asc' }],
  })

  const serialized = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED',
    assignedUserId: t.assignedUserId,
    assignedUser: t.assignedUser,
    dueDate: t.dueDate?.toISOString() ?? null,
    serviceId: t.service.id,
    serviceName: t.service.name,
    companyId: t.service.company.id,
    companyName: t.service.company.name,
  }))

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50">Tareas</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
          {tasks.length} tarea{tasks.length !== 1 ? 's' : ''} en total · gestión por servicio
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm dark:shadow-none overflow-hidden">
        {tasks.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800">
              <ClipboardList size={22} className="text-gray-400 dark:text-zinc-500" />
            </div>
            <p className="font-medium text-gray-900 dark:text-zinc-100">No hay tareas registradas</p>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
              Las tareas se crean desde el detalle de cada servicio
            </p>
          </div>
        ) : (
          <TasksTable
            tasks={serialized}
            currentUserId={userId}
            canEditAll={role !== 'CLIENT'}
          />
        )}
      </div>
    </div>
  )
}
