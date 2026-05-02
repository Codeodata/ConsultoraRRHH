import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { employeeSchema } from '@/lib/validations'
import { canCreateEmployee } from '@/lib/plan-limits'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const companyId = searchParams.get('companyId')

  const employees = await db.employee.findMany({
    where: {
      tenantId: session.user.tenantId,
      ...(companyId ? { companyId } : {}),
    },
    include: {
      company: { select: { id: true, name: true } },
      reportsTo: { select: { id: true, name: true, position: true } },
      _count: { select: { reports: true, history: true } },
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({ data: employees })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['SUPER_ADMIN', 'RRHH'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const limitCheck = await canCreateEmployee(session.user.tenantId)
  if (!limitCheck.allowed) {
    return NextResponse.json(
      { error: limitCheck.reason, upgradeRequired: true, currentPlan: limitCheck.currentPlan },
      { status: 402 }
    )
  }

  const body = await req.json()
  const parsed = employeeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { startDate, reportsToId, isActive, ...rest } = parsed.data

  const employee = await db.employee.create({
    data: {
      tenantId: session.user.tenantId,
      ...rest,
      reportsToId: reportsToId || null,
      startDate: startDate ? new Date(startDate) : null,
      isActive: isActive ?? true,
    },
  })

  return NextResponse.json({ data: employee }, { status: 201 })
}
