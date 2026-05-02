import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { serviceSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const companyId = searchParams.get('companyId')

  const where: any = { tenantId: session.user.tenantId }
  if (companyId) where.companyId = companyId
  if (session.user.role === 'CLIENT' && session.user.companyId) {
    where.companyId = session.user.companyId
  }

  const services = await db.service.findMany({
    where,
    include: {
      company: { select: { name: true } },
      _count: { select: { documents: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json({ data: services })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['OWNER', 'SUPER_ADMIN', 'RRHH'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = serviceSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const company = await db.company.findFirst({
    where: { id: parsed.data.companyId, tenantId: session.user.tenantId },
  })
  if (!company) return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 })

  const { startDate, endDate, ...rest } = parsed.data

  const service = await db.service.create({
    data: {
      tenantId: session.user.tenantId,
      ...rest,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    },
  })

  return NextResponse.json({ data: service }, { status: 201 })
}
