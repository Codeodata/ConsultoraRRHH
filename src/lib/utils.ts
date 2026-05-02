import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}


export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Pendiente',
    IN_PROGRESS: 'En Proceso',
    COMPLETED: 'Finalizado',
  }
  return labels[status] ?? status
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
  }
  return colors[status] ?? 'bg-gray-100 text-gray-800'
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    OWNER: 'Administrador',
    RRHH: 'RRHH',
    CLIENT: 'Cliente',
  }
  return labels[role] ?? role
}

export function getChangeTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    PROMOTION: 'Promoción',
    TRANSFER: 'Transferencia',
    UPDATE: 'Actualización',
  }
  return labels[type] ?? type
}

export function getChangeTypeVariant(type: string): 'success' | 'info' | 'secondary' {
  const map: Record<string, 'success' | 'info' | 'secondary'> = {
    PROMOTION: 'success',
    TRANSFER: 'info',
    UPDATE: 'secondary',
  }
  return map[type] ?? 'secondary'
}
