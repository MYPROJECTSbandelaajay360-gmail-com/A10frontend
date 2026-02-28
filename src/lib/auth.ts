import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

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

                try {
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email.toLowerCase() },
                        include: { employee: true, organization: true }
                    })

                    if (!user) {
                        throw new Error('Invalid credentials')
                    }

                    if (user.status === 'SUSPENDED') {
                        throw new Error('Your account has been suspended')
                    }

                    const isValid = await bcrypt.compare(credentials.password, user.password)

                    if (!isValid) {
                        throw new Error('Invalid credentials')
                    }

                    const name = user.employee
                        ? `${user.employee.firstName} ${user.employee.lastName}`
                        : user.email.split('@')[0]

                    return {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                        name: name,
                        employeeId: user.employee?.id,
                        image: user.employee?.profileImage,
                        organizationId: user.organizationId || null,
                    }
                } catch (error: any) {
                    console.error('Login error:', error)
                    throw new Error(error.message || 'Login failed')
                }
            }
        })
    ],
    session: {
        strategy: 'jwt',
        maxAge: 24 * 60 * 60 // 24 hours
    },
    pages: {
        signIn: '/login',
        error: '/login'
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id
                token.role = user.role
                token.employeeId = user.employeeId
                token.picture = user.image
                token.organizationId = (user as any).organizationId || null
            }

            // Always update/refresh the access token to prevent expiration (Sliding Window)
            // Ensure we have the necessary user data before signing
            if (token.id && token.email) {
                const secret = process.env.NEXTAUTH_SECRET;
                if (!secret) throw new Error("NEXTAUTH_SECRET is not defined");

                // console.log('Refreshing access token for:', token.email); 
                token.accessToken = jwt.sign(
                    {
                        id: token.id,
                        email: token.email,
                        role: token.role,
                        employeeId: token.employeeId,
                        organizationId: token.organizationId || null
                    },
                    secret,
                    { expiresIn: '24h' }
                )
            }

            // Handle session update (e.g., after profile picture change)
            if (trigger === 'update' && session) {
                if (session.user?.image !== undefined) {
                    token.picture = session.user.image
                }
                if (session.user?.name !== undefined) {
                    token.name = session.user.name
                }
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as string
                session.user.employeeId = token.employeeId as string | undefined
                session.user.image = token.picture as string | undefined
                ;(session.user as any).organizationId = token.organizationId as string | null
                ;(session as any).accessToken = token.accessToken // Add access token to session
            }
            return session
        }
    },
    debug: process.env.NODE_ENV === 'development'
}

export default authOptions
