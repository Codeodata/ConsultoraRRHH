import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { PlanUsageBar } from '@/components/billing/plan-usage-bar'
import { getTenantUsage } from '@/lib/plan-limits'
import type { Metadata } from 'next'
import { Plus, Building2, ArrowRight } from 'lucide-react'

export const metadata: Metadata = { title: 'Empresas' }

export default async function CompaniesPage() {
  const session = await auth()
  const tenantId = session!.user.tenantId

  const [companies, usage] = await Promise.all([
    db.company.findMany({
      where: { tenantId },
      include: { _count: { select: { services: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    getTenantUsage(tenantId, session!.user.role),
  ])

  const atLimit = usage.limits.maxCompanies !== null && usage.usage.companies >= usage.limits.maxCompanies

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50">Empresas clientes</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
            {companies.length} empresa{companies.length !== 1 ? 's' : ''} registrada{companies.length !== 1 ? 's' : ''}
          </p>
        </div>
        {atLimit ? (
          <Button asChild variant="outline">
            <Link href="/billing">Actualizar plan para agregar más</Link>
          </Button>
        ) : (
          <Button asChild>
            <Link href="/companies/new">
              <Plus size={15} />
              Nueva empresa
            </Link>
          </Button>
        )}
      </div>

      <PlanUsageBar
        planName={usage.planName}
        label="Empresas"
        current={usage.usage.companies}
        max={usage.limits.maxCompanies}
        showUpgrade={true}
      />

      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm dark:shadow-none overflow-hidden">
        {companies.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800">
              <Building2 size={22} className="text-gray-400 dark:text-zinc-500" />
            </div>
            <p className="font-medium text-gray-900 dark:text-zinc-100">No hay empresas aún</p>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1 mb-4">Crea tu primera empresa cliente</p>
            <Button asChild size="sm">
              <Link href="/companies/new">
                <Plus size={14} />
                Crear empresa
              </Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>RUT</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Servicios</TableHead>
                <TableHead>Creada</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 text-xs font-bold shrink-0">
                        {company.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-zinc-100 text-sm">{company.name}</p>
                        {company.email && <p className="text-xs text-gray-500 dark:text-zinc-400">{company.email}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-zinc-300 text-sm">{company.rut ?? '—'}</TableCell>
                  <TableCell className="text-gray-600 dark:text-zinc-300 text-sm">{company.contactName ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={company._count.services > 0 ? 'default' : 'secondary'}>
                      {company._count.services} servicio{company._count.services !== 1 ? 's' : ''}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500 dark:text-zinc-400 text-sm">{formatDate(company.createdAt)}</TableCell>
                  <TableCell>
                    <Link
                      href={`/companies/${company.id}`}
                      className="flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium transition-colors"
                    >
                      Ver
                      <ArrowRight size={13} />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
