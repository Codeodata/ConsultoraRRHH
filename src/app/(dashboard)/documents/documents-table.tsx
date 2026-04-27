'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { FileText, Download, Trash2 } from 'lucide-react'
import { formatDate, formatFileSize } from '@/lib/utils'

interface Doc {
  id: string
  name: string
  fileName: string
  fileSize: number
  createdAt: Date
  serviceId: string
  serviceName: string
  companyName: string
}

interface DocumentsTableProps {
  docs: Doc[]
  canDelete: boolean
}

const selectClass =
  'h-8 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors'

export function DocumentsTable({ docs: initialDocs, canDelete }: DocumentsTableProps) {
  const [docs, setDocs] = useState<Doc[]>(initialDocs)
  const [search, setSearch] = useState('')
  const [companyFilter, setCompanyFilter] = useState('ALL')

  const companies = useMemo(() => {
    return Array.from(new Set(docs.map((d) => d.companyName))).sort()
  }, [docs])

  const filtered = useMemo(() => {
    return docs.filter((d) => {
      if (search) {
        const q = search.toLowerCase()
        if (
          !d.name.toLowerCase().includes(q) &&
          !d.serviceName.toLowerCase().includes(q) &&
          !d.companyName.toLowerCase().includes(q) &&
          !d.fileName.toLowerCase().includes(q)
        ) return false
      }
      if (companyFilter !== 'ALL' && d.companyName !== companyFilter) return false
      return true
    })
  }, [docs, search, companyFilter])

  const hasFilter = search || companyFilter !== 'ALL'

  async function handleDelete(docId: string) {
    const res = await fetch(`/api/documents/${docId}`, { method: 'DELETE' })
    if (res.ok) setDocs((prev) => prev.filter((d) => d.id !== docId))
  }

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 dark:border-zinc-800 px-6 py-4 bg-gray-50/50 dark:bg-zinc-800/20">
        <input
          type="text"
          placeholder="Buscar documento, servicio, empresa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-64 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 px-3 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors"
        />
        {companies.length > 1 && (
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className={selectClass}
          >
            <option value="ALL">Todas las empresas</option>
            {companies.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        )}
        {hasFilter && (
          <span className="text-xs text-gray-400 dark:text-zinc-500">
            {filtered.length} de {docs.length}
          </span>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800">
            <FileText size={18} className="text-gray-400 dark:text-zinc-500" />
          </div>
          <p className="text-sm text-gray-400 dark:text-zinc-500">
            {hasFilter ? 'Sin documentos con los filtros aplicados' : 'No hay documentos'}
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Documento</TableHead>
              <TableHead>Servicio</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Tamaño</TableHead>
              <TableHead>Subido</TableHead>
              <TableHead className="w-28" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 shrink-0">
                      <FileText size={15} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-zinc-100 text-sm">{doc.name}</p>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">{doc.fileName}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/services/${doc.serviceId}`}
                    className="text-sm text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    {doc.serviceName}
                  </Link>
                </TableCell>
                <TableCell className="text-gray-600 dark:text-zinc-300 text-sm">
                  {doc.companyName}
                </TableCell>
                <TableCell className="text-gray-600 dark:text-zinc-300 text-sm">
                  {formatFileSize(doc.fileSize)}
                </TableCell>
                <TableCell className="text-gray-500 dark:text-zinc-400 text-sm">
                  {formatDate(doc.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button asChild variant="outline" size="sm">
                      <a href={`/api/documents/${doc.id}/download`}>
                        <Download size={13} />
                        Descargar
                      </a>
                    </Button>
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        title="Eliminar documento"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
