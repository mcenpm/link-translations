import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

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
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
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
