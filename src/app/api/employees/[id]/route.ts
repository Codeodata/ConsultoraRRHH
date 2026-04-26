import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { employeeUpdateSchema } from '@/lib/validations'

async function getEmployee(id: string, tenantId: string) {
  return db.employee.findFirst({ where: { id, tenantId } })
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const employee = await db.employee.findFirst({
    where: { id, tenantId: session.user.tenantId },
    include: {
      company: true,
      reportsTo: { select: { id: true, name: true, position: true } },
      reports: { select: { id: true, name: true, position: true, isActive: true } },
      history: { orderBy: { date: 'desc' } },
    },
  })

  if (!employee) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json({ data: employee })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['SUPER_ADMIN', 'RRHH'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const previous = await getEmployee(id, session.user.tenantId)
  if (!previous) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const body = await req.json()
  const parsed = employeeUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { startDate, birthDate, reportsToId, isActive, ...rest } = parsed.data

  const updated = await db.employee.update({
    where: { id },
    data: {
      ...rest,
      ...(reportsToId !== undefined ? { reportsToId: reportsToId || null } : {}),
      ...(startDate !== undefined ? { startDate: startDate ? new Date(startDate) : null } : {}),
      ...(birthDate !== undefined ? { birthDate: birthDate ? new Date(birthDate) : null } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    },
  })

  // Auto-register history on position or department change
  const historyEntries: { tenantId: string; employeeId: string; changeType: 'PROMOTION' | 'TRANSFER' | 'UPDATE'; description: string }[] = []

  if (parsed.data.position !== undefined && parsed.data.position !== previous.position) {
    historyEntries.push({
      tenantId: session.user.tenantId,
      employeeId: id,
      changeType: 'UPDATE',
      description: `Cargo: ${previous.position || 'Sin cargo'} → ${parsed.data.position || 'Sin cargo'}`,
    })
  }

  if (parsed.data.department !== undefined && parsed.data.department !== previous.department) {
    historyEntries.push({
      tenantId: session.user.tenantId,
      employeeId: id,
      changeType: 'TRANSFER',
      description: `Departamento: ${previous.department || 'Sin departamento'} → ${parsed.data.department || 'Sin departamento'}`,
    })
  }

  if (historyEntries.length > 0) {
    await db.employeeHistory.createMany({ data: historyEntries })
  }

  return NextResponse.json({ data: updated })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['SUPER_ADMIN', 'RRHH'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const employee = await getEmployee(id, session.user.tenantId)
  if (!employee) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  await db.employee.delete({ where: { id } })
  return NextResponse.json({ message: 'Empleado eliminado' })
}
