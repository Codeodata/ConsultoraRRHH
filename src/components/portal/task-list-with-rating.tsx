'use client'

import { useState, useTransition } from 'react'
import { Star, Clock, CheckCircle2, ListTodo } from 'lucide-react'

const TASK_STATUS_CONFIG = {
  PENDING: {
    label: 'Pendiente',
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
  },
  IN_PROGRESS: {
    label: 'En proceso',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  },
  COMPLETED: {
    label: 'Completada',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
  },
}

interface Task {
  id: string
  serviceId: string
  title: string
  serviceName: string
  status: string
  rating: number | null
  ratingComment: string | null
}

function StarWidget({
  serviceId,
  taskId,
  initialRating,
}: {
  serviceId: string
  taskId: string
  initialRating: number | null
}) {
  const [rating, setRating] = useState(initialRating ?? 0)
  const [hovered, setHovered] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(!!initialRating)

  function submitRating(value: number) {
    if (value === rating && saved) return
    setRating(value)
    startTransition(async () => {
      await fetch(`/api/services/${serviceId}/tasks/${taskId}/rate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: value }),
      })
      setSaved(true)
    })
  }

  const display = hovered || rating

  return (
    <div className="flex items-center gap-1 mt-1.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => submitRating(i)}
          disabled={isPending}
          aria-label={`Calificar ${i} estrellas`}
          className="focus:outline-none disabled:opacity-50"
        >
          <Star
            size={13}
            className={
              i <= display
                ? 'text-amber-400 fill-amber-400 transition-colors'
                : 'text-gray-300 dark:text-zinc-600 fill-gray-300 dark:fill-zinc-600 transition-colors'
            }
          />
        </button>
      ))}
      {saved && rating > 0 && (
        <span className="text-[10px] text-gray-400 dark:text-zinc-500 ml-0.5">
          {rating}/5
        </span>
      )}
      {!saved && (
        <span className="text-[10px] text-gray-400 dark:text-zinc-500 ml-0.5">
          Calificá esta tarea
        </span>
      )}
    </div>
  )
}

export function PortalTaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <div className="px-5 py-10 text-center">
        <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 dark:bg-zinc-800">
          <ListTodo size={16} className="text-gray-400 dark:text-zinc-500" />
        </div>
        <p className="text-sm text-gray-400 dark:text-zinc-500">Sin tareas registradas</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-zinc-800">
      {tasks.map((task) => {
        const tc =
          TASK_STATUS_CONFIG[task.status as keyof typeof TASK_STATUS_CONFIG] ??
          TASK_STATUS_CONFIG.PENDING
        return (
          <div key={task.id} className="flex items-start gap-3 px-4 py-3">
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${tc.bg}`}
            >
              {task.status === 'COMPLETED' ? (
                <CheckCircle2 size={12} className={tc.color} />
              ) : task.status === 'IN_PROGRESS' ? (
                <Clock size={11} className={tc.color} />
              ) : (
                <span
                  className={`h-2 w-2 rounded-full ${
                    tc.color.includes('yellow') ? 'bg-yellow-400' : 'bg-gray-400'
                  }`}
                />
              )}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-zinc-200 truncate">
                {task.title}
              </p>
              <p className="text-xs text-gray-400 dark:text-zinc-500 truncate">
                {task.serviceName}
              </p>
              {task.status === 'COMPLETED' && (
                <StarWidget
                  serviceId={task.serviceId}
                  taskId={task.id}
                  initialRating={task.rating}
                />
              )}
            </div>
            <span className={`shrink-0 text-xs font-medium ${tc.color}`}>{tc.label}</span>
          </div>
        )
      })}
    </div>
  )
}
