import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Zap } from 'lucide-react'

// Animated Background Component
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-0 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float-delayed" />
    </div>
  )
}

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white relative flex flex-col">
      <AnimatedBackground />

      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900">Musterbook</span>
        </div>
        <Link
          href="/login"
          className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          Sign In
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight mb-6">
          Simplify Your <br />
          <span className="text-blue-600">Workforce</span>
        </h1>

        <p className="text-xl text-gray-500 mb-10 max-w-2xl leading-relaxed">
          The all-in-one platform for modern HR management. Track attendance, process payroll, and manage leaves effortlessly.
        </p>

        <Link
          href="/login"
          className="group inline-flex items-center gap-2 px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-full text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <span>Get Started</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </main>

      {/* Simple Footer */}
      <footer className="relative z-10 p-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Musterbook. All rights reserved.
      </footer>
    </div>
  )
}
