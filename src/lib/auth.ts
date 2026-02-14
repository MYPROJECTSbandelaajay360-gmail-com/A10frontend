import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

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
                    // Call backend API for authentication
                    const res = await fetch('http://localhost:8001/api/auth/login', {
                        method: 'POST',
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password
                        }),
                        headers: { "Content-Type": "application/json" }
                    })

                    const data = await res.json()

                    if (!res.ok) {
                        throw new Error(data.error || 'Invalid credentials')
                    }

                    // Backend returns: { token, user: { id, email, role, name, employeeId, image } }
                    if (data.user) {
                        return {
                            id: data.user.id,
                            email: data.user.email,
                            role: data.user.role,
                            name: data.user.name,
                            employeeId: data.user.employeeId,
                            image: data.user.image,
                            accessToken: data.token // Store backend token if needed
                        }
                    } else {
                        throw new Error('User data not found')
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
                token.accessToken = (user as any).accessToken // Cast to any because user type might not have accessToken defined in next-auth types
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
                (session as any).accessToken = token.accessToken // Add access token to session
            }
            return session
        }
    },
    debug: process.env.NODE_ENV === 'development'
}

export default authOptions
