'use client'

import { useEffect, useRef } from 'react'

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  baseX: number
  baseY: number
  radius: number
  label: string
  pulse: number
}

export interface ConstellationGridProps {
  /** Wrapper classes. The canvas fills this element, so it needs a size. */
  className?: string

  /**
   * Canvas fill. Opaque, because the context is created with `alpha: false` —
   * that lets the browser skip compositing this layer against what is behind
   * it, which is most of the win on a canvas that repaints every frame. Set it
   * to whatever the surrounding surface is rather than trying to be
   * transparent.
   */
  background?: string

  /** `'r, g, b'` triples, not hex: alpha is varied per node and per line. */
  nodeColor?: string
  accentColor?: string

  /** Grid pitch in CSS pixels. Lower is denser and costs more per frame. */
  spacing?: number
  /** Two nodes are joined below this separation. */
  connectionDistance?: number

  /**
   * How far each node's anchor is offset from its lattice point, as a fraction
   * of the pitch. 0 is the exact grid.
   */
  jitter?: number

  /**
   * Radius of the cursor's effect, in CSS pixels. Capped at a third of the
   * container width so it stays a local disturbance on narrow viewports instead
   * of lighting up the whole section.
   */
  influenceRadius?: number

  /** Peak line alpha, at zero separation. */
  lineAlpha?: number
  /** Resting node alpha, before the proximity highlight. */
  nodeAlpha?: number

  /**
   * Text shown beside nodes near the cursor, cycled across the grid. Omit for
   * the hex coordinate readout.
   *
   * Labels are baked into the nodes when the grid is built, so changing this
   * rebuilds the simulation — hoist the array to module scope rather than
   * writing it inline in JSX, where a new identity every render would reset the
   * grid continuously.
   */
  labels?: readonly string[]
  labelFont?: string

  /** Drawn over the canvas, inside the same stacking context. */
  children?: React.ReactNode
}

/**
 * A spring-loaded mesh of points that the cursor shoves out of the way.
 *
 * Adapted from the original in three ways that matter for embedding it in a
 * page rather than running it as a standalone full-screen demo:
 *
 * - It measures its own container instead of the window, so it can be a
 *   background layer for a section that is not exactly one viewport tall.
 * - Colours are props rather than a `prefers-color-scheme` switch, so it takes
 *   the palette of the site it is dropped into.
 * - Connections go through a spatial hash instead of comparing every pair.
 *   The all-pairs loop is O(n²) — at this grid pitch a 1440×900 hero is around
 *   450 nodes and 100k comparisons per frame to draw the ~1.5k lines that are
 *   actually short enough to qualify.
 */
export default function ConstellationGrid({
  className = '',
  background = '#030407',
  nodeColor = '255, 255, 255',
  accentColor = '56, 189, 248',
  spacing = 55,
  connectionDistance = 75,
  jitter = 0,
  influenceRadius = 220,
  lineAlpha = 0.18,
  nodeAlpha = 0.25,
  labels,
  labelFont = '8px ui-monospace, SFMono-Regular, Consolas, monospace',
  children,
}: ConstellationGridProps) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  /*
    Colours are read through a ref inside the animation loop rather than being
    listed as effect dependencies, so retinting the mesh does not tear down and
    rebuild the node grid. Only the props that change the grid's structure —
    pitch, connection radius, labels — are dependencies below.
  */
  const settings = useRef({
    background,
    nodeColor,
    accentColor,
    lineAlpha,
    nodeAlpha,
    labelFont,
  })
  settings.current = {
    background,
    nodeColor,
    accentColor,
    lineAlpha,
    nodeAlpha,
    labelFont,
  }

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    if (!host || !canvas) return

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    /*
      The site clamps every CSS animation to a single pass under
      prefers-reduced-motion (globals.css). Canvas work is invisible to that
      rule, so it is honoured explicitly here: one static frame of the grid at
      rest, no loop, no pointer tracking. The mesh is the texture of the
      section, so drawing nothing would leave a hole; drawing it still keeps
      the composition and drops the motion.
    */
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    let animationFrameId = 0
    let width = 0
    let height = 0
    let nodes: Node[] = []

    /*
      Pointer position in canvas-local coordinates. clientX/clientY are viewport
      coordinates and this element is not pinned to the viewport — once the page
      scrolls, or if the hero ever sits below anything, raw client coordinates
      put the interaction somewhere the cursor is not.
    */
    const mouse = {
      x: -1000,
      y: -1000,
      prevX: -1000,
      prevY: -1000,
      vx: 0,
      vy: 0,
      radius: 220,
    }

    // Cached so pointermove does not force a layout read on every event.
    let rect = host.getBoundingClientRect()

    // Spatial hash, rebuilt per frame. Allocated once per resize and cleared by
    // truncation so the frame loop does no allocation.
    let cellSize = connectionDistance
    let gridCols = 0
    let gridRows = 0
    let buckets: number[][] = []

    const initNodes = () => {
      nodes = []
      const cols = Math.ceil(width / spacing) + 1
      const rows = Math.ceil(height / spacing) + 1

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          /*
            At the default jitter of 0 this is the exact lattice, which is what
            gives the resting field its square grid of dots. A non-zero jitter
            scatters the anchors within a fraction of the pitch, trading that
            regularity for an organic scatter — even in density, but no longer
            square.
          */
          const x = i * spacing + (Math.random() - 0.5) * spacing * jitter
          const y = j * spacing + (Math.random() - 0.5) * spacing * jitter
          /*
            Strided in both axes rather than walking the array in order.
            Sequential assignment puts the same label on nodes a whole column
            apart, which lands two copies inside the handful the cursor lights
            up at once. 7 and 5 are coprime with any list length that is not a
            multiple of them, so no two nodes in a 3x3 neighbourhood collide.
          */
          const index = i * 7 + j * 5

          nodes.push({
            x,
            y,
            vx: 0,
            vy: 0,
            baseX: x,
            baseY: y,
            radius: Math.random() * 1.2 + 1.2,
            label: labels?.length
              ? labels[index % labels.length]
              : `${(i * 7).toString(16).toUpperCase()}:${(j * 11).toString(16).toUpperCase()}`,
            pulse: Math.random() * Math.PI * 2,
          })
        }
      }

      cellSize = connectionDistance
      gridCols = Math.max(1, Math.ceil(width / cellSize) + 1)
      gridRows = Math.max(1, Math.ceil(height / cellSize) + 1)
      buckets = Array.from({ length: gridCols * gridRows }, () => [])
    }

    const measure = () => {
      rect = host.getBoundingClientRect()

      const nextWidth = Math.max(1, Math.round(rect.width))
      const nextHeight = Math.max(1, Math.round(rect.height))
      if (nextWidth === width && nextHeight === height) return

      width = nextWidth
      height = nextHeight

      // Capped at 2: a 3x backing store on a phone triples the fill cost for a
      // difference nobody can see on 1px lines.
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      // setTransform, not scale: scale multiplies into whatever transform is
      // already on the context, so resizing twice would compound the DPR.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // A fixed radius that is a local disturbance on a desktop covers most of
      // a phone, which turns the highlight from an accent into a wash.
      mouse.radius = Math.min(influenceRadius, width / 3)

      initNodes()

      // Resizing clears the backing store. With the loop running the next frame
      // repaints it anyway; under reduced motion there is no next frame, so the
      // static image has to be redrawn here or the section goes blank on any
      // resize.
      if (reduceMotion.matches) drawFrame(0, false)
    }

    const drawFrame = (dt: number, interactive: boolean) => {
      const {
        background: bg,
        nodeColor: node,
        accentColor: accent,
        lineAlpha: maxLineAlpha,
        nodeAlpha: restAlpha,
        labelFont: font,
      } = settings.current

      const speed = interactive
        ? Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy)
        : 0

      ctx.fillStyle = bg
      ctx.fillRect(0, 0, width, height)

      // Hooke's law spring back to the anchor point, with velocity damping.
      const SPRING_K = 18
      const DAMPING = 0.82

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        n.pulse += dt * 3

        if (interactive) {
          const dx = mouse.x - n.x
          const dy = mouse.y - n.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          // Repulsion scaled by cursor speed, so a flick throws a shockwave and
          // a slow drift only parts the grid.
          if (dist < mouse.radius && dist > 0) {
            const power = 1 - dist / mouse.radius
            const force = power * (1500 + speed * 150)
            const angle = Math.atan2(dy, dx)

            n.vx -= Math.cos(angle) * force * dt
            n.vy -= Math.sin(angle) * force * dt
          }

          n.vx += (n.baseX - n.x) * SPRING_K * dt
          n.vy += (n.baseY - n.y) * SPRING_K * dt

          n.vx *= DAMPING
          n.vy *= DAMPING

          n.x += n.vx * dt * 60
          n.y += n.vy * dt * 60
        }
      }

      // Bucket every node by position, then compare only against the cells that
      // can hold a node within the connection radius.
      for (let i = 0; i < buckets.length; i++) buckets[i].length = 0

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        const cx = Math.min(gridCols - 1, Math.max(0, Math.floor(n.x / cellSize)))
        const cy = Math.min(gridRows - 1, Math.max(0, Math.floor(n.y / cellSize)))
        buckets[cy * gridCols + cx].push(i)
      }

      const maxDistSq = connectionDistance * connectionDistance

      /*
        Half the neighbourhood, plus the tail of the node's own cell. Visiting
        all eight neighbours would find every pair twice and draw every line
        twice, which is visible: overlapping strokes at these alphas double up
        and the mesh reads darker than the alpha ramp says it should.
      */
      const NEIGHBOURS = [
        [1, 0],
        [-1, 1],
        [0, 1],
        [1, 1],
      ] as const

      ctx.lineWidth = 0.7
      ctx.beginPath()

      let currentAlpha = -1

      const connect = (a: Node, b: Node) => {
        const ndx = a.x - b.x
        const ndy = a.y - b.y
        const distSq = ndx * ndx + ndy * ndy
        if (distSq >= maxDistSq) return

        const alpha =
          (1 - Math.sqrt(distSq) / connectionDistance) * maxLineAlpha

        /*
          Lines are batched into one path per alpha step. Every line has its own
          alpha, so stroking each one individually is one draw call per line —
          around 1.5k of them a frame. Quantising to 24 steps collapses that to
          at most 24 strokes, and the banding is well under what is perceptible
          on a ramp this shallow.
        */
        const quantised = Math.round(alpha * 24) / 24
        if (quantised !== currentAlpha) {
          if (currentAlpha >= 0) ctx.stroke()
          ctx.strokeStyle = `rgba(${node}, ${quantised})`
          ctx.beginPath()
          currentAlpha = quantised
        }

        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
      }

      for (let cy = 0; cy < gridRows; cy++) {
        for (let cx = 0; cx < gridCols; cx++) {
          const cell = buckets[cy * gridCols + cx]
          if (cell.length === 0) continue

          for (let a = 0; a < cell.length; a++) {
            const n = nodes[cell[a]]

            for (let b = a + 1; b < cell.length; b++) connect(n, nodes[cell[b]])

            for (let k = 0; k < NEIGHBOURS.length; k++) {
              const nx = cx + NEIGHBOURS[k][0]
              const ny = cy + NEIGHBOURS[k][1]
              if (nx < 0 || ny < 0 || nx >= gridCols || ny >= gridRows) continue

              const other = buckets[ny * gridCols + nx]
              for (let b = 0; b < other.length; b++) connect(n, nodes[other[b]])
            }
          }
        }
      }

      if (currentAlpha >= 0) ctx.stroke()

      ctx.font = font
      ctx.textBaseline = 'alphabetic'

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        const dx = mouse.x - n.x
        const dy = mouse.y - n.y
        const dist = interactive ? Math.sqrt(dx * dx + dy * dy) : Infinity
        const isNear = dist < mouse.radius

        const baseAlpha = isNear ? 0.95 : restAlpha + Math.sin(n.pulse) * 0.1

        ctx.fillStyle = isNear
          ? `rgba(${accent}, ${baseAlpha})`
          : `rgba(${node}, ${baseAlpha})`

        const currentRadius = isNear
          ? n.radius * 2.2
          : n.radius + Math.sin(n.pulse) * 0.3

        ctx.beginPath()
        ctx.arc(n.x, n.y, Math.max(0.5, currentRadius), 0, Math.PI * 2)
        ctx.fill()

        // Expanding ring plus a readout, on the handful of nodes directly under
        // the cursor.
        if (dist < 90) {
          const pulseRing = ((n.pulse * 20) % 30) + 4
          const ringAlpha = (1 - pulseRing / 34) * 0.4

          ctx.strokeStyle = `rgba(${accent}, ${ringAlpha})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(n.x, n.y, pulseRing, 0, Math.PI * 2)
          ctx.stroke()

          ctx.fillStyle = `rgba(${accent}, 0.85)`
          ctx.fillText(n.label, n.x + 10, n.y - 10)
        }
      }
    }

    measure()

    // ResizeObserver rather than a window resize listener: the container is
    // min-h-dvh and grows with its own content, and mobile browsers resize the
    // visual viewport on scroll without firing anything useful.
    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(host)

    if (reduceMotion.matches) {
      drawFrame(0, false)

      return () => {
        resizeObserver.disconnect()
      }
    }

    const handlePointerMove = (e: PointerEvent) => {
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }

    const handlePointerLeave = () => {
      mouse.x = -1000
      mouse.y = -1000
    }

    const handleScroll = () => {
      rect = host.getBoundingClientRect()
    }

    /*
      Listening on the window, not the canvas: the headline and buttons sit on
      top of this layer, and hanging the listener on the canvas would make the
      grid go dead everywhere the copy overlaps it.
    */
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })
    document.addEventListener('pointerleave', handlePointerLeave)

    let lastTime = performance.now()

    const render = (now: number) => {
      // Clamped so a backgrounded tab does not resume with a dt large enough to
      // fling every node past its spring and never settle.
      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now

      mouse.vx = (mouse.x - mouse.prevX) / (dt * 1000 || 1)
      mouse.vy = (mouse.y - mouse.prevY) / (dt * 1000 || 1)
      mouse.prevX = mouse.x
      mouse.prevY = mouse.y

      drawFrame(dt, true)

      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrameId)
      resizeObserver.disconnect()
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [spacing, connectionDistance, jitter, influenceRadius, labels])

  return (
    <div ref={hostRef} className={`relative overflow-hidden select-none ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 block" />
      {children}
    </div>
  )
}
