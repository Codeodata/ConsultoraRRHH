import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { EmployeeForm } from '@/components/employees/employee-form'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export const metadata: Metadata = { title: 'Editar empleado' }

export default async function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const tenantId = session!.user.tenantId

  const [employee, companies, employees] = await Promise.all([
    db.employee.findFirst({
      where: { id, tenantId },
      select: {
        id: true, name: true, rut: true, email: true, phone: true,
        position: true, department: true, companyId: true,
        reportsToId: true, startDate: true, isActive: true,
      },
    }),
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

  if (!employee) notFound()

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400 mb-1.5">
          <Link href="/employees" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            Empleados
          </Link>
          <ChevronRight size={12} />
          <Link href={`/employees/${id}`} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            {employee.name}
          </Link>
          <ChevronRight size={12} />
          <span className="text-gray-700 dark:text-zinc-200">Editar</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50">Editar empleado</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
          Los cambios de cargo y departamento quedan registrados automáticamente en el historial.
        </p>
      </div>
      <EmployeeForm companies={companies} employees={employees} employee={employee} />
    </div>
  )
}
