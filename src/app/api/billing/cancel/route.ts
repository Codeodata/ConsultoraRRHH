export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST() {
  const session = await auth()
  if (!session || !['OWNER', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const subscription = await db.subscription.findUnique({
    where: { tenantId: session.user.tenantId },
  })

  if (!subscription) {
    return NextResponse.json({ error: 'Sin suscripción activa' }, { status: 400 })
  }

  // TODO: reactivar cuando se configure MP Preapproval
  // if (subscription.mpPreapprovalId) {
  //   try {
  //     await mpPreApproval.update({
  //       id: subscription.mpPreapprovalId,
  //       body: { status: 'cancelled' },
  //     })
  //   } catch (e) {
  //     console.error('[billing/cancel] MP update failed:', e)
  //   }
  // }

  await db.subscription.update({
    where: { id: subscription.id },
    data: { status: 'CANCELLED', cancelledAt: new Date() },
  })

  return NextResponse.json({ ok: true })
}
