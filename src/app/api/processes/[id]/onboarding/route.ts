import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { onboardingTaskSchema } from '@/lib/validations'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['OWNER', 'SUPER_ADMIN', 'RRHH'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const { id: processId } = await params

  const process = await db.recruitmentProcess.findFirst({
    where: { id: processId, tenantId: session.user.tenantId },
  })
  if (!process) return NextResponse.json({ error: 'Proceso no encontrado' }, { status: 404 })

  const body = await req.json()
  const parsed = onboardingTaskSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { dueDate, ...rest } = parsed.data

  const task = await db.processOnboardingTask.create({
    data: {
      tenantId: session.user.tenantId,
      processId,
      ...rest,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  })

  return NextResponse.json({ data: task }, { status: 201 })
}
