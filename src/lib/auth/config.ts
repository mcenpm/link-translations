import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { createHash } from 'crypto'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

// SugarCRM uses MD5 for password hashing
function hashPasswordMD5(password: string): string {
  return createHash('md5').update(password).digest('hex')
}

// Extend types for NextAuth
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string | null
      role: UserRole
      customerId?: string
      linguistId?: string
    }
  }
  
  interface User {
    id: string
    email: string
    role: UserRole
    firstName: string | null
    lastName: string | null
    customerId?: string
    linguistId?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
    customerId?: string
    linguistId?: string
    isAdmin?: boolean
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Admin credentials provider (SugarCRM users)
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
        const passwordHash = hashPasswordMD5(credentials.password)

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
          role: 'ADMIN' as UserRole,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
        }
      }
    }),
    // Regular user credentials provider
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          include: {
            customer: { select: { id: true } },
            linguist: { select: { id: true } }
          }
        })

        if (!user) {
          throw new Error('Invalid email or password')
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error('Invalid email or password')
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          customerId: user.customer?.id,
          linguistId: user.linguist?.id
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.customerId = user.customerId
        token.linguistId = user.linguistId
        // Set isAdmin flag for admin users
        token.isAdmin = user.role === 'ADMIN'
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.customerId = token.customerId
        session.user.linguistId = token.linguistId
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}
