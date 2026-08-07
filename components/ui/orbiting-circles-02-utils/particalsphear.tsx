'use client'

import { useEffect, useRef } from 'react'

/**
 * Points on a Fibonacci lattice. This spaces them far more evenly across the
 * surface than random spherical sampling, which visibly clumps at the poles.
 * Returned flat as [x,y,z, x,y,z, ...] so the render loop never allocates.
 */
function buildSphere(count: number): Float32Array {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  const points = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const ring = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = goldenAngle * i

    points[i * 3] = Math.cos(theta) * ring
    points[i * 3 + 1] = y
    points[i * 3 + 2] = Math.sin(theta) * ring
  }

  return points
}

type ParticleSphereAnimationProps = {
  /** Dots on the sphere. Higher reads denser but costs proportionally more per frame. */
  particleCount?: number
  /** Seconds for one full revolution. */
  duration?: number
  className?: string
}

/**
 * A rotating sphere of particles drawn on a 2D canvas. Deliberately not
 * three.js: the whole effect is an orthographic projection of ~800 points, and
 * a WebGL renderer would add several hundred kilobytes to a marketing page
 * whose only other dependencies are Next, React, Supabase and Zod.
 *
 * Dot colour is inherited from the canvas's computed CSS `color`, so the sphere
 * follows the design tokens in app/tokens.css instead of hardcoding a hex.
 */
export default function ParticleSphereAnimation({
  particleCount = 850,
  duration = 32,
  className = '',
}: ParticleSphereAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const points = buildSphere(particleCount)
    const dotColor = getComputedStyle(canvas).color
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let frame = 0
    let startedAt = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      // Cap the ratio at 2. Beyond that the extra pixels are invisible and the
      // per-frame fill cost keeps climbing.
      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = (spin: number) => {
      if (width === 0 || height === 0) return

      ctx.clearRect(0, 0, width, height)

      const centerX = width / 2
      const centerY = height / 2
      const radius = Math.min(width, height) / 2
      const sinSpin = Math.sin(spin)
      const cosSpin = Math.cos(spin)
      // A fixed tilt keeps the poles off dead centre. Without it the lattice
      // reads as a flat ring rather than a solid volume.
      const sinTilt = Math.sin(-0.35)
      const cosTilt = Math.cos(-0.35)

      ctx.fillStyle = dotColor

      for (let i = 0; i < particleCount; i++) {
        const x = points[i * 3]
        const y = points[i * 3 + 1]
        const z = points[i * 3 + 2]

        // Yaw about Y, then pitch about X. Yaw leaves y untouched and pitch
        // leaves x untouched, so only three products are actually needed.
        const spunX = x * cosSpin - z * sinSpin
        const spunZ = x * sinSpin + z * cosSpin
        const tiltedY = y * cosTilt - spunZ * sinTilt
        const tiltedZ = y * sinTilt + spunZ * cosTilt

        // 0 on the far face, 1 on the near face. Drives both fade and size so
        // the sphere reads as having depth under an orthographic projection.
        const depth = (tiltedZ + 1) / 2

        ctx.globalAlpha = 0.12 + depth * 0.78
        ctx.beginPath()
        ctx.arc(
          centerX + spunX * radius,
          centerY + tiltedY * radius,
          radius * (0.003 + depth * 0.0055),
          0,
          Math.PI * 2,
        )
        ctx.fill()
      }

      ctx.globalAlpha = 1
    }

    const tick = (now: number) => {
      if (startedAt === 0) startedAt = now
      draw((((now - startedAt) / (duration * 1000)) % 1) * Math.PI * 2)
      frame = requestAnimationFrame(tick)
    }

    // The global prefers-reduced-motion rule in globals.css only neutralises CSS
    // animations, so the canvas has to opt out of its own accord.
    const start = () => {
      resize()
      if (reduceMotion) draw(0)
      else if (frame === 0) frame = requestAnimationFrame(tick)
    }

    const observer = new ResizeObserver(start)
    observer.observe(canvas)
    start()

    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [particleCount, duration])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`h-full w-full text-brand-400 ${className}`}
    />
  )
}
