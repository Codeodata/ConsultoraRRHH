import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { candidateSchema } from '@/lib/validations'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['SUPER_ADMIN', 'RRHH'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const { id: processId } = await params

  const process = await db.recruitmentProcess.findFirst({
    where: { id: processId, tenantId: session.user.tenantId },
  })
  if (!process) return NextResponse.json({ error: 'Proceso no encontrado' }, { status: 404 })

  const body = await req.json()
  const parsed = candidateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const candidate = await db.processCandidate.create({
    data: {
      tenantId: session.user.tenantId,
      processId,
      ...parsed.data,
    },
  })

  return NextResponse.json({ data: candidate }, { status: 201 })
}
