import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { ServiceForm } from '@/components/services/service-form'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Nuevo servicio' }

export default async function NewServicePage({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string }>
}) {
  const { companyId } = await searchParams
  const session = await auth()
  const tenantId = session!.user.tenantId

  const companies = await db.company.findMany({
    where: { tenantId, isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Nuevo servicio</h2>
        <p className="text-sm text-gray-500 mt-1">Registra un servicio para una empresa cliente</p>
      </div>
      <ServiceForm companies={companies} defaultCompanyId={companyId} />
    </div>
  )
}
