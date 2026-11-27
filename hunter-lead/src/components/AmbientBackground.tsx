import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'motion/react'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  hue: 'violet' | 'cyan'
}

export default function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointer = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 })
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let dpr = 1
    let frameId = 0
    let particles: Particle[] = []

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      let count = 28
      if (width >= 768) count = 44
      if (width >= 1280) count = 58
      particles = Array.from({ length: count }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        size: 0.7 + Math.random() * 1.6,
        hue: index % 3 === 0 ? 'cyan' : 'violet',
      }))
    }

    const drawMesh = (time: number) => {
      const spacing = width < 640 ? 42 : 58
      const rows = Math.ceil(height / spacing) + 1
      const parallaxX = (pointer.current.x - 0.5) * 26
      const parallaxY = (pointer.current.y - 0.5) * 18

      for (let row = 0; row < rows; row += 1) {
        ctx.beginPath()
        for (let x = -30; x <= width + 30; x += 14) {
          const wave =
            Math.sin(x * 0.009 + time * 0.00055 + row * 0.42) * 9 +
            Math.sin(x * 0.004 - time * 0.00038 + row * 0.18) * 5
          const y =
            row * spacing +
            wave +
            parallaxY * (row % 2 === 0 ? 1 : -1) +
            Math.sin(time * 0.00025 + row) * 2
          const px = x + parallaxX * Math.sin(row * 0.7)
          if (x === -30) ctx.moveTo(px, y)
          else ctx.lineTo(px, y)
        }
        ctx.strokeStyle = `rgba(139, 92, 246, ${0.035 + (row % 3) * 0.008})`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      ctx.strokeStyle = 'rgba(6, 182, 212, 0.028)'
      for (let col = 0; col < 7; col += 1) {
        const base = ((col + 0.5) / 7) * width + parallaxX
        ctx.beginPath()
        ctx.moveTo(base, -20)
        ctx.bezierCurveTo(
          base + 70 + parallaxY,
          height * 0.3,
          base - 80 + parallaxY,
          height * 0.7,
          base + parallaxX * 0.4,
          height + 20,
        )
        ctx.stroke()
      }
    }

    const drawParticles = (time: number) => {
      for (const particle of particles) {
        if (!reduceMotion) {
          particle.x += particle.vx
          particle.y += particle.vy
          if (particle.x < -10) particle.x = width + 10
          if (particle.x > width + 10) particle.x = -10
          if (particle.y < -10) particle.y = height + 10
          if (particle.y > height + 10) particle.y = -10
        }

        const drift = Math.sin(time * 0.001 + particle.x * 0.01) * 4
        ctx.beginPath()
        ctx.arc(
          particle.x + (pointer.current.x - 0.5) * 12,
          particle.y + drift + (pointer.current.y - 0.5) * 8,
          particle.size,
          0,
          Math.PI * 2,
        )
        ctx.fillStyle =
          particle.hue === 'cyan' ? 'rgba(34, 211, 238, 0.42)' : 'rgba(167, 139, 250, 0.36)'
        ctx.fill()
      }
    }

    const frame = (time: number) => {
      pointer.current.x += (pointer.current.targetX - pointer.current.x) * 0.045
      pointer.current.y += (pointer.current.targetY - pointer.current.y) * 0.045
      ctx.clearRect(0, 0, width, height)
      drawMesh(time)
      drawParticles(time)
      if (!reduceMotion) frameId = requestAnimationFrame(frame)
    }

    const onPointerMove = (event: PointerEvent) => {
      pointer.current.targetX = event.clientX / Math.max(width, 1)
      pointer.current.targetY = event.clientY / Math.max(height, 1)
    }

    resize()
    frame(0)

    window.addEventListener('resize', resize)
    if (!reduceMotion) window.addEventListener('pointermove', onPointerMove)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
    }
  }, [reduceMotion])

  return (
    <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,#1b0f3a_0%,#0b0619_45%,#090514_100%)]" />
      <div className="ambient-wave-bg" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-80" />
      <motion.div
        className="absolute -left-52 top-[-12%] h-[34rem] w-[34rem] rounded-full bg-[#8B5CF6]/20 blur-[130px]"
        animate={reduceMotion ? {} : { x: [0, 36, 0], y: [0, 24, 0], scale: [1, 1.12, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-56 top-[24%] h-[32rem] w-[32rem] rounded-full bg-[#06B6D4]/12 blur-[140px]"
        animate={reduceMotion ? {} : { x: [0, -42, 0], y: [0, -28, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-18%] left-1/3 h-[30rem] w-[30rem] rounded-full bg-[#10B981]/10 blur-[150px]"
        animate={reduceMotion ? {} : { x: [0, 28, 0], scale: [1, 1.14, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[length:56px_56px]" />
    </div>
  )
}
