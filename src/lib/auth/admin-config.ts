import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { createHash } from 'crypto'
import { prisma } from '@/lib/prisma'

// SugarCRM uses MD5 for password hashing
function hashPassword(password: string): string {
  return createHash('md5').update(password).digest('hex')
}

export const adminAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'Admin Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        const adminUser = await prisma.adminUser.findUnique({
          where: { email: credentials.email.toLowerCase() }
        })

        if (!adminUser) {
          throw new Error('Invalid email or password')
        }

        if (!adminUser.isActive) {
          throw new Error('Account is deactivated')
        }

        // SugarCRM uses MD5 hashing
        const passwordHash = hashPassword(credentials.password)
        
        // Debug logging
        console.log('Login attempt:', {
          email: credentials.email,
          inputHash: passwordHash,
          storedHash: adminUser.passwordHash,
          match: passwordHash === adminUser.passwordHash
        })

        if (passwordHash !== adminUser.passwordHash) {
          throw new Error('Invalid email or password')
        }

        // Update last login
        await prisma.adminUser.update({
          where: { id: adminUser.id },
          data: { lastLogin: new Date() }
        })

        const fullName = [adminUser.firstName, adminUser.lastName].filter(Boolean).join(' ')

        return {
          id: adminUser.id,
          email: adminUser.email,
          name: fullName,
          role: 'ADMIN' as const,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          // Store isAdmin in custom field
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = 'ADMIN'
        token.isAdmin = true
        token.username = user.email?.split('@')[0] || ''
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as 'ADMIN'
        // Add isAdmin to session via type assertion
        (session.user as { isAdmin?: boolean }).isAdmin = true
      }
      return session
    }
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours for admin sessions
  },
  secret: process.env.NEXTAUTH_SECRET,
}
