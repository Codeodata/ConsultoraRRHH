import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { getFileUrl } from '@/lib/storage'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const document = await db.document.findFirst({
    where: { id, tenantId: session.user.tenantId },
    include: { service: { select: { companyId: true } } },
  })

  if (!document) return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })

  if (session.user.role === 'CLIENT' && document.service.companyId !== session.user.companyId) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const url = getFileUrl(document.filePath)
  return NextResponse.redirect(url)
}
