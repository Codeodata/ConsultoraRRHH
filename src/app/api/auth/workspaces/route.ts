import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({ email: z.string().email() })

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email') ?? ''
  const parsed = schema.safeParse({ email })
  if (!parsed.success) return NextResponse.json({ count: 0, slugs: [] })

  const users = await db.user.findMany({
    where: { email: parsed.data.email },
    select: { tenant: { select: { slug: true, name: true } } },
  })

  const workspaces = users.map((u) => u.tenant)
  return NextResponse.json({ count: workspaces.length, workspaces })
}
