import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { EmployeeForm } from '@/components/employees/employee-form'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Nuevo empleado' }

export default async function NewEmployeePage() {
  const session = await auth()
  const tenantId = session!.user.tenantId

  const [companies, employees] = await Promise.all([
    db.company.findMany({
      where: { tenantId, isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    db.employee.findMany({
      where: { tenantId, isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, position: true, companyId: true },
    }),
  ])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50">Nuevo empleado</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">Completá los datos del empleado</p>
      </div>
      <EmployeeForm companies={companies} employees={employees} />
    </div>
  )
}
