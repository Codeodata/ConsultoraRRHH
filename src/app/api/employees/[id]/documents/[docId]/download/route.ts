import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import fs from 'fs'
import path from 'path'

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

  const absPath = path.join(process.cwd(), doc.filePath)
  if (!fs.existsSync(absPath)) {
    return NextResponse.json({ error: 'Archivo no encontrado en el servidor' }, { status: 404 })
  }

  const fileBuffer = fs.readFileSync(absPath)

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': doc.mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(doc.fileName)}"`,
      'Content-Length': String(fileBuffer.length),
    },
  })
}
