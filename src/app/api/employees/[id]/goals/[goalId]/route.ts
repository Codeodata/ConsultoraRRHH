import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { employeeGoalUpdateSchema } from '@/lib/validations'

type RouteParams = { params: Promise<{ id: string; goalId: string }> }

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { id, goalId } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['OWNER', 'SUPER_ADMIN', 'RRHH'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const goal = await db.employeeGoal.findFirst({
    where: { id: goalId, employeeId: id, tenantId: session.user.tenantId },
  })
  if (!goal) return NextResponse.json({ error: 'Objetivo no encontrado' }, { status: 404 })

  const body = await req.json()
  const parsed = employeeGoalUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { startDate, endDate, ...rest } = parsed.data

  const updated = await db.employeeGoal.update({
    where: { id: goalId },
    data: {
      ...rest,
      ...(startDate !== undefined ? { startDate: startDate ? new Date(startDate) : null } : {}),
      ...(endDate !== undefined ? { endDate: endDate ? new Date(endDate) : null } : {}),
    },
  })

  return NextResponse.json({ data: updated })
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { id, goalId } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['OWNER', 'SUPER_ADMIN', 'RRHH'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const goal = await db.employeeGoal.findFirst({
    where: { id: goalId, employeeId: id, tenantId: session.user.tenantId },
  })
  if (!goal) return NextResponse.json({ error: 'Objetivo no encontrado' }, { status: 404 })

  await db.employeeGoal.delete({ where: { id: goalId } })
  return NextResponse.json({ message: 'Objetivo eliminado' })
}
