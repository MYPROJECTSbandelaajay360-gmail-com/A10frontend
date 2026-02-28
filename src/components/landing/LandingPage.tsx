'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import {
  Zap, ArrowRight, Clock, DollarSign, CalendarCheck, Shield, BarChart3,
  Users, Play, Menu, X, Star, Building2, Globe, Headphones, Mail, MapPin,
  Phone, Check, Sparkles, TrendingUp, Lock, ChevronRight, Eye, Layers,
  MousePointer2, Cpu, Award, ArrowUpRight
} from 'lucide-react'

// Lazy load Three.js scene (heavy)
const HeroScene = dynamic(() => import('./HeroScene'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900" />,
})

/* ═══════════════════════════════════════════════════════
   UTILITY COMPONENTS
   ═══════════════════════════════════════════════════════ */

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const end = value
    const dur = 2000
    const step = Math.max(Math.floor(dur / end), 10)
    const timer = setInterval(() => {
      start += Math.ceil(end / (dur / step))
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(start)
    }, step)
    return () => clearInterval(timer)
  }, [isInView, value])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

function FadeIn({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function GlassCard({ children, className = '', hover = true }: { children: React.ReactNode; className?: string; hover?: boolean }) {
  return (
    <motion.div
      whileHover={hover ? { y: -6, scale: 1.02 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden group ${className}`}
    >
      {/* Gradient border glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-[-1px] rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20" />
      </div>
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════
   DASHBOARD MOCKUP
   ═══════════════════════════════════════════════════════ */
function DashboardMockup() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 bg-gradient-to-r from-blue-500/20 via-purple-500/15 to-cyan-500/20 rounded-3xl blur-3xl" />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200/60 overflow-hidden ring-1 ring-black/5">
        {/* Browser Chrome */}
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-white rounded-md px-4 py-1 text-xs text-gray-400 border border-gray-200 flex items-center gap-2">
              <Lock className="w-3 h-3" /> musterbook.com/dashboard
            </div>
          </div>
        </div>
        <div className="flex">
          {/* Mini Sidebar */}
          <div className="w-48 bg-gradient-to-b from-[#0f172a] via-[#1a2d55] to-[#0f172a] p-3 hidden lg:block">
            <div className="flex items-center gap-2 mb-6 px-1">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-white text-xs font-semibold">Musterbook</span>
            </div>
            {['Dashboard', 'Employees', 'Attendance', 'Leave', 'Payroll', 'Reports', 'Settings'].map((item, i) => (
              <div key={item} className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-[10px] mb-0.5 ${i === 0 ? 'bg-white/10 text-white font-medium' : 'text-gray-400'}`}>
                <div className={`w-4 h-4 rounded ${i === 0 ? 'bg-blue-500/30' : 'bg-white/5'}`} />{item}
              </div>
            ))}
          </div>
          {/* Main Content */}
          <div className="flex-1 p-4 bg-gray-50/50 min-h-[300px]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-gray-900">Good Morning, Jay! 👋</p>
                <p className="text-[10px] text-gray-500">Here&apos;s what&apos;s happening today.</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">JA</div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: 'Total Employees', value: '198', color: 'text-gray-700' },
                { label: 'Present Today', value: '16', color: 'text-green-600' },
                { label: 'On Leave', value: '4', color: 'text-orange-600' },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                  <p className="text-[9px] text-gray-500 mb-1">{s.label}</p>
                  <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                <p className="text-[10px] font-bold text-gray-900 mb-2">Recent Activity</p>
                {[
                  { name: 'Ayush Verma', action: 'checked in', time: '5 mins ago', color: 'bg-blue-500' },
                  { name: 'Maya Sharma', action: 'checked in', time: '20 mins ago', color: 'bg-purple-500' },
                  { name: 'Aditya Singh', action: 'applied leave', time: '1 hr ago', color: 'bg-green-500' },
                ].map((a) => (
                  <div key={a.name} className="flex items-center gap-2 mb-2">
                    <div className={`w-5 h-5 rounded-full ${a.color} flex items-center justify-center text-white text-[7px] font-bold`}>{a.name.split(' ').map(n => n[0]).join('')}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] text-gray-900 truncate"><span className="font-bold">{a.name}</span> {a.action}</p>
                      <p className="text-[7px] text-gray-400">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                <p className="text-[10px] font-bold text-gray-900 mb-2">Upcoming Holidays</p>
                {[{ name: 'Holi', date: 'Mar 14, 2026' }, { name: 'Eid-ul-Fitr', date: 'Mar 16, 2026' }, { name: 'Good Friday', date: 'Apr 3, 2026' }].map((h) => (
                  <div key={h.name} className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded bg-purple-50 flex items-center justify-center"><CalendarCheck className="w-3 h-3 text-purple-500" /></div>
                    <div><p className="text-[8px] font-bold text-gray-900">{h.name}</p><p className="text-[7px] text-gray-400">{h.date}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   MARQUEE LOGOS
   ═══════════════════════════════════════════════════════ */
function LogoMarquee() {
  const logos = [
    { name: 'StrateSoft', icon: Building2 },
    { name: 'Nexion', icon: Globe },
    { name: 'Thinkwired', icon: Sparkles },
    { name: 'Movix', icon: TrendingUp },
    { name: 'CloudBase', icon: Shield },
    { name: 'DataSynth', icon: Cpu },
    { name: 'BrightEdge', icon: Award },
    { name: 'StrateSoft', icon: Building2 },
    { name: 'Nexion', icon: Globe },
    { name: 'Thinkwired', icon: Sparkles },
    { name: 'Movix', icon: TrendingUp },
    { name: 'CloudBase', icon: Shield },
  ]
  return (
    <div className="relative overflow-hidden py-6">
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />
      <motion.div
        className="flex gap-16 items-center"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        {logos.map((logo, i) => (
          <div key={i} className="flex items-center gap-2.5 shrink-0 opacity-40 hover:opacity-70 transition-opacity">
            <logo.icon className="w-5 h-5 text-gray-700" />
            <span className="text-lg font-bold text-gray-700 tracking-tight whitespace-nowrap">{logo.name}</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.12], [1, 0.97])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ]

  const features = [
    { icon: Clock, title: 'Real-time Attendance', description: 'Automate attendance management with GPS-enabled check-ins, biometric integration, and live tracking.', gradient: 'from-blue-500 to-cyan-400' },
    { icon: DollarSign, title: 'Automated Payroll', description: 'Accurate, timely payroll with full compliance. Auto-calculate taxes, deductions, and generate payslips.', gradient: 'from-emerald-500 to-green-400' },
    { icon: CalendarCheck, title: 'Smart Leave Approvals', description: 'Automated approval workflows, track balances, set policies, and handle requests effortlessly.', gradient: 'from-purple-500 to-violet-400' },
    { icon: Shield, title: 'Compliance Ready', description: 'Stay updated with labor laws, automate statutory deductions, and maintain complete audit trails.', gradient: 'from-orange-500 to-amber-400' },
    { icon: BarChart3, title: 'HR Analytics', description: 'Powerful dashboards with real-time insights. Track attrition, attendance trends, and make data-driven decisions.', gradient: 'from-pink-500 to-rose-400' },
    { icon: Users, title: 'Employee Records', description: 'Centralized database with profiles. Manage documents, track history, and streamline onboarding.', gradient: 'from-indigo-500 to-blue-400' },
  ]

  const stats = [
    { value: 5000, suffix: '+', label: 'Businesses Trust Us' },
    { value: 99, suffix: '.9%', label: 'Uptime Guaranteed' },
    { value: 50, suffix: 'K+', label: 'Employees Managed' },
    { value: 24, suffix: '/7', label: 'Support Available' },
  ]

  const pricingPlans = [
    {
      name: 'Starter', price: '499', period: '/mo',
      description: 'Perfect for small teams getting started',
      features: ['Up to 25 employees', 'Attendance tracking', 'Leave management', 'Basic reports', 'Email support'],
      cta: 'Start Free Trial', popular: false,
    },
    {
      name: 'Professional', price: '1,499', period: '/mo',
      description: 'For growing businesses that need more',
      features: ['Up to 200 employees', 'Everything in Starter', 'Payroll processing', 'Advanced analytics', 'Priority support', 'Custom integrations'],
      cta: 'Start Free Trial', popular: true,
    },
    {
      name: 'Enterprise', price: 'Custom', period: '',
      description: 'For large organizations with custom needs',
      features: ['Unlimited employees', 'Everything in Professional', 'Dedicated account manager', 'Custom workflows', 'SLA guarantee', 'On-premise option'],
      cta: 'Contact Sales', popular: false,
    },
  ]

  const testimonials = [
    { name: 'Priya Sharma', role: 'HR Director', company: 'StrateSoft', text: 'Musterbook has completely transformed how we manage our workforce. Payroll that used to take days now takes minutes.' },
    { name: 'Rahul Mehta', role: 'COO', company: 'Nexion Technologies', text: 'We evaluated 10+ HRMS solutions before choosing Musterbook. The combination of powerful features and intuitive design is unmatched.' },
    { name: 'Anita Desai', role: 'People Operations', company: 'Thinkwired', text: 'The leave management module alone saved us 20+ hours per month. The automated workflows have eliminated manual errors.' },
  ]

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ═══ NAVBAR ═══ */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
          ? 'bg-white/80 backdrop-blur-2xl shadow-sm shadow-black/5 border-b border-gray-100'
          : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className={`font-bold text-xl ${scrolled ? 'text-gray-900' : 'text-white'} transition-colors`}>Musterbook</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a key={link.label} href={link.href}
                  className={`text-sm font-medium transition-colors relative group ${scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/70 hover:text-white'}`}>
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              <Link href="/login" className={`text-sm font-medium px-4 py-2 transition-colors ${scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'}`}>
                Sign In
              </Link>
              <Link href="/register" className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-full transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5">
                Get Started Free
              </Link>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors">
              {mobileMenuOpen ? <X className={`w-6 h-6 ${scrolled ? 'text-gray-900' : 'text-white'}`} /> : <Menu className={`w-6 h-6 ${scrolled ? 'text-gray-900' : 'text-white'}`} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white/95 backdrop-blur-2xl border-t border-gray-100 shadow-lg">
              <div className="px-4 py-4 space-y-2">
                {navLinks.map((link) => (
                  <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg">
                    {link.label}
                  </a>
                ))}
                <div className="pt-2 border-t border-gray-100 space-y-2">
                  <Link href="/login" className="block px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">Sign In</Link>
                  <Link href="/register" className="block px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg text-center">Get Started Free</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ═══ HERO SECTION — Three.js Background ═══ */}
      <section id="home" className="relative min-h-screen flex items-center overflow-hidden bg-slate-950">
        {/* Three.js Canvas */}
        <HeroScene />

        {/* Gradient overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/80 z-[1]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-[2]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-0 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div style={{ opacity: heroOpacity, scale: heroScale }}>
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 mb-6">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-200">#1 HR Platform for Modern Teams</span>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
                className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
                Simplify Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">
                  Workforce
                </span>
                <br />Management
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
                className="text-lg text-gray-300 leading-relaxed mb-8 max-w-lg">
                All-in-one HR software to manage attendance, payroll, leave, and employee data effortlessly. Trusted by thousands of businesses.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }}
                className="flex flex-wrap gap-4">
                <Link href="/register"
                  className="group inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-full text-sm transition-all shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5">
                  Get Started Free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-full text-sm transition-all border border-white/20 backdrop-blur-sm hover:-translate-y-0.5">
                  <Play className="w-4 h-4 text-blue-400 fill-blue-400" /> Watch Demo
                </button>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.7 }}
                className="mt-10 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {['from-blue-400 to-blue-600', 'from-purple-400 to-purple-600', 'from-green-400 to-green-600', 'from-orange-400 to-orange-600'].map((g, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full bg-gradient-to-br ${g} border-2 border-slate-950 flex items-center justify-center text-white text-[10px] font-bold`}>
                      {['AV', 'MS', 'RK', 'PS'][i]}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-400"><span className="font-semibold text-white">5,000+</span> businesses trust us</div>
              </motion.div>
            </motion.div>

            {/* Dashboard Mockup */}
            <motion.div initial={{ opacity: 0, x: 60, rotateY: -5 }} animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }} className="relative lg:ml-8 hidden lg:block">
              <DashboardMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ TRUSTED BY (Marquee) ═══ */}
      <section className="py-12 border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <p className="text-center text-sm font-medium text-gray-400 uppercase tracking-widest mb-6">
              Trusted by <span className="text-gray-900 font-bold">5,000+</span> businesses worldwide
            </p>
          </FadeIn>
          <LogoMarquee />
        </div>
      </section>

      {/* ═══ FEATURES SECTION ═══ */}
      <section id="features" className="py-24 lg:py-32 relative">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-blue-50/50 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeIn className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-4">
              <Layers className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              Everything Your HR Team Needs.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Nothing They Don&apos;t.</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              A comprehensive suite of tools designed to simplify every aspect of human resource management.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <FadeIn key={feature.title} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -6, boxShadow: '0 25px 50px rgba(0,0,0,0.08)' }}
                  className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm group cursor-default h-full transition-shadow"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                  <div className="mt-5 flex items-center gap-1.5 text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STATS — Glassmorphic Dark Section ═══ */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[350px] h-[350px] bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-3xl" />
        </div>
        {/* Animated grid bg */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.1}>
                <div className="text-center bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all">
                  <p className="text-4xl sm:text-5xl font-extrabold text-white mb-2">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-blue-300 text-sm font-medium">{stat.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WHY CHOOSE MUSTERBOOK ═══ */}
      <section id="about" className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-50/40 rounded-full blur-3xl -translate-x-1/3 translate-y-1/4 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <FadeIn>
                <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-full px-4 py-1.5 mb-4">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Why Musterbook</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-6">
                  Why Modern Teams Choose Musterbook
                </h2>
              </FadeIn>

              <div className="space-y-8 mt-8">
                {[
                  { icon: TrendingUp, title: '3x Faster Payroll Processing', desc: 'Reduce payroll processing time with automated calculations, tax deductions, and compliance in minutes.', color: 'bg-blue-50 text-blue-600' },
                  { icon: Sparkles, title: 'AI-powered Attendance Insights', desc: 'Intelligent analytics to identify patterns, predict absenteeism, and optimize workforce scheduling.', color: 'bg-purple-50 text-purple-600' },
                  { icon: Shield, title: 'Bank-level Security', desc: 'Enterprise-grade encryption, role-based access control, and SOC 2 compliance. Your data stays protected.', color: 'bg-green-50 text-green-600' },
                ].map((b, i) => (
                  <FadeIn key={b.title} delay={i * 0.15}>
                    <div className="flex gap-4 group">
                      <div className={`w-12 h-12 rounded-xl ${b.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                        <b.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{b.title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>

            {/* Payroll Preview */}
            <FadeIn delay={0.2}>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-3xl blur-2xl" />
                <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200/60 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="bg-white rounded-md px-4 py-1 text-xs text-gray-400 border border-gray-200">musterbook.com/payroll</div>
                    </div>
                  </div>
                  <div className="p-6 bg-gray-50/50 min-h-[350px]">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-base font-bold text-gray-900">Payroll Overview</p>
                        <p className="text-xs text-gray-500">February 2026</p>
                      </div>
                      <div className="bg-green-50 text-green-600 text-xs font-medium px-3 py-1 rounded-full">All Processed</div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
                      <div className="flex items-end gap-2 h-32">
                        {[45, 62, 38, 72, 55, 85, 70, 90, 65, 78, 82, 95].map((h, i) => (
                          <motion.div key={i} className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm"
                            initial={{ height: 0 }} whileInView={{ height: `${h}%` }} viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: i * 0.05 }} />
                        ))}
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-[9px] text-gray-400">Jan</span><span className="text-[9px] text-gray-400">Jun</span><span className="text-[9px] text-gray-400">Dec</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[{ label: 'Total Payroll', value: '₹24.5L', change: '+12%' }, { label: 'Employees Paid', value: '198', change: '100%' }, { label: 'Avg. Salary', value: '₹65K', change: '+8%' }].map((s) => (
                        <div key={s.label} className="bg-white rounded-lg border border-gray-100 p-3">
                          <p className="text-[10px] text-gray-500">{s.label}</p>
                          <p className="text-sm font-bold text-gray-900">{s.value}</p>
                          <p className="text-[10px] text-green-500 font-medium">{s.change}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══ PRICING SECTION ═══ */}
      <section id="pricing" className="py-24 lg:py-32 bg-gray-50/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-4 py-1.5 mb-4">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Pricing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Choose the plan that fits your team. No hidden fees, no surprises. Start free for 14 days.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <FadeIn key={plan.name} delay={i * 0.1}>
                <motion.div whileHover={{ y: -8 }}
                  className={`relative rounded-2xl p-8 h-full flex flex-col transition-shadow ${plan.popular
                    ? 'bg-white shadow-xl shadow-blue-500/10 border-2 border-blue-500 ring-4 ring-blue-500/10'
                    : 'bg-white shadow-sm border border-gray-200 hover:shadow-lg'
                  }`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-bold px-5 py-1.5 rounded-full shadow-lg shadow-blue-500/30">Most Popular</span>
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
                    <p className="text-sm text-gray-500">{plan.description}</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold text-gray-900">{plan.price === 'Custom' ? '' : '₹'}{plan.price}</span>
                    <span className="text-gray-500 text-sm">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-blue-600 shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.name === 'Enterprise' ? '#contact' : `/register?plan=${plan.name.toLowerCase()}`}
                    className={`block w-full text-center py-3.5 rounded-full font-semibold text-sm transition-all ${plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}>
                    {plan.cta}
                  </Link>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="py-24 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-100 rounded-full px-4 py-1.5 mb-4">
              <Star className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700">Testimonials</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
              Loved by HR Teams Everywhere
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-lg transition-shadow h-full">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {t.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.role}, {t.company}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA SECTION ═══ */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/15 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        </div>
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-6">
              Ready to Transform Your HR Operations?
            </h2>
            <p className="text-lg text-blue-200 mb-10 max-w-2xl mx-auto">
              Join 5,000+ businesses who already switched to Musterbook. Start your free trial today — no credit card required.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-blue-700 font-bold rounded-full text-base transition-all shadow-xl hover:-translate-y-0.5">
                Start Free Trial <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full text-base transition-all border border-white/20 backdrop-blur-sm hover:-translate-y-0.5">
                <Headphones className="w-5 h-5" /> Talk to Sales
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ CONTACT SECTION ═══ */}
      <section id="contact" className="py-24 lg:py-32 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-4">
              <Mail className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Contact</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
              Get in Touch
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Have questions? Our team is ready to help you get started.
            </p>
          </FadeIn>

          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { icon: Mail, title: 'Email Us', desc: 'hello@musterbook.com', sub: 'We reply within 24 hours' },
              { icon: Phone, title: 'Call Us', desc: '+91 98765 43210', sub: 'Mon-Fri, 9am-6pm IST' },
              { icon: MapPin, title: 'Visit Us', desc: 'Bangalore, India', sub: 'Schedule an office visit' },
            ].map((c, i) => (
              <FadeIn key={c.title} delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center hover:shadow-lg transition-shadow">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                    <c.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{c.title}</h3>
                  <p className="text-gray-900 font-medium mb-1">{c.desc}</p>
                  <p className="text-sm text-gray-500">{c.sub}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-900">Musterbook</span>
              </Link>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                Simplifying HR operations for modern teams. Attendance, payroll, and leave — all in one place.
              </p>
            </div>
            {[
              { title: 'Product', links: [{ name: 'Features', href: '#features' }, { name: 'Pricing', href: '#pricing' }, { name: 'Demo', href: '#home' }, { name: 'Integrations', href: '#features' }] },
              { title: 'Company', links: [{ name: 'About', href: '#about' }, { name: 'Blog', href: '#' }, { name: 'Careers', href: '#' }, { name: 'Contact', href: '#contact' }] },
              { title: 'Resources', links: [{ name: 'Documentation', href: '#' }, { name: 'Help Center', href: '#' }, { name: 'FAQs', href: '#' }, { name: 'API Reference', href: '#' }] },
              { title: 'Legal', links: [{ name: 'Privacy', href: '#' }, { name: 'Terms', href: '#' }, { name: 'Security', href: '#' }, { name: 'GDPR', href: '#' }] },
            ].map((group) => (
              <div key={group.title}>
                <h4 className="font-semibold text-gray-900 text-sm mb-4">{group.title}</h4>
                <ul className="space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.name}>
                      <a href={link.href} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{link.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">© {new Date().getFullYear()} Musterbook. All rights reserved.</p>
            <div className="flex items-center gap-6">
              {['Twitter', 'LinkedIn', 'GitHub'].map((s) => (
                <a key={s} href="#" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">{s}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
