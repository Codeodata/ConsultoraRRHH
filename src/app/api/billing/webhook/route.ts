import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import crypto from 'crypto'
import { Payment } from 'mercadopago'
import { db } from '@/lib/db'
import { mpClient, mpPreApproval, mapMpStatus } from '@/lib/mercadopago'

export async function POST(req: Request) {
  const headersList = await headers()
  const xSignature = headersList.get('x-signature')
  const xRequestId = headersList.get('x-request-id')
  const body = await req.json()

  if (process.env.MP_WEBHOOK_SECRET && xSignature) {
    const ts = xSignature.split(',').find((p) => p.startsWith('ts='))?.split('=')[1]
    const v1 = xSignature.split(',').find((p) => p.startsWith('v1='))?.split('=')[1]
    if (ts && v1) {
      const manifest = `id:${body.data?.id ?? ''};request-id:${xRequestId};ts:${ts};`
      const hmac = crypto.createHmac('sha256', process.env.MP_WEBHOOK_SECRET).update(manifest).digest('hex')
      if (hmac !== v1) {
        return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })
      }
    }
  }

  try {
    if (body.type === 'preapproval' && body.data?.id) {
      const mpData = await mpPreApproval.get({ id: body.data.id })

      const subscription = await db.subscription.findUnique({
        where: { mpPreapprovalId: body.data.id },
      })
      if (!subscription) return NextResponse.json({ ok: true })

      const newStatus = mapMpStatus(mpData.status ?? '')

      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          status: newStatus,
          cancelledAt: newStatus === 'CANCELLED' ? new Date() : undefined,
          currentPeriodEnd: (mpData.auto_recurring as any)?.end_date
            ? new Date((mpData.auto_recurring as any).end_date)
            : undefined,
        },
      })
    }

    if (body.type === 'payment' && body.data?.id) {
      const mpPayment = new Payment(mpClient)
      const payment = await mpPayment.get({ id: body.data.id })

      if (payment.metadata?.preapproval_id) {
        const subscription = await db.subscription.findUnique({
          where: { mpPreapprovalId: payment.metadata.preapproval_id },
        })
        if (subscription) {
          await db.paymentRecord.upsert({
            where: { mpPaymentId: String(payment.id) },
            create: {
              subscriptionId: subscription.id,
              mpPaymentId: String(payment.id),
              amount: payment.transaction_amount ?? 0,
              currency: payment.currency_id ?? 'CLP',
              status: payment.status ?? 'unknown',
              paidAt: payment.date_approved ? new Date(payment.date_approved) : null,
            },
            update: {
              status: payment.status ?? 'unknown',
              paidAt: payment.date_approved ? new Date(payment.date_approved) : null,
            },
          })
        }
      }
    }
  } catch (e) {
    console.error('[billing/webhook]', e)
  }

  return NextResponse.json({ ok: true })
}
