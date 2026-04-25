import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import Link from 'next/link'
import { getStatusLabel } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/ui/progress-bar'
import type { Metadata } from 'next'
import { Plus, Wrench } from 'lucide-react'

export const metadata: Metadata = { title: 'Servicios' }

function getStatusVariant(status: string): 'warning' | 'info' | 'success' | 'secondary' {
  const map: Record<string, 'warning' | 'info' | 'success' | 'secondary'> = {
    PENDING: 'warning',
    IN_PROGRESS: 'info',
    COMPLETED: 'success',
  }
  return map[status] ?? 'secondary'
}

export default async function ServicesPage() {
  const session = await auth()
  const tenantId = session!.user.tenantId

  const services = await db.service.findMany({
    where: { tenantId },
    include: {
      company: { select: { name: true, id: true } },
      _count: { select: { documents: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50">Servicios</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
            {services.length} servicio{services.length !== 1 ? 's' : ''} registrado{services.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild>
          <Link href="/services/new">
            <Plus size={15} />
            Nuevo servicio
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm dark:shadow-none overflow-hidden">
        {services.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800">
              <Wrench size={22} className="text-gray-400 dark:text-zinc-500" />
            </div>
            <p className="font-medium text-gray-900 dark:text-zinc-100">No hay servicios aún</p>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1 mb-4">Crea el primer servicio para una empresa cliente</p>
            <Button asChild size="sm">
              <Link href="/services/new">
                <Plus size={14} />
                Crear servicio
              </Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-zinc-800">
            {services.map((service) => (
              <Link
                key={service.id}
                href={`/services/${service.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 shrink-0">
                  <Wrench size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-zinc-100 truncate text-sm">{service.name}</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 truncate mt-0.5">{service.company.name}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <ProgressBar value={service.progress} className="w-28 hidden sm:block" showLabel={false} />
                  <span className="text-xs text-gray-400 dark:text-zinc-500 hidden md:block">{service.progress}%</span>
                  <Badge variant={getStatusVariant(service.status)}>
                    {getStatusLabel(service.status)}
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
    </div>
  )
}
