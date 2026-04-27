'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ProgressBar } from '@/components/ui/progress-bar'
import { Wrench } from 'lucide-react'

type ServiceStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'

interface ServiceItem {
  id: string
  name: string
  status: ServiceStatus
  progress: number
  company: { id: string; name: string }
  _count: { documents: number }
}

const statusLabel: Record<ServiceStatus, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En proceso',
  COMPLETED: 'Completado',
}

const statusVariant: Record<ServiceStatus, 'warning' | 'info' | 'success'> = {
  PENDING: 'warning',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
}

const selectClass =
  'h-8 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors'

export function ServicesFilter({ services }: { services: ServiceItem[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | 'ALL'>('ALL')
  const [companyFilter, setCompanyFilter] = useState('ALL')

  const companies = useMemo(() => {
    const map = new Map<string, string>()
    services.forEach((s) => map.set(s.company.id, s.company.name))
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]))
  }, [services])

  const filtered = useMemo(() => {
    return services.filter((s) => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
      if (statusFilter !== 'ALL' && s.status !== statusFilter) return false
      if (companyFilter !== 'ALL' && s.company.id !== companyFilter) return false
      return true
    })
  }, [services, search, statusFilter, companyFilter])

  const hasFilter = search || statusFilter !== 'ALL' || companyFilter !== 'ALL'

  return (
    <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm dark:shadow-none overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 dark:border-zinc-800 px-6 py-4 bg-gray-50/50 dark:bg-zinc-800/20">
        <input
          type="text"
          placeholder="Buscar servicio..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-48 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 px-3 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ServiceStatus | 'ALL')}
          className={selectClass}
        >
          <option value="ALL">Todos los estados</option>
          <option value="PENDING">Pendiente</option>
          <option value="IN_PROGRESS">En proceso</option>
          <option value="COMPLETED">Completado</option>
        </select>
        {companies.length > 1 && (
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className={selectClass}
          >
            <option value="ALL">Todas las empresas</option>
            {companies.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        )}
        {hasFilter && (
          <span className="text-xs text-gray-400 dark:text-zinc-500">
            {filtered.length} de {services.length}
          </span>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-gray-400 dark:text-zinc-500">
            Sin servicios con los filtros aplicados
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-zinc-800">
          {filtered.map((service) => (
            <Link
              key={service.id}
              href={`/services/${service.id}`}
              className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 shrink-0">
                <Wrench size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-zinc-100 truncate text-sm">
                  {service.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-zinc-400 truncate mt-0.5">
                  {service.company.name}
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <ProgressBar value={service.progress} className="w-28 hidden sm:block" showLabel={false} />
                <span className="text-xs text-gray-400 dark:text-zinc-500 hidden md:block">
                  {service.progress}%
                </span>
                <Badge variant={statusVariant[service.status]}>
                  {statusLabel[service.status]}
                </Badge>
                <span className="text-xs text-gray-400 dark:text-zinc-500 hidden lg:block w-14 text-right">
                  {service._count.documents} doc{service._count.documents !== 1 ? 's' : ''}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
