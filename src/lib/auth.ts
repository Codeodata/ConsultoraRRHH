import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { loginSchema } from '@/lib/validations'
import { authConfig } from '@/lib/auth.config'

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) {
          console.error('[auth] schema parse failed:', parsed.error)
          return null
        }

        const { email, password } = parsed.data

        let user
        try {
          user = await db.user.findUnique({
            where: { email },
            include: { tenant: true },
          })
        } catch (e) {
          console.error('[auth] db error:', e)
          return null
        }

        if (!user || !user.password || !user.isActive) {
          console.error('[auth] user not found or inactive:', { email, found: !!user })
          return null
        }

        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) {
          console.error('[auth] password mismatch for:', email)
          return null
        }

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
})
