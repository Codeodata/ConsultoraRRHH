import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

type RouteParams = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (session.user.role !== 'CLIENT') {
    return NextResponse.json({ error: 'Solo clientes pueden calificar servicios' }, { status: 403 })
  }
  if (!session.user.companyId) {
    return NextResponse.json({ error: 'Sin empresa asociada' }, { status: 403 })
  }

  const service = await db.service.findFirst({
    where: { id, tenantId: session.user.tenantId, companyId: session.user.companyId },
  })
  if (!service) return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })

  if (service.status !== 'COMPLETED') {
    return NextResponse.json({ error: 'Solo se pueden calificar servicios completados' }, { status: 400 })
  }

  const body = await req.json()
  const { rating, ratingComment } = body

  if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'La calificación debe ser un número entero entre 1 y 5' }, { status: 400 })
  }

  const updated = await db.service.update({
    where: { id },
    data: { rating, ratingComment: ratingComment ?? null },
  })

  return NextResponse.json({ data: updated })
}
