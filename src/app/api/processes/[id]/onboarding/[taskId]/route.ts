import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { onboardingTaskUpdateSchema } from '@/lib/validations'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['SUPER_ADMIN', 'RRHH'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const { id: processId, taskId } = await params

  const existing = await db.processOnboardingTask.findFirst({
    where: { id: taskId, processId, tenantId: session.user.tenantId },
  })
  if (!existing) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const body = await req.json()
  const parsed = onboardingTaskUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { dueDate, completedAt, ...rest } = parsed.data

  const updated = await db.processOnboardingTask.update({
    where: { id: taskId },
    data: {
      ...rest,
      ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
      ...(completedAt !== undefined ? { completedAt: completedAt ? new Date(completedAt) : null } : {}),
    },
  })

  return NextResponse.json({ data: updated })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['SUPER_ADMIN', 'RRHH'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const { id: processId, taskId } = await params

  const existing = await db.processOnboardingTask.findFirst({
    where: { id: taskId, processId, tenantId: session.user.tenantId },
  })
  if (!existing) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  await db.processOnboardingTask.delete({ where: { id: taskId } })

  return NextResponse.json({ ok: true })
}
