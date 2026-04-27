import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'
import { Plus, Wrench } from 'lucide-react'
import { ServicesFilter } from './services-filter'

export const metadata: Metadata = { title: 'Servicios' }

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

      {services.length === 0 ? (
        <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm dark:shadow-none py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800">
            <Wrench size={22} className="text-gray-400 dark:text-zinc-500" />
          </div>
          <p className="font-medium text-gray-900 dark:text-zinc-100">No hay servicios aún</p>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1 mb-4">
            Crea el primer servicio para una empresa cliente
          </p>
          <Button asChild size="sm">
            <Link href="/services/new">
              <Plus size={14} />
              Crear servicio
            </Link>
          </Button>
        </div>
      ) : (
        <ServicesFilter services={services} />
      )}
    </div>
  )
}
