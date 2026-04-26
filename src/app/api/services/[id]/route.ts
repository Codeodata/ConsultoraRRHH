import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { serviceUpdateSchema } from '@/lib/validations'

async function getServiceOrFail(id: string, tenantId: string) {
  return db.service.findFirst({ where: { id, tenantId } })
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const service = await db.service.findFirst({
    where: { id, tenantId: session.user.tenantId },
    include: {
      company: true,
      documents: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!service) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  if (session.user.role === 'CLIENT' && service.companyId !== session.user.companyId) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  return NextResponse.json({ data: service })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['SUPER_ADMIN', 'RRHH'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const service = await getServiceOrFail(id, session.user.tenantId)
  if (!service) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const body = await req.json()
  const parsed = serviceUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { startDate, endDate, ...rest } = parsed.data

  const updated = await db.service.update({
    where: { id },
    data: {
      ...rest,
      ...(startDate !== undefined ? { startDate: new Date(startDate) } : {}),
      ...(endDate !== undefined ? { endDate: new Date(endDate) } : {}),
    },
  })

  return NextResponse.json({ data: updated })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['SUPER_ADMIN', 'RRHH'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const service = await getServiceOrFail(id, session.user.tenantId)
  if (!service) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  await db.service.delete({ where: { id } })

  return NextResponse.json({ message: 'Servicio eliminado' })
}
