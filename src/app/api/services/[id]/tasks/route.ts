import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { serviceTaskSchema } from '@/lib/validations'

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const service = await db.service.findFirst({ where: { id, tenantId: session.user.tenantId } })
  if (!service) return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })

  const tasks = await db.serviceTask.findMany({
    where: { serviceId: id, tenantId: session.user.tenantId },
    include: { assignedUser: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json({ data: tasks })
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['OWNER', 'SUPER_ADMIN', 'RRHH'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const service = await db.service.findFirst({ where: { id, tenantId: session.user.tenantId } })
  if (!service) return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })

  const body = await req.json()
  const parsed = serviceTaskSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { dueDate, assignedUserId, ...rest } = parsed.data

  const task = await db.serviceTask.create({
    data: {
      tenantId: session.user.tenantId,
      serviceId: id,
      ...rest,
      ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
      ...(assignedUserId ? { assignedUserId } : {}),
    },
    include: { assignedUser: { select: { id: true, name: true, email: true } } },
  })

  return NextResponse.json({ data: task }, { status: 201 })
}
