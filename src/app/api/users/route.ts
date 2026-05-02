import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { userSchema } from '@/lib/validations'
import bcrypt from 'bcryptjs'
import { canCreateUser } from '@/lib/plan-limits'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const users = await db.user.findMany({
    where: { tenantId: session.user.tenantId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      companyId: true,
      createdAt: true,
      company: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ data: users })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const limitCheck = await canCreateUser(session.user.tenantId, session.user.role)
  if (!limitCheck.allowed) {
    return NextResponse.json(
      { error: limitCheck.reason, upgradeRequired: true, currentPlan: limitCheck.currentPlan },
      { status: 402 }
    )
  }

  const body = await req.json()
  const parsed = userSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } })
  if (existing) return NextResponse.json({ error: 'Email ya registrado' }, { status: 400 })

  const hashedPassword = await bcrypt.hash(parsed.data.password!, 12)

  const user = await db.user.create({
    data: {
      tenantId: session.user.tenantId,
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashedPassword,
      role: parsed.data.role,
      companyId: parsed.data.companyId ?? null,
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })

  return NextResponse.json({ data: user }, { status: 201 })
}
