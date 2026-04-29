import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { mpPreApproval, BILLING_PLANS } from '@/lib/mercadopago'
import { z } from 'zod'

const schema = z.object({ plan: z.enum(['STARTER', 'PRO', 'BUSINESS']) })

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })
  }

  const plan = BILLING_PLANS[parsed.data.plan]
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  const result = await mpPreApproval.create({
    body: {
      reason: `Plan ${plan.name} - Consultora RRHH`,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: plan.price,
        currency_id: plan.currency,
      },
      back_url: `${appUrl}/billing`,
      payer_email: session.user.email!,
      status: 'pending',
    },
  })

  await db.subscription.upsert({
    where: { tenantId: session.user.tenantId },
    create: {
      tenantId: session.user.tenantId,
      planTier: parsed.data.plan,
      status: 'TRIAL',
      mpPreapprovalId: result.id,
    },
    update: {
      planTier: parsed.data.plan,
      mpPreapprovalId: result.id,
      status: 'TRIAL',
    },
  })

  return NextResponse.json({ checkoutUrl: result.init_point })
}
