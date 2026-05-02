import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { processUpdateSchema } from '@/lib/validations'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params

  const process = await db.recruitmentProcess.findFirst({
    where: { id, tenantId: session.user.tenantId },
    include: {
      company: { select: { id: true, name: true } },
      employee: { select: { id: true, name: true, position: true } },
      candidates: { orderBy: { createdAt: 'asc' } },
      onboardingTasks: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!process) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  return NextResponse.json({ data: process })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['OWNER', 'SUPER_ADMIN', 'RRHH'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = processUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const existing = await db.recruitmentProcess.findFirst({
    where: { id, tenantId: session.user.tenantId },
  })
  if (!existing) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const { closedAt, ...rest } = parsed.data

  const updated = await db.recruitmentProcess.update({
    where: { id },
    data: {
      ...rest,
      ...(closedAt !== undefined ? { closedAt: closedAt ? new Date(closedAt) : null } : {}),
    },
    include: {
      company: { select: { id: true, name: true } },
      employee: { select: { id: true, name: true, position: true } },
      candidates: { orderBy: { createdAt: 'asc' } },
      onboardingTasks: { orderBy: { createdAt: 'asc' } },
    },
  })

  return NextResponse.json({ data: updated })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['OWNER', 'SUPER_ADMIN', 'RRHH'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const { id } = await params

  const existing = await db.recruitmentProcess.findFirst({
    where: { id, tenantId: session.user.tenantId },
  })
  if (!existing) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  await db.recruitmentProcess.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
