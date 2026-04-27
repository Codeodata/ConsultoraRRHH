'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ClipboardList, Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'

interface TaskRow {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  assignedUserId: string | null
  assignedUser: { id: string; name: string | null; email: string } | null
  dueDate: string | null
  serviceId: string
  serviceName: string
  companyId: string
  companyName: string
}

interface TasksTableProps {
  tasks: TaskRow[]
  currentUserId: string
  canEditAll: boolean
}

const statusLabel: Record<TaskStatus, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En proceso',
  COMPLETED: 'Completada',
}

const statusVariant: Record<TaskStatus, 'warning' | 'info' | 'success'> = {
  PENDING: 'warning',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
}

const filterSelectClass =
  'h-8 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 px-2 py-1 text-xs shadow-sm focus-visible:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors'

const statusSelectClass =
  'h-7 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 px-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors disabled:opacity-50'

export function TasksTable({ tasks: initialTasks, currentUserId, canEditAll }: TasksTableProps) {
  const [tasks, setTasks] = useState<TaskRow[]>(initialTasks)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL')
  const [companyFilter, setCompanyFilter] = useState('ALL')
  const [assignedFilter, setAssignedFilter] = useState('ALL')
  const [updating, setUpdating] = useState<string | null>(null)

  const companies = useMemo(() => {
    const map = new Map<string, string>()
    tasks.forEach((t) => map.set(t.companyId, t.companyName))
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]))
  }, [tasks])

  const assignedUsers = useMemo(() => {
    const map = new Map<string, string>()
    tasks.forEach((t) => {
      if (t.assignedUser) {
        map.set(t.assignedUser.id, t.assignedUser.name ?? t.assignedUser.email)
      }
    })
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]))
  }, [tasks])

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (search) {
        const q = search.toLowerCase()
        if (!t.title.toLowerCase().includes(q) && !(t.description ?? '').toLowerCase().includes(q)) return false
      }
      if (statusFilter !== 'ALL' && t.status !== statusFilter) return false
      if (companyFilter !== 'ALL' && t.companyId !== companyFilter) return false
      if (assignedFilter !== 'ALL') {
        if (assignedFilter === 'UNASSIGNED' && t.assignedUserId !== null) return false
        if (assignedFilter !== 'UNASSIGNED' && t.assignedUserId !== assignedFilter) return false
      }
      return true
    })
  }, [tasks, search, statusFilter, companyFilter, assignedFilter])

  const hasFilter = search || statusFilter !== 'ALL' || companyFilter !== 'ALL' || assignedFilter !== 'ALL'

  async function handleStatusChange(task: TaskRow, newStatus: TaskStatus) {
    setUpdating(task.id)
    const res = await fetch(`/api/services/${task.serviceId}/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    setUpdating(null)
    if (res.ok) {
      const data = await res.json()
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: data.data.status } : t))
      )
    }
  }

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 dark:border-zinc-800 px-6 py-4 bg-gray-50/50 dark:bg-zinc-800/20">
        <input
          type="text"
          placeholder="Buscar tarea..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-48 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 px-3 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'ALL')}
          className={filterSelectClass}
        >
          <option value="ALL">Todos los estados</option>
          <option value="PENDING">Pendiente</option>
          <option value="IN_PROGRESS">En proceso</option>
          <option value="COMPLETED">Completada</option>
        </select>
        {companies.length > 1 && (
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className={filterSelectClass}
          >
            <option value="ALL">Todas las empresas</option>
            {companies.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        )}
        {assignedUsers.length > 0 && (
          <select
            value={assignedFilter}
            onChange={(e) => setAssignedFilter(e.target.value)}
            className={filterSelectClass}
          >
            <option value="ALL">Todos los asignados</option>
            <option value="UNASSIGNED">Sin asignar</option>
            {assignedUsers.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        )}
        {hasFilter && (
          <span className="text-xs text-gray-400 dark:text-zinc-500">
            {filtered.length} de {tasks.length}
          </span>
        )}
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800">
            <ClipboardList size={18} className="text-gray-400 dark:text-zinc-500" />
          </div>
          <p className="text-sm text-gray-400 dark:text-zinc-500">
            {hasFilter ? 'Sin tareas con los filtros aplicados' : 'No hay tareas aún'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-zinc-800">
          {filtered.map((task) => {
            const canUpdate = canEditAll || task.assignedUserId === currentUserId
            const isOverdue =
              task.dueDate &&
              new Date(task.dueDate) < new Date() &&
              task.status !== 'COMPLETED'

            return (
              <div
                key={task.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shrink-0">
                  <ClipboardList size={15} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-zinc-100 text-sm leading-snug">
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 truncate max-w-sm">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-gray-400 dark:text-zinc-500">
                    <Link
                      href={`/services/${task.serviceId}`}
                      className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {task.serviceName}
                    </Link>
                    <span>·</span>
                    <span>{task.companyName}</span>
                    {task.assignedUser && (
                      <>
                        <span>·</span>
                        <span className="text-gray-600 dark:text-zinc-300">
                          {task.assignedUser.name ?? task.assignedUser.email}
                        </span>
                      </>
                    )}
                    {task.dueDate && (
                      <>
                        <span>·</span>
                        <span className={isOverdue ? 'text-red-500 dark:text-red-400 font-medium' : ''}>
                          Vence: {formatDate(new Date(task.dueDate))}
                          {isOverdue && ' ·  vencida'}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {updating === task.id && (
                    <Loader2 size={13} className="animate-spin text-gray-400 dark:text-zinc-500" />
                  )}
                  {canUpdate ? (
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                      disabled={updating === task.id}
                      className={statusSelectClass}
                    >
                      <option value="PENDING">Pendiente</option>
                      <option value="IN_PROGRESS">En proceso</option>
                      <option value="COMPLETED">Completada</option>
                    </select>
                  ) : (
                    <Badge variant={statusVariant[task.status]}>
                      {statusLabel[task.status]}
                    </Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
