import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import fs from 'fs'
import path from 'path'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const document = await db.document.findFirst({
    where: { id, tenantId: session.user.tenantId },
    include: { service: { select: { companyId: true } } },
  })

  if (!document) return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })

  if (
    session.user.role === 'CLIENT' &&
    document.service.companyId !== session.user.companyId
  ) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const filePath = path.join(process.cwd(), document.filePath)

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Archivo no encontrado en el servidor' }, { status: 404 })
  }

  const fileBuffer = fs.readFileSync(filePath)

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': document.mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(document.fileName)}"`,
      'Content-Length': String(fileBuffer.length),
    },
  })
}
