import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import fs from 'fs'
import path from 'path'

type RouteParams = { params: Promise<{ id: string; docId: string }> }

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { id, docId } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['SUPER_ADMIN', 'RRHH'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const doc = await db.employeeDocument.findFirst({
    where: { id: docId, employeeId: id, tenantId: session.user.tenantId },
  })
  if (!doc) return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })

  const absPath = path.join(process.cwd(), doc.filePath)
  if (fs.existsSync(absPath)) fs.unlinkSync(absPath)

  await db.employeeDocument.delete({ where: { id: docId } })
  return NextResponse.json({ message: 'Documento eliminado' })
}
