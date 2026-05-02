import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { uploadFile } from '@/lib/storage'

const MAX_SIZE_BYTES = (Number(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['OWNER', 'SUPER_ADMIN', 'RRHH'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const employee = await db.employee.findFirst({ where: { id, tenantId: session.user.tenantId } })
  if (!employee) return NextResponse.json({ error: 'Empleado no encontrado' }, { status: 404 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const name = (formData.get('name') as string) || ''

  if (!file) return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 })

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: `Archivo demasiado grande. Máximo ${process.env.MAX_FILE_SIZE_MB || 10}MB` },
      { status: 400 },
    )
  }

  const bytes = await file.arrayBuffer()
  const storagePath = await uploadFile(
    session.user.tenantId,
    file.name,
    Buffer.from(bytes),
    file.type || 'application/octet-stream',
  )

  const rawCategory = formData.get('category') as string | null
  const validCategories = ['GENERAL', 'EVALUATION', 'DEVELOPMENT']
  const category = validCategories.includes(rawCategory ?? '') ? rawCategory! : 'GENERAL'

  const document = await db.employeeDocument.create({
    data: {
      tenantId: session.user.tenantId,
      employeeId: id,
      name: name || file.name,
      fileName: file.name,
      filePath: storagePath,
      fileSize: file.size,
      mimeType: file.type || 'application/octet-stream',
      category: category as 'GENERAL' | 'EVALUATION' | 'DEVELOPMENT',
    },
  })

  return NextResponse.json({ data: document }, { status: 201 })
}
