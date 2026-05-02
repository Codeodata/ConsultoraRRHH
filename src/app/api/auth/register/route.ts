import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { registerSchema } from '@/lib/validations'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { name, email, password } = parsed.data

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Este email ya está registrado' }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  // Slug único: base del email + timestamp para evitar colisiones
  const slugBase = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-')
  const slug = `${slugBase}-${Date.now()}`

  // Transacción: Tenant + User(SUPER_ADMIN) + Subscription(FREE/ACTIVE)
  await db.tenant.create({
    data: {
      name: `${name}`,
      slug,
      users: {
        create: {
          name,
          email,
          password: hashedPassword,
          role: 'SUPER_ADMIN',
        },
      },
      subscription: {
        create: {
          planTier: 'FREE',
          status: 'ACTIVE',
        },
      },
    },
  })

  return NextResponse.json({ success: true }, { status: 201 })
}
