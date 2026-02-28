'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number; y: number; vx: number; vy: number
  radius: number; opacity: number; color: string
  pulse: number; pulseSpeed: number
}

interface Orb {
  x: number; y: number; vx: number; vy: number
  radius: number; color: string; alpha: number; t: number; speed: number
}

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#60a5fa', '#34d399', '#f472b6']

export default function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const orbsRef = useRef<Orb[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    particlesRef.current = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
    }))

    orbsRef.current = Array.from({ length: 6 }, (_, i) => ({
      x: (canvas.width / 7) * (i + 1),
      y: canvas.height / 2 + (Math.random() - 0.5) * canvas.height * 0.4,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: 60 + Math.random() * 80,
      color: COLORS[i % COLORS.length],
      alpha: 0.06 + Math.random() * 0.08,
      t: Math.random() * Math.PI * 2,
      speed: 0.003 + Math.random() * 0.005,
    }))

    const draw = () => {
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      // Background
      const bg = ctx.createLinearGradient(0, 0, w, h)
      bg.addColorStop(0, '#0f0a1e')
      bg.addColorStop(0.5, '#0d1117')
      bg.addColorStop(1, '#0a0f1e')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      // Glowing orbs
      for (const orb of orbsRef.current) {
        orb.t += orb.speed
        orb.x += Math.sin(orb.t * 0.7) * 0.4 + orb.vx
        orb.y += Math.cos(orb.t * 0.5) * 0.3 + orb.vy
        if (orb.x < -orb.radius) orb.x = w + orb.radius
        if (orb.x > w + orb.radius) orb.x = -orb.radius
        if (orb.y < -orb.radius) orb.y = h + orb.radius
        if (orb.y > h + orb.radius) orb.y = -orb.radius

        const alphaHex = Math.floor(orb.alpha * 255).toString(16).padStart(2, '0')
        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius)
        grad.addColorStop(0, orb.color + alphaHex)
        grad.addColorStop(1, 'transparent')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2)
        ctx.fill()
      }

      // Connection lines
      const pts = particlesRef.current
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x
          const dy = pts[i].y - pts[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(99,102,241,${0.12 * (1 - dist / 100)})`
            ctx.lineWidth = 0.5
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
            ctx.stroke()
          }
        }
      }

      // Particles
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy; p.pulse += p.pulseSpeed
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0

        const r = p.radius + Math.sin(p.pulse) * 0.5
        const alpha = p.opacity + Math.sin(p.pulse) * 0.1

        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4)
        glow.addColorStop(0, p.color + 'aa')
        glow.addColorStop(1, 'transparent')
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2)
        ctx.fill()

        ctx.beginPath()
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
        ctx.fillStyle = p.color + Math.floor(alpha * 255).toString(16).padStart(2, '0')
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: 'block' }}
    />
  )
}
