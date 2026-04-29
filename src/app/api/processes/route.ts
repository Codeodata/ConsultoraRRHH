import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { processSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const companyId = searchParams.get('companyId')

  const processes = await db.recruitmentProcess.findMany({
    where: {
      tenantId: session.user.tenantId,
      ...(companyId ? { companyId } : {}),
    },
    include: {
      company: { select: { id: true, name: true } },
      employee: { select: { id: true, name: true } },
      _count: { select: { candidates: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json({ data: processes })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['SUPER_ADMIN', 'RRHH'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = processSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { openedAt, ...rest } = parsed.data

  const process = await db.recruitmentProcess.create({
    data: {
      tenantId: session.user.tenantId,
      ...rest,
      openedAt: openedAt ? new Date(openedAt) : new Date(),
    },
    include: { company: { select: { id: true, name: true } } },
  })

  return NextResponse.json({ data: process }, { status: 201 })
}
