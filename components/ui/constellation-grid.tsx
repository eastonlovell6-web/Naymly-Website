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
  /** `sin(pulse)`, cached by the classify pass so the draw pass can reuse it. */
  wave: number
}

/*
  Simulation constants, in seconds and CSS pixels.

  These were originally written in per-frame units — a velocity in px/frame, a
  damping factor applied once per frame — and multiplied by `dt` in places that
  did not cancel out. That made the motion a function of the refresh rate: on a
  120Hz display the damping ran twice as often and the mesh barely moved, and a
  single long frame integrated a step large enough to throw a node ~99px when
  the steady-state answer was 13px. That overshoot on every frame-time hiccup is
  what read as the animation not being clean.

  The values below are the exact 60fps equivalents of the old ones, so the tuned
  look is unchanged: a velocity in px/frame is 60x the same velocity in px/s, so
  the old `18` spring becomes 1080, the old `1500` repulsion becomes 90000, and
  the old per-frame 0.82 damping becomes 0.82^60 per second.
*/
const PHYSICS_STEP = 1 / 120
const SPRING_K = 1080
const REPULSE_ACCEL = 90000
const REPULSE_SPEED_GAIN = 9000
const DAMPING_PER_STEP = 0.82 ** (60 * PHYSICS_STEP)

/*
  Ceiling on how much simulated time one frame may advance. A tab that was
  backgrounded, or a long GC pause, otherwise returns with a dt worth hundreds
  of substeps and spends the whole frame catching up on motion nobody saw.
*/
const MAX_CATCHUP = 0.1

/*
  Exponential smoothing time constants. The pointer's raw position arrives at
  most once per frame and its per-frame delta collapses to zero whenever no
  event landed, which made the speed term — and so the size of the shockwave —
  flicker frame to frame. Both are eased instead.

  These are deliberately lopsided. Smoothed position lags the real cursor by
  roughly `speed * POINTER_TAU`, and lag is the exact thing being fixed here, so
  it is kept to 12ms — about 10px behind a cursor moving at a normal 800px/s,
  under a sixteenth of the influence radius. It only has to bridge the gap
  between one pointer sample and the next. The speed term carries no positional
  lag, so it can be smoothed over a much longer window.
*/
const POINTER_TAU = 0.012
const SPEED_TAU = 0.06

/*
  Resting nodes are drawn in this many alpha bands. Every node's alpha follows
  its own pulse, so drawing them literally meant one `fill()` and one fillStyle
  string per node — 504 of each per frame on a 1440x900 hero, against 38 strokes
  for all 277 lines, which are already batched. Banding lets the dots batch the
  same way: one fill and one cached colour string per band, whatever the node
  count.

  24 bands across a 0.2-wide swing is the same alpha resolution the line
  batching below already settled on, and for the same reason — the step lands
  well under what is perceptible on a ramp this shallow.
*/
const NODE_ALPHA_STEPS = 24
const NODE_ALPHA_SWING = 0.1

const TWO_PI = Math.PI * 2

/*
  Half the neighbourhood, plus the tail of the node's own cell. Visiting all
  eight neighbours would find every pair twice and draw every line twice, which
  is visible: overlapping strokes at these alphas double up and the mesh reads
  darker than the alpha ramp says it should.

  Module scope rather than a literal inside the frame loop, where it allocated
  five arrays every frame.
*/
const NEIGHBOURS = [
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
] as const

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

      `targetX/targetY` is where the pointer actually is; `x/y` is the eased
      position the simulation repels from. `active` distinguishes "the pointer
      is off the element" from "the pointer has not moved yet", so entering and
      leaving snap instead of easing the disturbance across the whole hero.
    */
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      speed: 0,
      active: false,
      radius: 220,
    }

    // Cached so pointermove does not force a layout read on every event.
    let rect = host.getBoundingClientRect()

    // Set by scroll, consumed on the next read of `rect`. Scroll fires in bursts
    // and each getBoundingClientRect is a synchronous layout read, so the read
    // is deferred to whoever needs the rect next instead of run per event.
    let rectDirty = false

    const refreshRect = () => {
      if (!rectDirty) return
      rect = host.getBoundingClientRect()
      rectDirty = false
    }

    // Spatial hash, rebuilt per frame. Allocated once per resize and cleared by
    // truncation so the frame loop does no allocation.
    let cellSize = connectionDistance
    let gridCols = 0
    let gridRows = 0
    let buckets: number[][] = []

    // Draw batches, also reused across frames: resting nodes bucketed by alpha
    // band, plus the handful currently lit by the cursor.
    const alphaBuckets: number[][] = Array.from(
      { length: NODE_ALPHA_STEPS },
      () => []
    )
    const nearNodes: number[] = []

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
            wave: 0,
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
      rectDirty = false

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
      if (reduceMotion.matches) draw(false)
    }

    /**
     * One fixed slice of simulated time. Always `PHYSICS_STEP` seconds long,
     * however long the frame that is driving it took — that invariance is the
     * whole point, and is what keeps a dropped frame from launching the mesh.
     */
    const step = (h: number) => {
      // Ease the disturbance toward the real pointer, and derive the speed term
      // from that eased motion so it varies smoothly instead of per-event.
      const follow = 1 - Math.exp(-h / POINTER_TAU)
      const prevX = mouse.x
      const prevY = mouse.y

      mouse.x += (mouse.targetX - mouse.x) * follow
      mouse.y += (mouse.targetY - mouse.y) * follow

      // px per millisecond, matching the units the repulsion gain was tuned in.
      const travelled = Math.hypot(mouse.x - prevX, mouse.y - prevY)
      const rawSpeed = travelled / (h * 1000)
      mouse.speed += (rawSpeed - mouse.speed) * (1 - Math.exp(-h / SPEED_TAU))

      const radius = mouse.radius
      const radiusSq = radius * radius

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        n.pulse += h * 3

        // Hooke's law spring back to the anchor point, with velocity damping.
        let ax = (n.baseX - n.x) * SPRING_K
        let ay = (n.baseY - n.y) * SPRING_K

        const dx = mouse.x - n.x
        const dy = mouse.y - n.y
        const distSq = dx * dx + dy * dy

        // Repulsion scaled by cursor speed, so a flick throws a shockwave and a
        // slow drift only parts the grid.
        if (distSq < radiusSq && distSq > 0) {
          const dist = Math.sqrt(distSq)
          const power = 1 - dist / radius
          const accel = power * (REPULSE_ACCEL + mouse.speed * REPULSE_SPEED_GAIN)

          // dx/dist and dy/dist are cos/sin of the angle to the cursor, without
          // the atan2 round trip the original took to recover them.
          ax -= (dx / dist) * accel
          ay -= (dy / dist) * accel
        }

        n.vx = (n.vx + ax * h) * DAMPING_PER_STEP
        n.vy = (n.vy + ay * h) * DAMPING_PER_STEP

        n.x += n.vx * h
        n.y += n.vy * h
      }
    }

    const draw = (interactive: boolean) => {
      const {
        background: bg,
        nodeColor: node,
        accentColor: accent,
        lineAlpha: maxLineAlpha,
        nodeAlpha: restAlpha,
        labelFont: font,
      } = settings.current

      ctx.fillStyle = bg
      ctx.fillRect(0, 0, width, height)

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

      /*
        Sort the nodes into draw batches before touching the context. Each node
        drawn on its own cost a `fill()` and, worse, a fillStyle assignment
        carrying a colour string no two nodes ever shared — a fresh allocation
        and a CSS colour parse apiece, ~500 of each per frame. Grouping by alpha
        band collapses that to one of each per non-empty band.
      */
      for (let i = 0; i < alphaBuckets.length; i++) alphaBuckets[i].length = 0
      nearNodes.length = 0

      const radiusSq = mouse.radius * mouse.radius

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]

        if (interactive) {
          const dx = mouse.x - n.x
          const dy = mouse.y - n.y
          if (dx * dx + dy * dy < radiusSq) {
            nearNodes.push(i)
            continue
          }
        }

        n.wave = Math.sin(n.pulse)
        const band = Math.round(((n.wave + 1) / 2) * (NODE_ALPHA_STEPS - 1))
        alphaBuckets[band].push(i)
      }

      for (let band = 0; band < NODE_ALPHA_STEPS; band++) {
        const bucket = alphaBuckets[band]
        if (bucket.length === 0) continue

        const offset = (band / (NODE_ALPHA_STEPS - 1)) * 2 - 1

        // Clamped because the swing can take a low `nodeAlpha` below zero, and
        // an out-of-range alpha makes the whole rgba() string invalid — which a
        // canvas context ignores silently, leaving the band painted in whatever
        // colour was set last.
        const alpha = Math.min(1, Math.max(0, restAlpha + offset * NODE_ALPHA_SWING))

        // toFixed, so the same band yields a byte-identical string every frame
        // and hits the browser's parsed-colour cache instead of missing it on a
        // float that never repeats.
        ctx.fillStyle = `rgba(${node}, ${alpha.toFixed(3)})`
        ctx.beginPath()

        for (let b = 0; b < bucket.length; b++) {
          const n = nodes[bucket[b]]
          const r = Math.max(0.5, n.radius + n.wave * 0.3)

          // arc() extends the current subpath, so without this moveTo every dot
          // would be joined to the previous one by a straight line.
          ctx.moveTo(n.x + r, n.y)
          ctx.arc(n.x, n.y, r, 0, TWO_PI)
        }

        ctx.fill()
      }

      if (nearNodes.length > 0) {
        ctx.fillStyle = `rgba(${accent}, 0.95)`
        ctx.beginPath()

        for (let i = 0; i < nearNodes.length; i++) {
          const n = nodes[nearNodes[i]]
          const r = Math.max(0.5, n.radius * 2.2)
          ctx.moveTo(n.x + r, n.y)
          ctx.arc(n.x, n.y, r, 0, TWO_PI)
        }

        ctx.fill()
      }

      /*
        Expanding ring plus a readout, on the handful of nodes directly under
        the cursor — in practice one or two, because the repulsion opens a void
        exactly there. Each ring has its own alpha, so these stay individual
        strokes; at this count there is nothing to batch.
      */
      if (nearNodes.length === 0) return

      ctx.font = font
      ctx.textBaseline = 'alphabetic'
      ctx.lineWidth = 1

      for (let i = 0; i < nearNodes.length; i++) {
        const n = nodes[nearNodes[i]]
        const dx = mouse.x - n.x
        const dy = mouse.y - n.y
        if (dx * dx + dy * dy >= 90 * 90) continue

        const pulseRing = ((n.pulse * 20) % 30) + 4
        const ringAlpha = (1 - pulseRing / 34) * 0.4

        ctx.strokeStyle = `rgba(${accent}, ${ringAlpha})`
        ctx.beginPath()
        ctx.arc(n.x, n.y, pulseRing, 0, TWO_PI)
        ctx.stroke()

        ctx.fillStyle = `rgba(${accent}, 0.85)`
        ctx.fillText(n.label, n.x + 10, n.y - 10)
      }
    }

    measure()

    // ResizeObserver rather than a window resize listener: the container is
    // min-h-dvh and grows with its own content, and mobile browsers resize the
    // visual viewport on scroll without firing anything useful.
    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(host)

    if (reduceMotion.matches) {
      draw(false)

      return () => {
        resizeObserver.disconnect()
      }
    }

    const handlePointerMove = (e: PointerEvent) => {
      refreshRect()

      mouse.targetX = e.clientX - rect.left
      mouse.targetY = e.clientY - rect.top

      // First move after the pointer was away: snap, rather than easing the
      // disturbance in from wherever it was parked and raking it across the
      // mesh on the way.
      if (!mouse.active) {
        mouse.active = true
        mouse.x = mouse.targetX
        mouse.y = mouse.targetY
        mouse.speed = 0
      }
    }

    const handlePointerLeave = () => {
      mouse.active = false
      mouse.targetX = -1000
      mouse.targetY = -1000
      mouse.x = -1000
      mouse.y = -1000
      mouse.speed = 0
    }

    const handleScroll = () => {
      rectDirty = true
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
    let accumulator = 0
    let running = false

    const render = (now: number) => {
      const frame = (now - lastTime) / 1000
      lastTime = now

      /*
        Fixed-timestep accumulator. The simulation only ever advances in whole
        PHYSICS_STEP slices, so its behaviour is identical at 60Hz, 120Hz, and
        through a dropped frame; the frame rate decides how often it is drawn,
        not how it moves. The cap discards time rather than working through it.
      */
      accumulator = Math.min(accumulator + frame, MAX_CATCHUP)

      while (accumulator >= PHYSICS_STEP) {
        accumulator -= PHYSICS_STEP
        step(PHYSICS_STEP)
      }

      draw(true)

      animationFrameId = requestAnimationFrame(render)
    }

    const start = () => {
      if (running) return
      running = true

      // Reset the clock: `now - lastTime` would otherwise cover the entire time
      // the hero spent off screen.
      lastTime = performance.now()
      accumulator = 0
      animationFrameId = requestAnimationFrame(render)
    }

    const stop = () => {
      if (!running) return
      running = false
      cancelAnimationFrame(animationFrameId)
    }

    /*
      The hero is the top of the page and the mesh is decorative, so once it is
      scrolled past there is a full frame budget going into a canvas nobody can
      see. rAF keeps running for a visible tab no matter what is on screen, so
      this has to be explicit.
    */
    const visibility = new IntersectionObserver(
      (entries) => {
        if (entries[entries.length - 1].isIntersecting) start()
        else stop()
      },
      { rootMargin: '100px' }
    )
    visibility.observe(host)

    return () => {
      stop()
      visibility.disconnect()
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
