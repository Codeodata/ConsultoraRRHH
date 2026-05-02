import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { loginSchema } from '@/lib/validations'
import { checkRateLimit } from '@/lib/rate-limit'
import { logAction } from '@/lib/audit'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Credentials({
      async authorize(credentials, request) {
        // Rate limiting por IP
        if (request) {
          const { success, reset } = await checkRateLimit(request)
          if (!success) {
            const ip =
              request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
            console.warn(`[auth] rate limit hit for IP ${ip}`)
            return null
          }
        }

        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password, tenantSlug: rawSlug } = parsed.data
        const tenantSlug = rawSlug && rawSlug !== 'undefined' ? rawSlug : undefined

        const ip =
          request?.headers?.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

        let user
        try {
          if (tenantSlug) {
            // Busca por tenant específico
            const tenant = await db.tenant.findUnique({ where: { slug: tenantSlug } })
            if (!tenant) return null
            user = await db.user.findUnique({
              where: { tenantId_email: { tenantId: tenant.id, email } },
              include: { tenant: true },
            })
          } else {
            // Auto-detect: busca todos los users con ese email
            const users = await db.user.findMany({
              where: { email },
              include: { tenant: true },
            })
            if (users.length === 0) return null
            if (users.length > 1) {
              console.warn(`[auth] multiple tenants for email ${email}, tenantSlug required`)
              return null
            }
            user = users[0]
          }
        } catch (e) {
          console.error('[auth] db error:', e)
          return null
        }

        if (!user || !user.password || !user.isActive) return null

        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) {
          await logAction({
            action: 'LOGIN',
            tenantId: user.tenantId,
            userId: user.id,
            metadata: { success: false, reason: 'bad_password' },
            ipAddress: ip,
          })
          return null
        }

        await logAction({
          action: 'LOGIN',
          tenantId: user.tenantId,
          userId: user.id,
          metadata: { success: true },
          ipAddress: ip,
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
          companyId: user.companyId,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.tenantId = (user as any).tenantId
        token.companyId = (user as any).companyId
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.tenantId = token.tenantId as string
        session.user.companyId = token.companyId as string | null
      }
      return session
    },
  },
})
