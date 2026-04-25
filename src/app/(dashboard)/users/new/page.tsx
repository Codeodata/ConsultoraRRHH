import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { UserForm } from '@/components/users/user-form'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Nuevo usuario' }

export default async function NewUserPage() {
  const session = await auth()
  if (session?.user.role !== 'SUPER_ADMIN') redirect('/dashboard')

  const companies = await db.company.findMany({
    where: { tenantId: session.user.tenantId, isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="p-6 max-w-xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Nuevo usuario</h2>
        <p className="text-sm text-gray-500 mt-1">Crea un usuario con acceso al sistema</p>
      </div>
      <UserForm companies={companies} />
    </div>
  )
}
