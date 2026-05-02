import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { deleteFile } from '@/lib/storage'
import { subtractStorageUsage } from '@/lib/usage'

type RouteParams = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['OWNER', 'SUPER_ADMIN', 'RRHH'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const doc = await db.document.findFirst({
    where: { id, tenantId: session.user.tenantId },
  })
  if (!doc) return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })

  const body = await req.json()
  const { name, description } = body

  const updated = await db.document.update({
    where: { id },
    data: {
      ...(name ? { name } : {}),
      description: description ?? doc.description,
    },
  })

  return NextResponse.json({ data: updated })
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['OWNER', 'SUPER_ADMIN', 'RRHH'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const doc = await db.document.findFirst({
    where: { id, tenantId: session.user.tenantId },
  })
  if (!doc) return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })

  await db.document.delete({ where: { id } })

  // Eliminar archivo de Supabase Storage (best-effort, no bloquea respuesta)
  deleteFile(doc.filePath).catch((e) => console.error('[doc:delete] storage error:', e))

  // Restar uso de storage del tenant
  await subtractStorageUsage(session.user.tenantId, doc.fileSize)

  return NextResponse.json({ message: 'Documento eliminado' })
}
