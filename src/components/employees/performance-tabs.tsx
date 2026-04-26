'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Plus, Target, BarChart2, TrendingUp,
  Loader2, Trash2, CheckCircle, Archive, RotateCcw,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

type GoalStatus = 'ACTIVE' | 'CLOSED' | 'ARCHIVED'

interface Goal {
  id: string
  name: string
  startDate: Date | null
  endDate: Date | null
  status: GoalStatus
  createdAt: Date
}

interface PerformanceTabsProps {
  employeeId: string
  initialGoals: Goal[]
}

const TABS = [
  { key: 'objectives' as const, label: 'Objetivos', icon: Target },
  { key: 'evaluations' as const, label: 'Evaluación de desempeño', icon: BarChart2 },
  { key: 'development' as const, label: 'Planes de desarrollo', icon: TrendingUp },
]

const STATUS_LABEL: Record<GoalStatus, string> = {
  ACTIVE: 'Activo',
  CLOSED: 'Cerrado',
  ARCHIVED: 'Archivado',
}

const STATUS_VARIANT: Record<GoalStatus, 'success' | 'secondary' | 'outline'> = {
  ACTIVE: 'success',
  CLOSED: 'secondary',
  ARCHIVED: 'outline',
}

export function PerformanceTabs({ employeeId, initialGoals }: PerformanceTabsProps) {
  const [activeTab, setActiveTab] = useState<'objectives' | 'evaluations' | 'development'>('objectives')
  const [goals, setGoals] = useState<Goal[]>(initialGoals)
  const [filter, setFilter] = useState<GoalStatus>('ACTIVE')
  const [showForm, setShowForm] = useState(false)
  const [goalName, setGoalName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState('')

  const filtered = goals.filter((g) => g.status === filter)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!goalName.trim()) return
    setCreating(true)
    setFormError('')
    try {
      const res = await fetch(`/api/employees/${employeeId}/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: goalName,
          startDate: startDate || null,
          endDate: endDate || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setFormError(data.error ?? 'Error al crear objetivo'); return }
      setGoals((prev) => [data.data, ...prev])
      setGoalName('')
      setStartDate('')
      setEndDate('')
      setShowForm(false)
      setFilter('ACTIVE')
    } catch {
      setFormError('Error de conexión')
    } finally {
      setCreating(false)
    }
  }

  async function setGoalStatus(goalId: string, status: GoalStatus) {
    const res = await fetch(`/api/employees/${employeeId}/goals/${goalId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) setGoals((prev) => prev.map((g) => (g.id === goalId ? { ...g, status } : g)))
  }

  async function deleteGoal(goalId: string) {
    const res = await fetch(`/api/employees/${employeeId}/goals/${goalId}`, { method: 'DELETE' })
    if (res.ok) setGoals((prev) => prev.filter((g) => g.id !== goalId))
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm dark:shadow-none overflow-hidden flex flex-col h-full">
      {/* Tab header */}
      <div className="flex border-b border-gray-200 dark:border-zinc-800 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap shrink-0',
              activeTab === tab.key
                ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200',
            )}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-5 flex-1">
        {/* ── Objetivos ── */}
        {activeTab === 'objectives' && (
          <div className="space-y-4">
            {/* Filters + action */}
            <div className="flex flex-wrap items-center gap-2">
              {(['ACTIVE', 'CLOSED', 'ARCHIVED'] as GoalStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors',
                    filter === s
                      ? 'bg-brand-600 text-white dark:bg-brand-500'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700',
                  )}
                >
                  {STATUS_LABEL[s]}
                  <span className="opacity-60">{goals.filter((g) => g.status === s).length}</span>
                </button>
              ))}
              <div className="flex-1" />
              <Button size="sm" onClick={() => setShowForm((v) => !v)}>
                <Plus size={13} />
                Crear nuevo objetivo
              </Button>
            </div>

            {/* Inline form */}
            {showForm && (
              <form
                onSubmit={handleCreate}
                className="rounded-lg border border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-900/10 p-4 space-y-3"
              >
                <div className="space-y-1">
                  <Label htmlFor="goal-name">Nombre del objetivo</Label>
                  <Input
                    id="goal-name"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    placeholder="Ej: Aumentar ventas 20%"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="goal-start">Fecha inicio</Label>
                    <Input
                      id="goal-start"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="goal-end">Fecha fin</Label>
                    <Input
                      id="goal-end"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
                {formError && (
                  <p className="text-xs text-red-600 dark:text-red-400">{formError}</p>
                )}
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={creating}>
                    {creating ? (
                      <><Loader2 size={12} className="animate-spin" />Creando...</>
                    ) : (
                      'Crear objetivo'
                    )}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => { setShowForm(false); setFormError('') }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            )}

            {/* Goal list */}
            {filtered.length === 0 ? (
              <div className="py-10 text-center">
                <Target size={22} className="mx-auto mb-2 text-gray-300 dark:text-zinc-600" />
                <p className="text-sm text-gray-400 dark:text-zinc-500">
                  Sin objetivos {STATUS_LABEL[filter].toLowerCase()}s
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-start gap-3 rounded-lg border border-gray-100 dark:border-zinc-800 p-3 hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">{goal.name}</p>
                      {(goal.startDate || goal.endDate) && (
                        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                          {goal.startDate ? formatDate(goal.startDate) : '—'}
                          {' → '}
                          {goal.endDate ? formatDate(goal.endDate) : '—'}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Badge variant={STATUS_VARIANT[goal.status]}>{STATUS_LABEL[goal.status]}</Badge>
                      {goal.status === 'ACTIVE' && (
                        <>
                          <button
                            onClick={() => setGoalStatus(goal.id, 'CLOSED')}
                            title="Cerrar objetivo"
                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-400 dark:text-zinc-500"
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button
                            onClick={() => setGoalStatus(goal.id, 'ARCHIVED')}
                            title="Archivar objetivo"
                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-400 dark:text-zinc-500"
                          >
                            <Archive size={14} />
                          </button>
                        </>
                      )}
                      {goal.status !== 'ACTIVE' && (
                        <button
                          onClick={() => setGoalStatus(goal.id, 'ACTIVE')}
                          title="Reactivar objetivo"
                          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-400 dark:text-zinc-500"
                        >
                          <RotateCcw size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        title="Eliminar objetivo"
                        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Evaluación de desempeño ── */}
        {activeTab === 'evaluations' && (
          <div className="py-10 text-center">
            <BarChart2 size={28} className="mx-auto mb-3 text-gray-300 dark:text-zinc-600" />
            <p className="font-medium text-sm text-gray-700 dark:text-zinc-300">Evaluación de desempeño</p>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1 max-w-xs mx-auto">
              Las evaluaciones de desempeño estarán disponibles próximamente.
            </p>
          </div>
        )}

        {/* ── Planes de desarrollo ── */}
        {activeTab === 'development' && (
          <div className="py-10 text-center">
            <TrendingUp size={28} className="mx-auto mb-3 text-gray-300 dark:text-zinc-600" />
            <p className="font-medium text-sm text-gray-700 dark:text-zinc-300">Planes de desarrollo</p>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1 max-w-xs mx-auto">
              Los planes de desarrollo individual estarán disponibles próximamente.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
