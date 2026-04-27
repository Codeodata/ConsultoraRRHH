'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ClipboardList, Trash2, Pencil, X, Check, Plus, Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'

interface AssignedUser {
  id: string
  name: string | null
  email: string
}

interface ServiceTask {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  assignedUserId: string | null
  assignedUser: AssignedUser | null
  dueDate: string | null
}

interface RRHHUser {
  id: string
  name: string | null
  email: string
}

interface ServiceTaskListProps {
  serviceId: string
  tasks: ServiceTask[]
  rrhhUsers: RRHHUser[]
  canEdit: boolean
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

const selectClass =
  'flex h-9 w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500 focus-visible:border-brand-500 dark:focus-visible:ring-brand-400 transition-colors'

function TaskRow({
  serviceId,
  task,
  rrhhUsers,
  canEdit,
  onDelete,
  onUpdate,
}: {
  serviceId: string
  task: ServiceTask
  rrhhUsers: RRHHUser[]
  canEdit: boolean
  onDelete: (id: string) => void
  onUpdate: (updated: ServiceTask) => void
}) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [status, setStatus] = useState<TaskStatus>(task.status)
  const [assignedUserId, setAssignedUserId] = useState(task.assignedUserId ?? '')
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.slice(0, 10) : '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const res = await fetch(`/api/services/${serviceId}/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description: description || undefined,
        status,
        assignedUserId: assignedUserId || null,
        dueDate: dueDate || null,
      }),
    })
    setSaving(false)
    if (res.ok) {
      const data = await res.json()
      onUpdate(data.data)
      setEditing(false)
    }
  }

  function handleCancel() {
    setTitle(task.title)
    setDescription(task.description ?? '')
    setStatus(task.status)
    setAssignedUserId(task.assignedUserId ?? '')
    setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : '')
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="px-6 py-4 space-y-3 bg-gray-50/50 dark:bg-zinc-800/30">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1 col-span-2">
            <Label className="text-xs">Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-8 text-sm" />
          </div>
          <div className="space-y-1 col-span-2">
            <Label className="text-xs">Descripción</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} className="h-8 text-sm" placeholder="Opcional" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Estado</Label>
            <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} className={selectClass}>
              <option value="PENDING">Pendiente</option>
              <option value="IN_PROGRESS">En proceso</option>
              <option value="COMPLETED">Completada</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Fecha límite</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="h-8 text-sm" />
          </div>
          <div className="space-y-1 col-span-2">
            <Label className="text-xs">Asignar a (RRHH)</Label>
            <select value={assignedUserId} onChange={(e) => setAssignedUserId(e.target.value)} className={selectClass}>
              <option value="">Sin asignar</option>
              {rrhhUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.name ?? u.email}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={saving || !title.trim()}>
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
            Guardar
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel}>
            <X size={12} />
            Cancelar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-4 px-6 py-3.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
        <ClipboardList size={15} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-gray-900 dark:text-zinc-100 text-sm">{title}</p>
          <Badge variant={statusVariant[status]}>{statusLabel[status]}</Badge>
        </div>
        {description && (
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{description}</p>
        )}
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {task.assignedUser && (
            <span className="text-xs text-gray-400 dark:text-zinc-500">
              Asignado: <span className="text-gray-600 dark:text-zinc-300">{task.assignedUser.name ?? task.assignedUser.email}</span>
            </span>
          )}
          {dueDate && (
            <span className="text-xs text-gray-400 dark:text-zinc-500">
              Vence: <span className="text-gray-600 dark:text-zinc-300">{formatDate(new Date(dueDate))}</span>
            </span>
          )}
        </div>
      </div>
      {canEdit && (
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors"
            title="Editar tarea"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            title="Eliminar tarea"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

export function ServiceTaskList({ serviceId, tasks: initialTasks, rrhhUsers, canEdit }: ServiceTaskListProps) {
  const [tasks, setTasks] = useState<ServiceTask[]>(initialTasks)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>('PENDING')
  const [assignedUserId, setAssignedUserId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const res = await fetch(`/api/services/${serviceId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description: description || undefined,
        status,
        assignedUserId: assignedUserId || null,
        dueDate: dueDate || null,
      }),
    })

    setSaving(false)
    if (res.ok) {
      const data = await res.json()
      setTasks((prev) => [...prev, data.data])
      setTitle('')
      setDescription('')
      setStatus('PENDING')
      setAssignedUserId('')
      setDueDate('')
      setShowForm(false)
    } else {
      const d = await res.json()
      setError(d.error ?? 'Error al crear la tarea')
    }
  }

  async function handleDelete(taskId: string) {
    const res = await fetch(`/api/services/${serviceId}/tasks/${taskId}`, { method: 'DELETE' })
    if (res.ok) setTasks((prev) => prev.filter((t) => t.id !== taskId))
  }

  function handleUpdate(updated: ServiceTask) {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm dark:shadow-none overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 px-6 py-4">
        <h3 className="font-semibold text-gray-900 dark:text-zinc-50">
          Tareas
          <span className="ml-2 text-xs font-normal text-gray-400 dark:text-zinc-500">({tasks.length})</span>
        </h3>
        {canEdit && (
          <Button size="sm" variant="outline" onClick={() => setShowForm((v) => !v)}>
            {showForm ? <X size={13} /> : <Plus size={13} />}
            {showForm ? 'Cancelar' : 'Nueva tarea'}
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="border-b border-gray-100 dark:border-zinc-800 px-6 py-4 bg-gray-50/50 dark:bg-zinc-800/30 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <Label className="text-xs">Título <span className="text-red-500">*</span></Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Ej: Entrevista inicial" className="h-8 text-sm" />
            </div>
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <Label className="text-xs">Descripción</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opcional" className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Estado</Label>
              <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} className={selectClass}>
                <option value="PENDING">Pendiente</option>
                <option value="IN_PROGRESS">En proceso</option>
                <option value="COMPLETED">Completada</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Fecha límite</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="h-8 text-sm" />
            </div>
            <div className="space-y-1 col-span-2">
              <Label className="text-xs">Asignar a usuario RRHH</Label>
              <select value={assignedUserId} onChange={(e) => setAssignedUserId(e.target.value)} className={selectClass}>
                <option value="">Sin asignar</option>
                {rrhhUsers.map((u) => (
                  <option key={u.id} value={u.id}>{u.name ?? u.email}</option>
                ))}
              </select>
            </div>
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <Button type="submit" size="sm" disabled={saving || !title.trim()}>
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
            Crear tarea
          </Button>
        </form>
      )}

      {tasks.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800">
            <ClipboardList size={18} className="text-gray-400 dark:text-zinc-500" />
          </div>
          <p className="text-sm text-gray-400 dark:text-zinc-500">No hay tareas creadas aún</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-zinc-800">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              serviceId={serviceId}
              task={task}
              rrhhUsers={rrhhUsers}
              canEdit={canEdit}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </div>
  )
}
