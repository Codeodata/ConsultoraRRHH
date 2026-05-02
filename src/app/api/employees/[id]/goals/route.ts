import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { employeeGoalSchema } from '@/lib/validations'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['OWNER', 'SUPER_ADMIN', 'RRHH'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const employee = await db.employee.findFirst({ where: { id, tenantId: session.user.tenantId } })
  if (!employee) return NextResponse.json({ error: 'Empleado no encontrado' }, { status: 404 })

  const body = await req.json()
  const parsed = employeeGoalSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { startDate, endDate, ...rest } = parsed.data

  const goal = await db.employeeGoal.create({
    data: {
      tenantId: session.user.tenantId,
      employeeId: id,
      ...rest,
      ...(startDate !== undefined ? { startDate: startDate ? new Date(startDate) : null } : {}),
      ...(endDate !== undefined ? { endDate: endDate ? new Date(endDate) : null } : {}),
    },
  })

  return NextResponse.json({ data: goal }, { status: 201 })
}
