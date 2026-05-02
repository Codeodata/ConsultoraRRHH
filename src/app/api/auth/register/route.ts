import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { registerSchema } from '@/lib/validations'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { logAction, getIp } from '@/lib/audit'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  // Rate limiting
  const { success, reset } = await checkRateLimit(req)
  if (!success) return rateLimitResponse(reset)

  const ip = getIp(req)

  const body = await req.json()
  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { name, email, password } = parsed.data
  const hashedPassword = await bcrypt.hash(password, 12)

  const slugBase = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-')
  const slug = `${slugBase}-${Date.now()}`

  const tenant = await db.tenant.create({
    data: {
      name,
      slug,
      users: {
        create: {
          name,
          email,
          password: hashedPassword,
          role: 'OWNER',
        },
      },
      subscription: {
        create: {
          planTier: 'FREE',
          status: 'ACTIVE',
        },
      },
    },
    include: { users: true },
  })

  const user = tenant.users[0]

  await logAction({
    action: 'REGISTER',
    tenantId: tenant.id,
    userId: user.id,
    metadata: { email, tenantSlug: slug },
    ipAddress: ip,
  })

  return NextResponse.json({ success: true, tenantSlug: slug }, { status: 201 })
}
