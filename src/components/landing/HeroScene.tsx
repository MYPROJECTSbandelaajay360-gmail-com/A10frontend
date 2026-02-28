'use client'

/**
 * Professional SaaS hero background — clean gradient with subtle
 * decorative blurs. No canvas, no Three.js, pure CSS.
 */
export default function HeroScene() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0b1120] via-[#0f1a35] to-[#0b1120]" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Decorative gradient orbs */}
      <div className="absolute top-[-15%] left-[10%] w-[500px] h-[500px] bg-blue-600/[0.12] rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[5%] w-[450px] h-[450px] bg-indigo-500/[0.10] rounded-full blur-[120px]" />
      <div className="absolute top-[40%] right-[25%] w-[300px] h-[300px] bg-cyan-500/[0.06] rounded-full blur-[100px]" />

      {/* Top-right accent line */}
      <div className="absolute top-0 right-0 w-[600px] h-[1px] bg-gradient-to-l from-transparent via-blue-500/20 to-transparent" />
      {/* Bottom edge fade to white */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </div>
  )
}
