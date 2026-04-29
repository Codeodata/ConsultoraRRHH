'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Check,
  ChevronRight,
  Plus,
  X,
  UserCheck,
  AlertTriangle,
  Calendar,
  ExternalLink,
  CheckSquare,
  Square,
  Trash2,
  ArrowRight,
  Users,
  Stethoscope,
  FileCheck,
  BookOpen,
  Bell,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type ProcessStage = 'RECLUTAMIENTO' | 'SELECCION' | 'PRE_INGRESO' | 'ALTA_LEGAJO' | 'ONBOARDING' | 'SEGUIMIENTO'
type CandidateStatus = 'RECIBIDO' | 'FILTRADO' | 'PRESELECCIONADO' | 'ENTREVISTADO' | 'SELECCIONADO' | 'RECHAZADO'

interface Candidate {
  id: string
  name: string
  email: string | null
  phone: string | null
  status: CandidateStatus
  interviewDate: string | null
  interviewNotes: string | null
  evaluationScore: number | null
  evaluationNotes: string | null
  medicalExamDate: string | null
  medicalExamExpiry: string | null
  medicalExamResult: string | null
  validationsOk: boolean
  isSelected: boolean
  rejectionReason: string | null
  notes: string | null
}

interface OnboardingTask {
  id: string
  title: string
  description: string | null
  category: string
  dueDate: string | null
  completedAt: string | null
  notes: string | null
}

interface ProcessData {
  id: string
  positionTitle: string
  department: string | null
  stage: ProcessStage
  status: string
  openedAt: string
  closedAt: string | null
  notes: string | null
  company: { id: string; name: string }
  employee: { id: string; name: string; position: string | null } | null
  candidates: Candidate[]
  onboardingTasks: OnboardingTask[]
}

// ─── Stage config ─────────────────────────────────────────────────────────────

const STAGES: { id: ProcessStage; label: string; icon: React.ReactNode; color: string; bg: string; ring: string; text: string }[] = [
  {
    id: 'RECLUTAMIENTO', label: 'Reclutamiento',
    icon: <Users size={14} />,
    color: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30', ring: 'ring-blue-500', text: 'text-blue-700 dark:text-blue-300',
  },
  {
    id: 'SELECCION', label: 'Selección',
    icon: <UserCheck size={14} />,
    color: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30', ring: 'ring-amber-500', text: 'text-amber-700 dark:text-amber-300',
  },
  {
    id: 'PRE_INGRESO', label: 'Pre-ingreso',
    icon: <Stethoscope size={14} />,
    color: 'bg-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30', ring: 'ring-orange-500', text: 'text-orange-700 dark:text-orange-300',
  },
  {
    id: 'ALTA_LEGAJO', label: 'Alta / Legajo',
    icon: <FileCheck size={14} />,
    color: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30', ring: 'ring-emerald-500', text: 'text-emerald-700 dark:text-emerald-300',
  },
  {
    id: 'ONBOARDING', label: 'Onboarding',
    icon: <BookOpen size={14} />,
    color: 'bg-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/30', ring: 'ring-violet-500', text: 'text-violet-700 dark:text-violet-300',
  },
  {
    id: 'SEGUIMIENTO', label: 'Seguimiento',
    icon: <Bell size={14} />,
    color: 'bg-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/30', ring: 'ring-rose-500', text: 'text-rose-700 dark:text-rose-300',
  },
]

const STAGE_ORDER = STAGES.map((s) => s.id)

const CANDIDATE_STATUS_LABELS: Record<CandidateStatus, string> = {
  RECIBIDO: 'Recibido',
  FILTRADO: 'Filtrado',
  PRESELECCIONADO: 'Preseleccionado',
  ENTREVISTADO: 'Entrevistado',
  SELECCIONADO: 'Seleccionado',
  RECHAZADO: 'Rechazado',
}

const CANDIDATE_STATUS_COLORS: Record<CandidateStatus, string> = {
  RECIBIDO: 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300',
  FILTRADO: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  PRESELECCIONADO: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  ENTREVISTADO: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  SELECCIONADO: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  RECHAZADO: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ProcessStageView({ process: initial }: { process: ProcessData }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [process, setProcess] = useState(initial)
  const [activeStage, setActiveStage] = useState<ProcessStage>(initial.stage)

  const currentStageIndex = STAGE_ORDER.indexOf(process.stage)
  const activeStageIndex = STAGE_ORDER.indexOf(activeStage)

  async function advanceStage() {
    if (currentStageIndex >= STAGE_ORDER.length - 1) return
    const next = STAGE_ORDER[currentStageIndex + 1]
    const res = await fetch(`/api/processes/${process.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: next }),
    })
    if (res.ok) {
      const json = await res.json()
      setProcess(json.data)
      setActiveStage(next)
    }
  }

  async function completeProcess() {
    const res = await fetch(`/api/processes/${process.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'COMPLETED', closedAt: new Date().toISOString() }),
    })
    if (res.ok) {
      startTransition(() => router.refresh())
    }
  }

  const activeStageConfig = STAGES.find((s) => s.id === activeStage)!

  return (
    <div className="space-y-6">
      {/* Stage stepper */}
      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm dark:shadow-none overflow-x-auto">
        <div className="flex items-center min-w-max">
          {STAGES.map((stage, idx) => {
            const isPast = idx < currentStageIndex
            const isCurrent = idx === currentStageIndex
            const isActive = stage.id === activeStage
            const isClickable = idx <= currentStageIndex

            return (
              <div key={stage.id} className="flex items-center">
                <button
                  onClick={() => isClickable && setActiveStage(stage.id)}
                  disabled={!isClickable}
                  className={cn(
                    'flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg transition-all',
                    isClickable ? 'cursor-pointer' : 'cursor-default opacity-40',
                    isActive && 'ring-2 ' + stage.ring + ' ' + stage.bg,
                  )}
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all',
                      isPast && 'bg-emerald-500 text-white',
                      isCurrent && !isActive && stage.color + ' text-white',
                      isCurrent && isActive && stage.color + ' text-white ring-4 ring-offset-2 ' + stage.ring,
                      !isPast && !isCurrent && 'bg-gray-200 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400',
                    )}
                  >
                    {isPast ? <Check size={14} /> : <span>{idx + 1}</span>}
                  </div>
                  <span
                    className={cn(
                      'text-xs font-medium whitespace-nowrap',
                      isActive ? stage.text : isPast ? 'text-emerald-600 dark:text-emerald-400' : isCurrent ? stage.text : 'text-gray-400 dark:text-zinc-500'
                    )}
                  >
                    {stage.label}
                  </span>
                </button>

                {idx < STAGES.length - 1 && (
                  <div className={cn(
                    'w-8 h-0.5 mx-1',
                    idx < currentStageIndex ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-zinc-700'
                  )} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Stage content */}
      <div className={cn('rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm dark:shadow-none overflow-hidden')}>
        <div className={cn('px-5 py-3 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between', activeStageConfig.bg)}>
          <div className="flex items-center gap-2">
            <span className={cn('flex h-6 w-6 items-center justify-center rounded-full text-white text-xs', activeStageConfig.color)}>
              {activeStageConfig.icon}
            </span>
            <h3 className={cn('font-semibold text-sm', activeStageConfig.text)}>
              Etapa {activeStageIndex + 1}: {activeStageConfig.label}
            </h3>
          </div>
          {activeStage === process.stage && process.stage !== 'SEGUIMIENTO' && process.status === 'ACTIVE' && (
            <Button size="sm" onClick={advanceStage} disabled={isPending}>
              Avanzar etapa <ArrowRight size={13} />
            </Button>
          )}
          {activeStage === 'SEGUIMIENTO' && process.status === 'ACTIVE' && (
            <Button size="sm" variant="secondary" onClick={completeProcess} disabled={isPending}>
              <Check size={13} /> Completar proceso
            </Button>
          )}
        </div>

        <div className="p-5">
          {activeStage === 'RECLUTAMIENTO' && (
            <StageReclutamiento process={process} onUpdate={setProcess} />
          )}
          {activeStage === 'SELECCION' && (
            <StageSeleccion process={process} onUpdate={setProcess} />
          )}
          {activeStage === 'PRE_INGRESO' && (
            <StagePreIngreso process={process} onUpdate={setProcess} />
          )}
          {activeStage === 'ALTA_LEGAJO' && (
            <StageAlta process={process} onUpdate={setProcess} />
          )}
          {activeStage === 'ONBOARDING' && (
            <StageOnboarding process={process} onUpdate={setProcess} />
          )}
          {activeStage === 'SEGUIMIENTO' && (
            <StageSeguimiento process={process} />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Etapa 1: Reclutamiento ───────────────────────────────────────────────────

function StageReclutamiento({ process, onUpdate }: { process: ProcessData; onUpdate: (p: ProcessData) => void }) {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' })

  const total = process.candidates.length
  const filtrados = process.candidates.filter((c) => ['FILTRADO', 'PRESELECCIONADO', 'ENTREVISTADO', 'SELECCIONADO'].includes(c.status)).length
  const rechazados = process.candidates.filter((c) => c.status === 'RECHAZADO').length
  const tasaRechazo = total > 0 ? Math.round((rechazados / total) * 100) : 0

  async function addCandidate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch(`/api/processes/${process.id}/candidates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const json = await res.json()
      onUpdate({ ...process, candidates: [...process.candidates, json.data] })
      setForm({ name: '', email: '', phone: '', notes: '' })
      setShowForm(false)
    }
    setLoading(false)
  }

  async function updateStatus(candidateId: string, status: CandidateStatus) {
    const res = await fetch(`/api/processes/${process.id}/candidates/${candidateId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      onUpdate({
        ...process,
        candidates: process.candidates.map((c) => c.id === candidateId ? { ...c, status } : c),
      })
    }
  }

  async function removeCandidate(candidateId: string) {
    const res = await fetch(`/api/processes/${process.id}/candidates/${candidateId}`, { method: 'DELETE' })
    if (res.ok) {
      onUpdate({ ...process, candidates: process.candidates.filter((c) => c.id !== candidateId) })
    }
  }

  return (
    <div className="space-y-5">
      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-gray-100 dark:border-zinc-800 p-3 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-zinc-50">{total}</p>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">CVs recibidos</p>
        </div>
        <div className="rounded-lg border border-gray-100 dark:border-zinc-800 p-3 text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{filtrados}</p>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">Filtrados</p>
        </div>
        <div className="rounded-lg border border-gray-100 dark:border-zinc-800 p-3 text-center">
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{tasaRechazo}%</p>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">Tasa de rechazo</p>
        </div>
      </div>

      {/* Candidate list */}
      {process.candidates.length > 0 ? (
        <div className="rounded-lg border border-gray-100 dark:border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-zinc-800/50 text-left">
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-zinc-400">Candidato</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-zinc-400">Contacto</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-zinc-400">Estado</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-zinc-400 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {process.candidates.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-zinc-100">{c.name}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-zinc-400">
                    {c.email && <div>{c.email}</div>}
                    {c.phone && <div>{c.phone}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={c.status}
                      onChange={(e) => updateStatus(c.id, e.target.value as CandidateStatus)}
                      className={cn(
                        'text-xs font-medium rounded-full px-2.5 py-1 border-0 outline-none cursor-pointer',
                        CANDIDATE_STATUS_COLORS[c.status]
                      )}
                    >
                      {(Object.keys(CANDIDATE_STATUS_LABELS) as CandidateStatus[]).map((s) => (
                        <option key={s} value={s}>{CANDIDATE_STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => removeCandidate(c.id)}
                      className="text-gray-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-200 dark:border-zinc-700 py-8 text-center">
          <Users size={28} className="mx-auto text-gray-300 dark:text-zinc-600 mb-2" />
          <p className="text-sm text-gray-500 dark:text-zinc-400">No hay CVs cargados aún</p>
        </div>
      )}

      {/* Add candidate form */}
      {showForm ? (
        <form onSubmit={addCandidate} className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 p-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Agregar candidato</p>
            <button type="button" onClick={() => setShowForm(false)} className="text-blue-400 hover:text-blue-600">
              <X size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Nombre *</Label>
              <Input
                required
                placeholder="Juan Pérez"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                placeholder="juan@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Teléfono</Label>
              <Input
                placeholder="+56 9 1234 5678"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Notas</Label>
              <Input
                placeholder="Referencia, fuente..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="h-8 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="submit" size="sm" disabled={loading}>{loading ? 'Guardando...' : 'Agregar'}</Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </form>
      ) : (
        <Button variant="secondary" size="sm" onClick={() => setShowForm(true)}>
          <Plus size={13} /> Agregar CV
        </Button>
      )}
    </div>
  )
}

// ─── Etapa 2: Selección ───────────────────────────────────────────────────────

function StageSeleccion({ process, onUpdate }: { process: ProcessData; onUpdate: (p: ProcessData) => void }) {
  const preselected = process.candidates.filter((c) =>
    ['PRESELECCIONADO', 'ENTREVISTADO', 'SELECCIONADO'].includes(c.status)
  )
  const [editId, setEditId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Candidate>>({})
  const [saving, setSaving] = useState(false)

  function startEdit(c: Candidate) {
    setEditId(c.id)
    setEditData({
      interviewDate: c.interviewDate ? c.interviewDate.slice(0, 10) : '',
      interviewNotes: c.interviewNotes || '',
      evaluationScore: c.evaluationScore,
      evaluationNotes: c.evaluationNotes || '',
    })
  }

  async function saveEdit(candidateId: string) {
    setSaving(true)
    const res = await fetch(`/api/processes/${process.id}/candidates/${candidateId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData),
    })
    if (res.ok) {
      const json = await res.json()
      onUpdate({ ...process, candidates: process.candidates.map((c) => c.id === candidateId ? { ...c, ...json.data } : c) })
      setEditId(null)
    }
    setSaving(false)
  }

  async function selectCandidate(candidateId: string) {
    const res = await fetch(`/api/processes/${process.id}/candidates/${candidateId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'SELECCIONADO', isSelected: true }),
    })
    if (res.ok) {
      onUpdate({
        ...process,
        candidates: process.candidates.map((c) =>
          c.id === candidateId
            ? { ...c, status: 'SELECCIONADO' as CandidateStatus, isSelected: true }
            : { ...c, isSelected: false }
        ),
      })
    }
  }

  async function rejectCandidate(candidateId: string) {
    const res = await fetch(`/api/processes/${process.id}/candidates/${candidateId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'RECHAZADO' }),
    })
    if (res.ok) {
      onUpdate({ ...process, candidates: process.candidates.map((c) => c.id === candidateId ? { ...c, status: 'RECHAZADO' as CandidateStatus } : c) })
    }
  }

  if (preselected.length === 0) {
    return (
      <div className="py-8 text-center">
        <UserCheck size={28} className="mx-auto text-gray-300 dark:text-zinc-600 mb-2" />
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          No hay candidatos preseleccionados. Marcá candidatos como <strong>Preseleccionado</strong> en la etapa anterior.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {preselected.map((c) => (
        <div key={c.id} className={cn(
          'rounded-lg border p-4 space-y-3',
          c.isSelected
            ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20'
            : 'border-gray-100 dark:border-zinc-800'
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-900 dark:text-zinc-100">{c.name}</p>
              {c.isSelected && (
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                  <Check size={10} /> Candidato seleccionado
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {!c.isSelected && c.status !== 'RECHAZADO' && (
                <>
                  <Button size="sm" onClick={() => selectCandidate(c.id)}>
                    <UserCheck size={12} /> Seleccionar
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => rejectCandidate(c.id)}>
                    <X size={12} /> Rechazar
                  </Button>
                </>
              )}
              <Button size="sm" variant="secondary" onClick={() => editId === c.id ? setEditId(null) : startEdit(c)}>
                {editId === c.id ? 'Cancelar' : 'Editar'}
              </Button>
            </div>
          </div>

          {editId === c.id ? (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <Label className="text-xs">Fecha de entrevista</Label>
                <Input
                  type="date"
                  value={editData.interviewDate as string || ''}
                  onChange={(e) => setEditData({ ...editData, interviewDate: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Puntaje evaluación (1–10)</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={editData.evaluationScore ?? ''}
                  onChange={(e) => setEditData({ ...editData, evaluationScore: e.target.value ? Number(e.target.value) : null })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1 col-span-2">
                <Label className="text-xs">Notas de entrevista</Label>
                <textarea
                  rows={2}
                  value={editData.interviewNotes as string || ''}
                  onChange={(e) => setEditData({ ...editData, interviewNotes: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>
              <div className="space-y-1 col-span-2">
                <Label className="text-xs">Notas de evaluación</Label>
                <textarea
                  rows={2}
                  value={editData.evaluationNotes as string || ''}
                  onChange={(e) => setEditData({ ...editData, evaluationNotes: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>
              <div className="col-span-2">
                <Button size="sm" onClick={() => saveEdit(c.id)} disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 dark:text-zinc-500">Entrevista</p>
                <p className="text-gray-700 dark:text-zinc-300">
                  {c.interviewDate ? new Date(c.interviewDate).toLocaleDateString('es-CL') : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-zinc-500">Puntaje</p>
                <p className="text-gray-700 dark:text-zinc-300">
                  {c.evaluationScore != null ? `${c.evaluationScore}/10` : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-zinc-500">Estado</p>
                <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', CANDIDATE_STATUS_COLORS[c.status])}>
                  {CANDIDATE_STATUS_LABELS[c.status]}
                </span>
              </div>
              {c.interviewNotes && (
                <div className="col-span-3">
                  <p className="text-xs text-gray-400 dark:text-zinc-500">Notas</p>
                  <p className="text-gray-600 dark:text-zinc-400">{c.interviewNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Etapa 3: Pre-ingreso ─────────────────────────────────────────────────────

function StagePreIngreso({ process, onUpdate }: { process: ProcessData; onUpdate: (p: ProcessData) => void }) {
  const selected = process.candidates.find((c) => c.isSelected)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    medicalExamDate: selected?.medicalExamDate?.slice(0, 10) || '',
    medicalExamExpiry: selected?.medicalExamExpiry?.slice(0, 10) || '',
    medicalExamResult: selected?.medicalExamResult || '',
    validationsOk: selected?.validationsOk || false,
  })

  async function save() {
    if (!selected) return
    setSaving(true)
    const res = await fetch(`/api/processes/${process.id}/candidates/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const json = await res.json()
      onUpdate({ ...process, candidates: process.candidates.map((c) => c.id === selected.id ? { ...c, ...json.data } : c) })
    }
    setSaving(false)
  }

  if (!selected) {
    return (
      <div className="py-8 text-center">
        <Stethoscope size={28} className="mx-auto text-gray-300 dark:text-zinc-600 mb-2" />
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          No hay candidato seleccionado. Seleccioná el candidato final en la etapa anterior.
        </p>
      </div>
    )
  }

  const examOk = form.medicalExamResult === 'APTO'
  const examDaysLeft = form.medicalExamExpiry
    ? Math.ceil((new Date(form.medicalExamExpiry).getTime() - Date.now()) / 86400000)
    : null

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
          <UserCheck size={16} />
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900 dark:text-zinc-100">{selected.name}</p>
          <p className="text-xs text-gray-500 dark:text-zinc-400">{selected.email || selected.phone || 'Sin contacto registrado'}</p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
          <Stethoscope size={14} /> Examen médico
        </h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Fecha de examen</Label>
            <Input
              type="date"
              value={form.medicalExamDate}
              onChange={(e) => setForm({ ...form, medicalExamDate: e.target.value })}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Vencimiento</Label>
            <Input
              type="date"
              value={form.medicalExamExpiry}
              onChange={(e) => setForm({ ...form, medicalExamExpiry: e.target.value })}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Resultado</Label>
            <select
              value={form.medicalExamResult}
              onChange={(e) => setForm({ ...form, medicalExamResult: e.target.value })}
              className="w-full h-8 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Pendiente</option>
              <option value="APTO">Apto</option>
              <option value="NO_APTO">No apto</option>
              <option value="APTO_CON_RESTRICCIONES">Apto con restricciones</option>
            </select>
          </div>
        </div>
        {examDaysLeft !== null && (
          <p className={cn('text-xs mt-2', examDaysLeft <= 30 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-zinc-400')}>
            {examDaysLeft <= 0 ? '⚠ Examen vencido' : `Vence en ${examDaysLeft} días`}
          </p>
        )}
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
          <FileCheck size={14} /> Validaciones
        </h4>
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.validationsOk}
            onChange={(e) => setForm({ ...form, validationsOk: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm text-gray-700 dark:text-zinc-300">Validaciones de antecedentes completadas</span>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <Button size="sm" onClick={save} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
        {examOk && form.validationsOk && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <Check size={13} /> Listo para continuar
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Etapa 4: Alta / Legajo ───────────────────────────────────────────────────

function StageAlta({ process, onUpdate }: { process: ProcessData; onUpdate: (p: ProcessData) => void }) {
  const selected = process.candidates.find((c) => c.isSelected)

  return (
    <div className="space-y-5">
      {selected && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
            <UserCheck size={16} />
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900 dark:text-zinc-100">{selected.name}</p>
            <p className="text-xs text-gray-500 dark:text-zinc-400">Candidato seleccionado</p>
          </div>
        </div>
      )}

      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
          <FileCheck size={14} /> Creación en sistema
        </h4>
        {process.employee ? (
          <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-zinc-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800">
              <UserCheck size={16} className="text-gray-500 dark:text-zinc-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm text-gray-900 dark:text-zinc-100">{process.employee.name}</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400">{process.employee.position || 'Empleado'}</p>
            </div>
            <Button size="sm" variant="secondary" asChild>
              <a href={`/employees`}>
                <ExternalLink size={12} /> Ver empleado
              </a>
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-200 dark:border-zinc-700 p-4 text-center">
            <p className="text-sm text-gray-500 dark:text-zinc-400 mb-3">
              El empleado aún no fue creado en el sistema
            </p>
            <Button size="sm" asChild>
              <a href="/employees/new">
                <Plus size={13} /> Crear empleado
              </a>
            </Button>
          </div>
        )}
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-3">Checklist de documentación</h4>
        <div className="space-y-2 text-sm">
          {['Contrato de trabajo firmado', 'Ficha de datos personales', 'Constancia de CBU', 'Certificado de estudios', 'Foto carnet', 'Legajo digital creado'].map((item) => (
            <label key={item} className="flex items-center gap-2.5 cursor-pointer text-gray-700 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-zinc-100">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
              {item}
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-400 dark:text-zinc-500 mt-2">Este checklist es orientativo, no se persiste.</p>
      </div>
    </div>
  )
}

// ─── Etapa 5: Onboarding ──────────────────────────────────────────────────────

function StageOnboarding({ process, onUpdate }: { process: ProcessData; onUpdate: (p: ProcessData) => void }) {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: '', category: 'INDUCCION', description: '', dueDate: '' })

  const byCategory = {
    INDUCCION: process.onboardingTasks.filter((t) => t.category === 'INDUCCION'),
    CAPACITACION: process.onboardingTasks.filter((t) => t.category === 'CAPACITACION'),
  }

  const total = process.onboardingTasks.length
  const completed = process.onboardingTasks.filter((t) => t.completedAt).length

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch(`/api/processes/${process.id}/onboarding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const json = await res.json()
      onUpdate({ ...process, onboardingTasks: [...process.onboardingTasks, json.data] })
      setForm({ title: '', category: 'INDUCCION', description: '', dueDate: '' })
      setShowForm(false)
    }
    setLoading(false)
  }

  async function toggleTask(task: OnboardingTask) {
    const completedAt = task.completedAt ? null : new Date().toISOString()
    const res = await fetch(`/api/processes/${process.id}/onboarding/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completedAt }),
    })
    if (res.ok) {
      onUpdate({
        ...process,
        onboardingTasks: process.onboardingTasks.map((t) =>
          t.id === task.id ? { ...t, completedAt } : t
        ),
      })
    }
  }

  async function deleteTask(taskId: string) {
    const res = await fetch(`/api/processes/${process.id}/onboarding/${taskId}`, { method: 'DELETE' })
    if (res.ok) {
      onUpdate({ ...process, onboardingTasks: process.onboardingTasks.filter((t) => t.id !== taskId) })
    }
  }

  const TaskItem = ({ task }: { task: OnboardingTask }) => (
    <div className="flex items-start gap-2.5 py-2">
      <button onClick={() => toggleTask(task)} className="mt-0.5 shrink-0">
        {task.completedAt
          ? <CheckSquare size={16} className="text-emerald-500" />
          : <Square size={16} className="text-gray-400 dark:text-zinc-500" />
        }
      </button>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm', task.completedAt ? 'line-through text-gray-400 dark:text-zinc-500' : 'text-gray-800 dark:text-zinc-200')}>
          {task.title}
        </p>
        {task.dueDate && (
          <p className="text-xs text-gray-400 dark:text-zinc-500 flex items-center gap-1 mt-0.5">
            <Calendar size={10} /> {new Date(task.dueDate).toLocaleDateString('es-CL')}
          </p>
        )}
      </div>
      <button onClick={() => deleteTask(task.id)} className="text-gray-300 dark:text-zinc-600 hover:text-red-400 transition-colors mt-0.5">
        <Trash2 size={13} />
      </button>
    </div>
  )

  return (
    <div className="space-y-5">
      {total > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500 rounded-full transition-all"
              style={{ width: `${total ? (completed / total) * 100 : 0}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 dark:text-zinc-400 whitespace-nowrap">
            {completed}/{total} completadas
          </span>
        </div>
      )}

      {(['INDUCCION', 'CAPACITACION'] as const).map((cat) => (
        <div key={cat}>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-2">
            {cat === 'INDUCCION' ? 'Inducción' : 'Capacitación inicial'}
          </h4>
          {byCategory[cat].length > 0 ? (
            <div className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {byCategory[cat].map((t) => <TaskItem key={t.id} task={t} />)}
            </div>
          ) : (
            <p className="text-xs text-gray-400 dark:text-zinc-500 py-2">Sin tareas</p>
          )}
        </div>
      ))}

      {showForm ? (
        <form onSubmit={addTask} className="rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">Nueva tarea</p>
            <button type="button" onClick={() => setShowForm(false)} className="text-violet-400"><X size={14} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 col-span-2">
              <Label className="text-xs">Título *</Label>
              <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-8 text-sm" placeholder="Ej: Presentar a los equipos" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Categoría</Label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full h-8 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="INDUCCION">Inducción</option>
                <option value="CAPACITACION">Capacitación</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Fecha límite</Label>
              <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="h-8 text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={loading}>{loading ? 'Guardando...' : 'Agregar'}</Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </form>
      ) : (
        <Button variant="secondary" size="sm" onClick={() => setShowForm(true)}>
          <Plus size={13} /> Agregar tarea
        </Button>
      )}
    </div>
  )
}

// ─── Etapa 6: Seguimiento ─────────────────────────────────────────────────────

function StageSeguimiento({ process }: { process: ProcessData }) {
  const selected = process.candidates.find((c) => c.isSelected)

  const examExpiry = selected?.medicalExamExpiry ? new Date(selected.medicalExamExpiry) : null
  const examDaysLeft = examExpiry
    ? Math.ceil((examExpiry.getTime() - Date.now()) / 86400000)
    : null

  const alerts = []
  if (examDaysLeft !== null && examDaysLeft <= 60) {
    alerts.push({
      type: examDaysLeft <= 0 ? 'danger' : 'warning',
      message: examDaysLeft <= 0
        ? 'Examen médico vencido'
        : `Examen médico vence en ${examDaysLeft} días (${examExpiry!.toLocaleDateString('es-CL')})`,
    })
  }

  return (
    <div className="space-y-5">
      {process.employee && (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-zinc-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800">
            <UserCheck size={16} className="text-gray-500 dark:text-zinc-400" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm text-gray-900 dark:text-zinc-100">{process.employee.name}</p>
            <p className="text-xs text-gray-500 dark:text-zinc-400">{process.employee.position || 'Empleado'}</p>
          </div>
          <Button size="sm" variant="secondary" asChild>
            <a href={`/employees`}>
              <ExternalLink size={12} /> Ver legajo
            </a>
          </Button>
        </div>
      )}

      {alerts.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 flex items-center gap-2">
            <Bell size={14} /> Alertas
          </h4>
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={cn(
                'flex items-start gap-2.5 rounded-lg p-3 text-sm',
                alert.type === 'danger'
                  ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-900'
                  : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-900'
              )}
            >
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              {alert.message}
            </div>
          ))}
        </div>
      )}

      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-3">Resumen del proceso</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border border-gray-100 dark:border-zinc-800 p-3">
            <p className="text-xs text-gray-400 dark:text-zinc-500">CVs analizados</p>
            <p className="text-lg font-bold text-gray-900 dark:text-zinc-50">{process.candidates.length}</p>
          </div>
          <div className="rounded-lg border border-gray-100 dark:border-zinc-800 p-3">
            <p className="text-xs text-gray-400 dark:text-zinc-500">Tareas onboarding</p>
            <p className="text-lg font-bold text-gray-900 dark:text-zinc-50">
              {process.onboardingTasks.filter((t) => t.completedAt).length}/{process.onboardingTasks.length}
            </p>
          </div>
          <div className="rounded-lg border border-gray-100 dark:border-zinc-800 p-3">
            <p className="text-xs text-gray-400 dark:text-zinc-500">Examen médico</p>
            <p className={cn('text-sm font-semibold', examDaysLeft !== null && examDaysLeft <= 0 ? 'text-red-600' : 'text-gray-900 dark:text-zinc-50')}>
              {selected?.medicalExamResult === 'APTO' ? 'Apto' : selected?.medicalExamResult || '—'}
            </p>
          </div>
          <div className="rounded-lg border border-gray-100 dark:border-zinc-800 p-3">
            <p className="text-xs text-gray-400 dark:text-zinc-500">Venc. examen</p>
            <p className={cn('text-sm font-semibold', examDaysLeft !== null && examDaysLeft <= 30 ? 'text-amber-600' : 'text-gray-900 dark:text-zinc-50')}>
              {examExpiry ? examExpiry.toLocaleDateString('es-CL') : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
