'use client'

import { useRef, useMemo, useState, useEffect, Component, ReactNode } from 'react'
import * as THREE from 'three'

/* ═══════════════════════════════════════════════════════
   Error Boundary — gracefully fallback if WebGL fails
   ═══════════════════════════════════════════════════════ */
class SceneErrorBoundary extends Component<
    { children: ReactNode; fallback: ReactNode },
    { hasError: boolean }
> {
    constructor(props: { children: ReactNode; fallback: ReactNode }) {
        super(props)
        this.state = { hasError: false }
    }
    static getDerivedStateFromError() {
        return { hasError: true }
    }
    componentDidCatch(error: Error) {
        console.warn('[HeroScene] WebGL error, falling back:', error.message)
    }
    render() {
        return this.state.hasError ? this.props.fallback : this.props.children
    }
}

/* ═══════════════════════════════════════════════════════
   Lazy-load R3F (ESM-only) at runtime to avoid SSR issues
   ═══════════════════════════════════════════════════════ */
let CanvasComponent: any = null
let useFrameHook: any = null

function useLazyR3F() {
    const [ready, setReady] = useState(false)
    useEffect(() => {
        let cancelled = false
        import('@react-three/fiber').then((mod) => {
            if (cancelled) return
            CanvasComponent = mod.Canvas
            useFrameHook = mod.useFrame
            setReady(true)
        }).catch(() => {
            console.warn('[HeroScene] Could not load @react-three/fiber')
        })
        return () => { cancelled = true }
    }, [])
    return ready
}

/* ═══════════════════════════════════════════════════════
   Floating Sphere — standard material, animated manually
   ═══════════════════════════════════════════════════════ */
function FloatingSphere({ position, color, size, speed }: {
    position: [number, number, number]
    color: string
    size: number
    speed: number
}) {
    const meshRef = useRef<THREE.Mesh>(null!)
    const origin = useMemo(() => new THREE.Vector3(...position), [position])

    if (useFrameHook) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useFrameHook((state: any) => {
            if (!meshRef.current) return
            const t = state.clock.elapsedTime
            meshRef.current.rotation.x = t * speed * 0.3
            meshRef.current.rotation.y = t * speed * 0.2
            // Float motion
            meshRef.current.position.y = origin.y + Math.sin(t * speed * 0.5) * 0.4
            meshRef.current.position.x = origin.x + Math.cos(t * speed * 0.3) * 0.15
        })
    }

    return (
        <mesh ref={meshRef} position={position}>
            <icosahedronGeometry args={[size, 4]} />
            <meshStandardMaterial
                color={color}
                transparent
                opacity={0.3}
                roughness={0.2}
                metalness={0.8}
                emissive={color}
                emissiveIntensity={0.15}
            />
        </mesh>
    )
}

/* ═══════════════════════════════════════════════════════
   Particle Field — 600 stars with vertex colors
   ═══════════════════════════════════════════════════════ */
function ParticleField() {
    const particleCount = 600
    const meshRef = useRef<THREE.Points>(null!)
    const geoRef = useRef<THREE.BufferGeometry>(null!)

    const { positions, colors } = useMemo(() => {
        const positions = new Float32Array(particleCount * 3)
        const colors = new Float32Array(particleCount * 3)
        const c = new THREE.Color()
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 15
            positions[i * 3 + 1] = (Math.random() - 0.5) * 15
            positions[i * 3 + 2] = (Math.random() - 0.5) * 15
            c.setHSL(0.55 + Math.random() * 0.15, 0.8, 0.6 + Math.random() * 0.3)
            colors[i * 3] = c.r
            colors[i * 3 + 1] = c.g
            colors[i * 3 + 2] = c.b
        }
        return { positions, colors }
    }, [])

    // Imperatively set attributes to avoid R3F type issues
    useEffect(() => {
        if (!geoRef.current) return
        geoRef.current.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        geoRef.current.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    }, [positions, colors])

    if (useFrameHook) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useFrameHook((state: any) => {
            if (!meshRef.current) return
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.02
            meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1
        })
    }

    return (
        <points ref={meshRef}>
            <bufferGeometry ref={geoRef} />
            <pointsMaterial
                size={0.03}
                vertexColors
                transparent
                opacity={0.6}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    )
}

/* ═══════════════════════════════════════════════════════
   Glowing Ring — torus with emissive glow
   ═══════════════════════════════════════════════════════ */
function GlowingRing({ position, color, size }: {
    position: [number, number, number]
    color: string
    size: number
}) {
    const meshRef = useRef<THREE.Mesh>(null!)
    const origin = useMemo(() => new THREE.Vector3(...position), [position])

    if (useFrameHook) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useFrameHook((state: any) => {
            if (!meshRef.current) return
            const t = state.clock.elapsedTime
            meshRef.current.rotation.x = t * 0.4
            meshRef.current.rotation.z = t * 0.2
            meshRef.current.position.y = origin.y + Math.sin(t * 0.6) * 0.25
        })
    }

    return (
        <mesh ref={meshRef} position={position}>
            <torusGeometry args={[size, size * 0.08, 16, 100]} />
            <meshStandardMaterial
                color={color}
                transparent
                opacity={0.25}
                emissive={color}
                emissiveIntensity={0.4}
                roughness={0.3}
                metalness={0.9}
            />
        </mesh>
    )
}

/* ═══════════════════════════════════════════════════════
   Wobble Blob — large subtle sphere
   ═══════════════════════════════════════════════════════ */
function WobbleBlob() {
    const meshRef = useRef<THREE.Mesh>(null!)

    if (useFrameHook) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useFrameHook((state: any) => {
            if (!meshRef.current) return
            const t = state.clock.elapsedTime
            meshRef.current.rotation.y = t * 0.1
            meshRef.current.rotation.x = Math.sin(t * 0.15) * 0.2
            const s = 1 + Math.sin(t * 0.8) * 0.05
            meshRef.current.scale.set(s, s + Math.sin(t * 1.2) * 0.03, s)
        })
    }

    return (
        <mesh ref={meshRef} position={[0, 0, -3]}>
            <sphereGeometry args={[2.5, 64, 64]} />
            <meshStandardMaterial
                color="#3b82f6"
                transparent
                opacity={0.06}
                roughness={0.5}
                metalness={0.5}
                emissive="#3b82f6"
                emissiveIntensity={0.08}
            />
        </mesh>
    )
}

/* ═══════════════════════════════════════════════════════
   Scene Composition
   ═══════════════════════════════════════════════════════ */
function Scene() {
    return (
        <>
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 5, 5]} intensity={0.6} color="#93c5fd" />
            <pointLight position={[-5, -3, -5]} intensity={0.4} color="#a78bfa" />
            <pointLight position={[3, 4, 2]} intensity={0.3} color="#60a5fa" />

            <ParticleField />
            <WobbleBlob />

            <FloatingSphere position={[-3.5, 1.5, -2]} color="#3b82f6" size={0.6} speed={1.2} />
            <FloatingSphere position={[4, -1, -3]} color="#8b5cf6" size={0.8} speed={0.8} />
            <FloatingSphere position={[-2, -2, -1]} color="#06b6d4" size={0.4} speed={1.5} />
            <FloatingSphere position={[3, 2.5, -4]} color="#2563eb" size={0.5} speed={1.0} />
            <FloatingSphere position={[-4.5, -0.5, -5]} color="#7c3aed" size={0.7} speed={0.6} />
            <FloatingSphere position={[1.5, 3, -2.5]} color="#0ea5e9" size={0.35} speed={1.8} />

            <GlowingRing position={[3.5, 1, -3]} color="#3b82f6" size={1.2} />
            <GlowingRing position={[-3, -1.5, -4]} color="#8b5cf6" size={0.8} />
        </>
    )
}

/* ═══════════════════════════════════════════════════════
   Fallback gradient (when WebGL unavailable)
   ═══════════════════════════════════════════════════════ */
function GradientFallback() {
    return (
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900" />
            {/* Animated orbs via pure CSS */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
    )
}

/* ═══════════════════════════════════════════════════════
   Dynamic Canvas — lazy-loaded R3F with error boundary
   ═══════════════════════════════════════════════════════ */
function DynamicCanvas() {
    const r3fReady = useLazyR3F()

    if (!r3fReady || !CanvasComponent) return <GradientFallback />

    const C = CanvasComponent
    return (
        <div className="absolute inset-0 z-0">
            <C
                camera={{ position: [0, 0, 6], fov: 60 }}
                dpr={[1, 1.5]}
                gl={{ antialias: true, alpha: true }}
                style={{ background: 'transparent' }}
            >
                <Scene />
            </C>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════
   Exported Component
   ═══════════════════════════════════════════════════════ */
export default function HeroScene() {
    return (
        <SceneErrorBoundary fallback={<GradientFallback />}>
            <DynamicCanvas />
        </SceneErrorBoundary>
    )
}
