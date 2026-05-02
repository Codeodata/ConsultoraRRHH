import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { uploadFile } from '@/lib/storage'

const MAX_SIZE_BYTES = (Number(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['OWNER', 'SUPER_ADMIN', 'RRHH'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const serviceId = formData.get('serviceId') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string | undefined

  if (!file || !serviceId || !name) {
    return NextResponse.json({ error: 'Archivo, servicio y nombre son requeridos' }, { status: 400 })
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: `Archivo demasiado grande. Máximo ${process.env.MAX_FILE_SIZE_MB || 10}MB` },
      { status: 400 },
    )
  }

  const service = await db.service.findFirst({
    where: { id: serviceId, tenantId: session.user.tenantId },
  })
  if (!service) return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })

  const existingVersionCount = await db.document.count({ where: { serviceId, name } })

  const bytes = await file.arrayBuffer()
  const storagePath = await uploadFile(
    session.user.tenantId,
    file.name,
    Buffer.from(bytes),
    file.type || 'application/octet-stream',
  )

  const document = await db.document.create({
    data: {
      tenantId: session.user.tenantId,
      serviceId,
      name,
      description: description || undefined,
      fileName: file.name,
      filePath: storagePath,
      fileSize: file.size,
      mimeType: file.type || 'application/octet-stream',
      version: existingVersionCount + 1,
    },
  })

  return NextResponse.json({ data: document }, { status: 201 })
}
