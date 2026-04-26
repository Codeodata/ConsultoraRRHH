'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Plus, Target, BarChart2, TrendingUp,
  Loader2, Trash2, CheckCircle, Archive, RotateCcw,
  Paperclip, Download, FileText,
} from 'lucide-react'
import { formatDate, formatFileSize } from '@/lib/utils'
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

interface Doc {
  id: string
  name: string
  fileName: string
  fileSize: number
  mimeType: string
  createdAt: Date
}

interface PerformanceTabsProps {
  employeeId: string
  initialGoals: Goal[]
  initialEvalDocs: Doc[]
  initialDevDocs: Doc[]
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

const MIME_EMOJI: Record<string, string> = {
  pdf: '📄',
  image: '🖼️',
  word: '📝',
  document: '📝',
  excel: '📊',
  sheet: '📊',
}

function docEmoji(mimeType: string): string {
  for (const [key, emoji] of Object.entries(MIME_EMOJI)) {
    if (mimeType.includes(key)) return emoji
  }
  return '📎'
}

function DocSection({
  employeeId,
  category,
  docs,
  setDocs,
}: {
  employeeId: string
  category: 'EVALUATION' | 'DEVELOPMENT'
  docs: Doc[]
  setDocs: React.Dispatch<React.SetStateAction<Doc[]>>
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('name', file.name.replace(/\.[^/.]+$/, ''))
    fd.append('category', category)
    try {
      const res = await fetch(`/api/employees/${employeeId}/documents`, {
        method: 'POST',
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Error al subir archivo'); return }
      setDocs((prev) => [data.data, ...prev])
    } catch {
      setError('Error de conexión')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleDelete(docId: string) {
    const res = await fetch(`/api/employees/${employeeId}/documents/${docId}`, { method: 'DELETE' })
    if (res.ok) setDocs((prev) => prev.filter((d) => d.id !== docId))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-zinc-400">
          {docs.length} archivo{docs.length !== 1 ? 's' : ''} adjunto{docs.length !== 1 ? 's' : ''}
        </span>
        <div>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip"
            onChange={handleUpload}
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <><Loader2 size={12} className="animate-spin" />Subiendo...</>
            ) : (
              <><Paperclip size={12} />Adjuntar archivo</>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}

      {docs.length === 0 ? (
        <div className="py-6 text-center rounded-lg border border-dashed border-gray-200 dark:border-zinc-700">
          <FileText size={18} className="mx-auto mb-1.5 text-gray-300 dark:text-zinc-600" />
          <p className="text-xs text-gray-400 dark:text-zinc-500">Sin archivos adjuntos</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-2.5 rounded-lg border border-gray-100 dark:border-zinc-800 px-3 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors"
            >
              <span className="text-base select-none">{docEmoji(doc.mimeType)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-zinc-100 truncate">{doc.name}</p>
                <p className="text-xs text-gray-400 dark:text-zinc-500">
                  {doc.fileName} · {formatFileSize(doc.fileSize)} · {formatDate(doc.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <a
                  href={`/api/employees/${employeeId}/documents/${doc.id}/download`}
                  download={doc.fileName}
                  className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
                  title="Descargar"
                >
                  <Download size={13} />
                </a>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function PerformanceTabs({ employeeId, initialGoals, initialEvalDocs, initialDevDocs }: PerformanceTabsProps) {
  const [activeTab, setActiveTab] = useState<'objectives' | 'evaluations' | 'development'>('objectives')
  const [goals, setGoals] = useState<Goal[]>(initialGoals)
  const [evalDocs, setEvalDocs] = useState<Doc[]>(initialEvalDocs)
  const [devDocs, setDevDocs] = useState<Doc[]>(initialDevDocs)
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
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-zinc-200">Documentos de evaluación</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Adjunta informes de evaluación, formularios de desempeño y resultados.
              </p>
            </div>
            <DocSection
              employeeId={employeeId}
              category="EVALUATION"
              docs={evalDocs}
              setDocs={setEvalDocs}
            />
          </div>
        )}

        {/* ── Planes de desarrollo ── */}
        {activeTab === 'development' && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-zinc-200">Documentos de desarrollo</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Adjunta planes de carrera, capacitaciones y materiales de desarrollo individual.
              </p>
            </div>
            <DocSection
              employeeId={employeeId}
              category="DEVELOPMENT"
              docs={devDocs}
              setDocs={setDevDocs}
            />
          </div>
        )}
      </div>
    </div>
  )
}
