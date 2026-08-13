'use client'

import { useEffect, useRef, useCallback } from 'react'

/*
  VerticalBarsNoise — an animated field of bars scattered along horizontal rules,
  displaced by a noise function and disturbed by the pointer.

  Four changes from the component as published, all of them required to run this
  as a section background rather than as a full-screen page backdrop. Each is
  marked at its site below:

  1. It measures its own parent, not `window`. As published it sized the canvas
     to innerWidth/innerHeight, which is correct for a fixed backdrop and wrong
     for anything else — behind a section it would paint a viewport-sized field
     into a box of some other height and the bottom of the band would be blank.
  2. It stops when it is off screen. A requestAnimationFrame loop that never
     yields costs the same on a page nobody is looking at, and this one is
     re-evaluating a trig-heavy noise function some fifteen thousand times a
     frame.
  3. It honours prefers-reduced-motion by painting one still frame. The rest of
     this site does; a field of bars sliding under the copy is exactly what that
     setting is asking not to see.
  4. The colours are parsed once per frame instead of once per bar. As published
     `hexToRgb` ran inside the innermost loop, so it re-parsed the same two
     strings thousands of times a frame.
*/

interface VerticalBarsNoiseProps {
  backgroundColor?: string
  lineColor?: string
  barColor?: string
  lineWidth?: number
  animationSpeed?: number
  removeWaveLine?: boolean
}

const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const cleanHex = hex.charAt(0) === '#' ? hex.substring(1) : hex
  const r = Number.parseInt(cleanHex.substring(0, 2), 16)
  const g = Number.parseInt(cleanHex.substring(2, 4), 16)
  const b = Number.parseInt(cleanHex.substring(4, 6), 16)
  return { r, g, b }
}

const VerticalBarsNoise = ({
  backgroundColor = '#F0EEE6',
  lineColor = '#444',
  barColor = '#000000',
  lineWidth = 1,
  animationSpeed = 0.0005,
  removeWaveLine = true,
}: VerticalBarsNoiseProps) => {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const timeRef = useRef<number>(0)
  const animationFrameId = useRef<number | null>(null)
  const mouseRef = useRef({ x: 0, y: 0, isDown: false })
  const ripples = useRef<Array<{ x: number; y: number; time: number; intensity: number }>>([])

  const noise = (x: number, y: number, t: number): number => {
    const n =
      Math.sin(x * 0.01 + t) * Math.cos(y * 0.01 + t) +
      Math.sin(x * 0.015 - t) * Math.cos(y * 0.005 + t)
    return (n + 1) / 2
  }

  const getMouseInfluence = (x: number, y: number): number => {
    const dx = x - mouseRef.current.x
    const dy = y - mouseRef.current.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const maxDistance = 200
    return Math.max(0, 1 - distance / maxDistance)
  }

  const getRippleInfluence = (x: number, y: number, currentTime: number): number => {
    let totalInfluence = 0
    ripples.current.forEach((ripple) => {
      const age = currentTime - ripple.time
      const maxAge = 2000
      if (age < maxAge) {
        const dx = x - ripple.x
        const dy = y - ripple.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const rippleRadius = (age / maxAge) * 300
        const rippleWidth = 50
        if (Math.abs(distance - rippleRadius) < rippleWidth) {
          const rippleStrength = (1 - age / maxAge) * ripple.intensity
          const proximityToRipple = 1 - Math.abs(distance - rippleRadius) / rippleWidth
          totalInfluence += rippleStrength * proximityToRipple
        }
      }
    })
    return Math.min(totalInfluence, 2)
  }

  /*
    (1) Sized from the wrapper, which is `absolute inset-0` inside whatever
    section this is dropped into — so the canvas is exactly the band, at any
    height, including the heights the band takes at breakpoints where the copy
    wraps to another line.
  */
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    const dpr = window.devicePixelRatio || 1
    const displayWidth = wrap.clientWidth
    const displayHeight = wrap.clientHeight
    if (displayWidth === 0 || displayHeight === 0) return

    /* Backing store in device pixels, CSS box in layout pixels. Assigning
       width/height also clears the context transform, which is why the scale
       below is reapplied every time rather than only once. */
    canvas.width = displayWidth * dpr
    canvas.height = displayHeight * dpr
    canvas.style.width = `${displayWidth}px`
    canvas.style.height = `${displayHeight}px`

    canvas.getContext('2d')?.scale(dpr, dpr)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const wrap = wrapRef.current
    if (!wrap) return

    const rect = wrap.getBoundingClientRect()
    mouseRef.current.x = e.clientX - rect.left
    mouseRef.current.y = e.clientY - rect.top
  }, [])

  const handleMouseDown = useCallback((e: MouseEvent) => {
    mouseRef.current.isDown = true
    const wrap = wrapRef.current
    if (!wrap) return

    const rect = wrap.getBoundingClientRect()
    ripples.current.push({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      time: Date.now(),
      intensity: 1.5,
    })

    const now = Date.now()
    ripples.current = ripples.current.filter((ripple) => now - ripple.time < 2000)
  }, [])

  const handleMouseUp = useCallback(() => {
    mouseRef.current.isDown = false
  }, [])

  /*
    One frame, drawn at whatever `timeRef` currently is. Split out from the loop
    below so a still frame can be painted on its own — which is what both the
    reduced-motion path and a resize-while-paused need.
  */
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const currentTime = Date.now()
    const canvasWidth = canvas.clientWidth
    const canvasHeight = canvas.clientHeight

    const numLines = Math.floor(canvasHeight / 11)
    const lineSpacing = canvasHeight / numLines

    /* (4) Parsed once a frame rather than once a bar. */
    const lineRgb = hexToRgb(lineColor)
    const barRgb = hexToRgb(barColor)

    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    for (let i = 0; i < numLines; i++) {
      const y = i * lineSpacing + lineSpacing / 2
      const mouseInfluence = getMouseInfluence(canvasWidth / 2, y)
      const lineAlpha = Math.max(0.3, 0.3 + mouseInfluence * 0.7)

      ctx.beginPath()
      ctx.strokeStyle = `rgba(${lineRgb.r}, ${lineRgb.g}, ${lineRgb.b}, ${lineAlpha})`
      ctx.lineWidth = lineWidth + mouseInfluence * 2
      ctx.moveTo(0, y)
      ctx.lineTo(canvasWidth, y)
      ctx.stroke()

      for (let x = 0; x < canvasWidth; x += 8) {
        const noiseVal = noise(x, y, timeRef.current)
        const mouseInfl = getMouseInfluence(x, y)
        const rippleInfl = getRippleInfluence(x, y, currentTime)
        const totalInfluence = mouseInfl + rippleInfl

        const threshold = Math.max(0.2, 0.5 - mouseInfl * 0.2 - Math.abs(rippleInfl) * 0.1)

        if (noiseVal > threshold) {
          const barWidth = 3 + noiseVal * 10 + totalInfluence * 5
          const barHeight = 2 + noiseVal * 3 + totalInfluence * 3

          const baseAnimation = Math.sin(timeRef.current + y * 0.0375) * 20 * noiseVal
          const mouseAnimation = mouseRef.current.isDown
            ? Math.sin(timeRef.current * 3 + x * 0.01) * 10 * mouseInfl
            : 0
          const rippleAnimation = rippleInfl * Math.sin(timeRef.current * 2 + x * 0.02) * 15

          const animatedX = x + baseAnimation + mouseAnimation + rippleAnimation

          const intensity = Math.min(1, Math.max(0.7, 0.7 + totalInfluence * 0.3))
          ctx.fillStyle = `rgba(${barRgb.r}, ${barRgb.g}, ${barRgb.b}, ${intensity})`

          ctx.fillRect(animatedX - barWidth / 2, y - barHeight / 2, barWidth, barHeight)
        }
      }
    }

    if (!removeWaveLine) {
      ripples.current.forEach((ripple) => {
        const age = currentTime - ripple.time
        const maxAge = 2000
        if (age < maxAge) {
          const progress = age / maxAge
          const radius = progress * 300
          const alpha = (1 - progress) * 0.3 * ripple.intensity

          ctx.beginPath()
          ctx.strokeStyle = `rgba(100, 100, 100, ${alpha})`
          ctx.lineWidth = 2
          ctx.arc(ripple.x, ripple.y, radius, 0, 2 * Math.PI)
          ctx.stroke()
        }
      })
    }
  }, [backgroundColor, lineColor, barColor, lineWidth, removeWaveLine])

  const animate = useCallback(() => {
    timeRef.current += animationSpeed
    draw()
    animationFrameId.current = requestAnimationFrame(animate)
  }, [draw, animationSpeed])

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    resizeCanvas()

    const stop = () => {
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current)
        animationFrameId.current = null
      }
    }

    /* (3) One still frame and nothing else. Read once at mount rather than
       subscribed to: someone who changes this preference mid-visit reloads. */
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    /* (1) ResizeObserver on the wrapper rather than a window resize listener —
       the band's height changes when the copy rewraps, which is not a window
       resize, and a window listener would miss it. */
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas()
      /* Repaint immediately: while paused nothing else would, and a resized
         canvas is a cleared canvas. */
      if (animationFrameId.current === null) draw()
    })
    resizeObserver.observe(wrap)

    /* (2) Runs only while the band is somewhere on screen. */
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (reduceMotion) draw()
        else if (animationFrameId.current === null) animate()
      } else {
        stop()
      }
    })
    visibilityObserver.observe(wrap)

    wrap.addEventListener('mousemove', handleMouseMove)
    wrap.addEventListener('mousedown', handleMouseDown)
    wrap.addEventListener('mouseup', handleMouseUp)

    return () => {
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      wrap.removeEventListener('mousemove', handleMouseMove)
      wrap.removeEventListener('mousedown', handleMouseDown)
      wrap.removeEventListener('mouseup', handleMouseUp)

      stop()
      timeRef.current = 0
      ripples.current = []
    }
  }, [animate, draw, resizeCanvas, handleMouseMove, handleMouseDown, handleMouseUp])

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0 h-full w-full overflow-hidden"
      style={{ backgroundColor }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}

export default VerticalBarsNoise
