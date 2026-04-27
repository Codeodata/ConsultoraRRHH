import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { serviceTaskUpdateSchema } from '@/lib/validations'

type RouteParams = { params: Promise<{ id: string; taskId: string }> }

async function getTaskOrFail(taskId: string, serviceId: string, tenantId: string) {
  return db.serviceTask.findFirst({ where: { id: taskId, serviceId, tenantId } })
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { id, taskId } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['SUPER_ADMIN', 'RRHH'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const task = await getTaskOrFail(taskId, id, session.user.tenantId)
  if (!task) return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 })

  const body = await req.json()
  const parsed = serviceTaskUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { dueDate, assignedUserId, ...rest } = parsed.data

  const updated = await db.serviceTask.update({
    where: { id: taskId },
    data: {
      ...rest,
      ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
      ...(assignedUserId !== undefined ? { assignedUserId: assignedUserId || null } : {}),
    },
    include: { assignedUser: { select: { id: true, name: true, email: true } } },
  })

  return NextResponse.json({ data: updated })
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { id, taskId } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['SUPER_ADMIN', 'RRHH'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const task = await getTaskOrFail(taskId, id, session.user.tenantId)
  if (!task) return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 })

  await db.serviceTask.delete({ where: { id: taskId } })
  return NextResponse.json({ message: 'Tarea eliminada' })
}
