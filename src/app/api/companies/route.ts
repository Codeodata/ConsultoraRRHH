import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { companySchema } from '@/lib/validations'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const companies = await db.company.findMany({
    where: { tenantId: session.user.tenantId },
    include: { _count: { select: { services: true } } },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({ data: companies })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['SUPER_ADMIN', 'RRHH'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = companySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const company = await db.company.create({
    data: {
      tenantId: session.user.tenantId,
      ...parsed.data,
    },
  })

  return NextResponse.json({ data: company }, { status: 201 })
}
