'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const selectClass = cn(
  'flex h-9 w-full rounded-lg border border-gray-300 dark:border-zinc-700',
  'bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-gray-900 dark:text-zinc-100',
  'shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500',
  'focus-visible:border-brand-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors'
)

interface Company {
  id: string
  name: string
}

interface EmployeeOption {
  id: string
  name: string
  position: string | null
  companyId: string
}

interface EmployeeFormProps {
  companies: Company[]
  employees: EmployeeOption[]
  employee?: {
    id: string
    name: string
    rut: string | null
    email: string | null
    personalEmail: string | null
    phone: string | null
    position: string | null
    department: string | null
    companyId: string
    reportsToId: string | null
    startDate: Date | null
    birthDate: Date | null
    address: string | null
    gender: string | null
    isActive: boolean
  }
}

export function EmployeeForm({ companies, employees, employee }: EmployeeFormProps) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [companyId, setCompanyId] = useState(employee?.companyId ?? '')

  const reportsToOptions = employees.filter(
    (e) => e.companyId === companyId && e.id !== employee?.id
  )

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const fd = new FormData(e.currentTarget)
    const body = {
      companyId: fd.get('companyId') as string,
      name: fd.get('name') as string,
      rut: (fd.get('rut') as string) || undefined,
      email: (fd.get('email') as string) || undefined,
      personalEmail: (fd.get('personalEmail') as string) || undefined,
      phone: (fd.get('phone') as string) || undefined,
      position: (fd.get('position') as string) || undefined,
      department: (fd.get('department') as string) || undefined,
      reportsToId: (fd.get('reportsToId') as string) || null,
      startDate: (fd.get('startDate') as string) || null,
      birthDate: (fd.get('birthDate') as string) || null,
      address: (fd.get('address') as string) || undefined,
      gender: (fd.get('gender') as string) || undefined,
      isActive: fd.get('isActive') === 'true',
    }

    try {
      const url = employee ? `/api/employees/${employee.id}` : '/api/employees'
      const method = employee ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Error al guardar el empleado')
        return
      }

      router.push(employee ? `/employees/${employee.id}` : '/employees')
      router.refresh()
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const startDateValue = employee?.startDate
    ? new Date(employee.startDate).toISOString().split('T')[0]
    : ''

  const birthDateValue = employee?.birthDate
    ? new Date(employee.birthDate).toISOString().split('T')[0]
    : ''

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm dark:shadow-none space-y-5"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="companyId">Empresa <span className="text-red-500">*</span></Label>
          <select
            id="companyId"
            name="companyId"
            required
            value={companyId}
            onChange={(e) => { setCompanyId(e.target.value) }}
            className={selectClass}
          >
            <option value="">Seleccionar empresa...</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="name">Nombre completo <span className="text-red-500">*</span></Label>
          <Input id="name" name="name" defaultValue={employee?.name} required placeholder="Juan Pérez" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="rut">RUT</Label>
          <Input id="rut" name="rut" defaultValue={employee?.rut ?? ''} placeholder="12.345.678-9" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Correo laboral</Label>
          <Input id="email" name="email" type="email" defaultValue={employee?.email ?? ''} placeholder="juan@empresa.cl" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="personalEmail">Correo personal</Label>
          <Input id="personalEmail" name="personalEmail" type="email" defaultValue={employee?.personalEmail ?? ''} placeholder="juan@gmail.com" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" name="phone" defaultValue={employee?.phone ?? ''} placeholder="+56 9 1234 5678" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="birthDate">Fecha de nacimiento</Label>
          <Input id="birthDate" name="birthDate" type="date" defaultValue={birthDateValue} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="gender">Género</Label>
          <select
            id="gender"
            name="gender"
            defaultValue={employee?.gender ?? ''}
            className={selectClass}
          >
            <option value="">Sin especificar</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="No binario">No binario</option>
            <option value="Prefiero no decir">Prefiero no decir</option>
          </select>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="address">Lugar de residencia</Label>
          <Input id="address" name="address" defaultValue={employee?.address ?? ''} placeholder="Santiago, Chile" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="position">Cargo</Label>
          <Input id="position" name="position" defaultValue={employee?.position ?? ''} placeholder="Analista Senior" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="department">Departamento</Label>
          <Input id="department" name="department" defaultValue={employee?.department ?? ''} placeholder="Tecnología" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="startDate">Fecha de ingreso</Label>
          <Input id="startDate" name="startDate" type="date" defaultValue={startDateValue} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="isActive">Estado</Label>
          <select
            id="isActive"
            name="isActive"
            defaultValue={employee ? String(employee.isActive) : 'true'}
            className={selectClass}
          >
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="reportsToId">Reporta a</Label>
          <select
            id="reportsToId"
            name="reportsToId"
            defaultValue={employee?.reportsToId ?? ''}
            className={selectClass}
            disabled={!companyId}
          >
            <option value="">Sin jefatura directa</option>
            {reportsToOptions.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}{e.position ? ` — ${e.position}` : ''}
              </option>
            ))}
          </select>
          {!companyId && (
            <p className="text-xs text-gray-400 dark:text-zinc-500">Seleccioná una empresa para ver los empleados disponibles</p>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          <AlertCircle size={15} className="shrink-0" />
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <><Loader2 size={14} className="animate-spin" />Guardando...</>
          ) : (
            employee ? 'Actualizar empleado' : 'Crear empleado'
          )}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
