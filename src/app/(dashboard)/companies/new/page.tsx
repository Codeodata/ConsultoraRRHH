import type { Metadata } from 'next'
import { CompanyForm } from '@/components/companies/company-form'

export const metadata: Metadata = { title: 'Nueva empresa' }

export default function NewCompanyPage() {
  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Nueva empresa cliente</h2>
        <p className="text-sm text-gray-500 mt-1">Completa los datos para registrar una nueva empresa</p>
      </div>
      <CompanyForm />
    </div>
  )
}
