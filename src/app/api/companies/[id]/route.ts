import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { companySchema } from '@/lib/validations'

async function getCompanyOrFail(id: string, tenantId: string) {
  const company = await db.company.findFirst({ where: { id, tenantId } })
  return company
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const company = await getCompanyOrFail(id, session.user.tenantId)
  if (!company) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  return NextResponse.json({ data: company })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['SUPER_ADMIN', 'RRHH'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const company = await getCompanyOrFail(id, session.user.tenantId)
  if (!company) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const body = await req.json()
  const parsed = companySchema.partial().safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const updated = await db.company.update({
    where: { id },
    data: parsed.data,
  })

  return NextResponse.json({ data: updated })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const company = await getCompanyOrFail(id, session.user.tenantId)
  if (!company) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  await db.company.delete({ where: { id } })

  return NextResponse.json({ message: 'Empresa eliminada' })
}
