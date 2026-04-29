import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { getFileUrl } from '@/lib/storage'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> },
) {
  const { id, docId } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const doc = await db.employeeDocument.findFirst({
    where: { id: docId, employeeId: id, tenantId: session.user.tenantId },
  })
  if (!doc) return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })

  const url = getFileUrl(doc.filePath)
  return NextResponse.redirect(url)
}
