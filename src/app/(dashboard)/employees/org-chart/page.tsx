import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { Metadata } from 'next'
import { ChevronRight, GitBranch } from 'lucide-react'

export const metadata: Metadata = { title: 'Organigrama' }

type EmployeeNode = {
  id: string
  name: string
  position: string | null
  department: string | null
  isActive: boolean
  reportsToId: string | null
  company: { name: string }
}

type OrgNode = EmployeeNode & { children: OrgNode[] }

function buildTree(employees: EmployeeNode[], parentId: string | null = null): OrgNode[] {
  return employees
    .filter((e) => (e.reportsToId ?? null) === parentId)
    .map((e) => ({ ...e, children: buildTree(employees, e.id) }))
}

function OrgTreeNode({ node, depth = 0 }: { node: OrgNode; depth?: number }) {
  return (
    <div>
      <Link
        href={`/employees/${node.id}`}
        className="flex items-center gap-3 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 text-sm font-bold shrink-0">
          {node.name[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-zinc-100 truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {node.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
            {node.position ?? 'Sin cargo'}
            {node.department ? ` · ${node.department}` : ''}
            {' · '}{node.company.name}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!node.isActive && <Badge variant="secondary">Inactivo</Badge>}
          {node.children.length > 0 && (
            <span className="text-xs text-gray-400 dark:text-zinc-500">
              {node.children.length} reporte{node.children.length !== 1 ? 's' : ''}
            </span>
          )}
          <ChevronRight size={14} className="text-gray-300 dark:text-zinc-600" />
        </div>
      </Link>

      {node.children.length > 0 && (
        <div className="ml-6 pl-6 border-l-2 border-gray-100 dark:border-zinc-800 space-y-0 mt-0">
          {node.children.map((child) => (
            <OrgTreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default async function OrgChartPage() {
  const session = await auth()
  const tenantId = session!.user.tenantId

  const employees = await db.employee.findMany({
    where: { tenantId },
    include: { company: { select: { name: true } } },
    orderBy: { name: 'asc' },
  })

  const tree = buildTree(employees)
  const unlinked = employees.filter(
    (e) => e.reportsToId && !employees.find((r) => r.id === e.reportsToId)
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400 mb-1.5">
            <Link href="/employees" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Empleados
            </Link>
            <ChevronRight size={12} />
            <span className="text-gray-700 dark:text-zinc-200">Organigrama</span>
          </div>
          <div className="flex items-center gap-2">
            <GitBranch size={18} className="text-gray-400 dark:text-zinc-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50">Organigrama</h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
            {employees.length} empleado{employees.length !== 1 ? 's' : ''} · {tree.length} raíz{tree.length !== 1 ? 'ces' : ''}
          </p>
        </div>
      </div>

      {employees.length === 0 ? (
        <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-16 text-center shadow-sm dark:shadow-none">
          <GitBranch size={32} className="mx-auto mb-3 text-gray-300 dark:text-zinc-600" />
          <p className="font-medium text-gray-900 dark:text-zinc-100">Sin empleados registrados</p>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Creá empleados y asigná el campo "Reporta a" para construir el organigrama.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm dark:shadow-none space-y-1">
          {tree.length > 0 ? (
            tree.map((node) => <OrgTreeNode key={node.id} node={node} />)
          ) : (
            <p className="text-sm text-gray-500 dark:text-zinc-400 py-4 text-center">
              Ningún empleado tiene el campo "Reporta a" definido. El organigrama se construye a partir de esas relaciones.
            </p>
          )}

          {unlinked.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
              <p className="text-xs text-gray-400 dark:text-zinc-500 mb-2 px-3">
                Sin jefatura válida ({unlinked.length})
              </p>
              {unlinked.map((emp) => (
                <Link
                  key={emp.id}
                  href={`/employees/${emp.id}`}
                  className="flex items-center gap-3 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 text-xs font-semibold shrink-0">
                    {emp.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">{emp.name}</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">{emp.position ?? '—'}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
