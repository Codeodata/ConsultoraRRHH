import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { candidateUpdateSchema } from '@/lib/validations'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; candidateId: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['OWNER', 'SUPER_ADMIN', 'RRHH'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const { id: processId, candidateId } = await params

  const existing = await db.processCandidate.findFirst({
    where: { id: candidateId, processId, tenantId: session.user.tenantId },
  })
  if (!existing) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const body = await req.json()
  const parsed = candidateUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { interviewDate, medicalExamDate, medicalExamExpiry, ...rest } = parsed.data

  // If marking as selected, deselect others
  if (rest.isSelected) {
    await db.processCandidate.updateMany({
      where: { processId, tenantId: session.user.tenantId, id: { not: candidateId } },
      data: { isSelected: false },
    })
  }

  const updated = await db.processCandidate.update({
    where: { id: candidateId },
    data: {
      ...rest,
      ...(interviewDate !== undefined ? { interviewDate: interviewDate ? new Date(interviewDate) : null } : {}),
      ...(medicalExamDate !== undefined ? { medicalExamDate: medicalExamDate ? new Date(medicalExamDate) : null } : {}),
      ...(medicalExamExpiry !== undefined ? { medicalExamExpiry: medicalExamExpiry ? new Date(medicalExamExpiry) : null } : {}),
    },
  })

  return NextResponse.json({ data: updated })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; candidateId: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['OWNER', 'SUPER_ADMIN', 'RRHH'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const { id: processId, candidateId } = await params

  const existing = await db.processCandidate.findFirst({
    where: { id: candidateId, processId, tenantId: session.user.tenantId },
  })
  if (!existing) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  await db.processCandidate.delete({ where: { id: candidateId } })

  return NextResponse.json({ ok: true })
}
