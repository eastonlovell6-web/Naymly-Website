'use client'

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/* ---------------------------------------------------------------------------
   Shared motion constants that ship with this component in its source registry.
   Only SPRING_MOUSE is used below; the rest are kept so the file stays diffable
   against upstream if it is ever re-pulled.
   --------------------------------------------------------------------------- */

export const EASE_OUT = [0.16, 1, 0.3, 1] as const
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const
export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const

export const EASE_OUT_CSS = 'cubic-bezier(0.16, 1, 0.3, 1)'

export const SPRING_PRESS = {
  type: 'spring',
  stiffness: 500,
  damping: 30,
  mass: 0.6,
} as const

export const SPRING_SWAP = {
  type: 'spring',
  stiffness: 460,
  damping: 30,
  mass: 0.55,
} as const

export const SPRING_PANEL = {
  type: 'spring',
  stiffness: 420,
  damping: 40,
  mass: 0.5,
} as const

export const SPRING_LAYOUT = {
  type: 'spring',
  stiffness: 360,
  damping: 32,
  mass: 0.6,
} as const

export const SPRING_MOUSE = {
  stiffness: 200,
  damping: 15,
  mass: 0.3,
} as const

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Whether the visitor's primary input can actually hover.
 *
 * A tilt driven by mousemove has no meaning on a touchscreen — the first touch
 * would tip the card and it would stay tipped — so the effect is gated on a
 * real pointer rather than on viewport width.
 */
export function useHoverCapable() {
  const [canHover, setCanHover] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return

    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const update = () => setCanHover(mq.matches)

    update()
    mq.addEventListener?.('change', update)

    return () => mq.removeEventListener?.('change', update)
  }, [])

  return canHover
}

export interface TiltCardProps {
  children: ReactNode
  /** Peak rotation in degrees at the corners. Defaults to 12. */
  max?: number
  /** The light that follows the cursor across the surface. Defaults to on. */
  glare?: boolean
  className?: string
}

/**
 * A card that tilts toward the cursor in 3D, with an optional glare.
 *
 * Starts flat and returns to flat on leave, so it renders identically on the
 * server and for anyone the effect is disabled for — reduced-motion visitors
 * and touch devices both get a plain card with no layout difference.
 */
export function TiltCard({
  children,
  max = 12,
  glare = true,
  className,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const canHover = useHoverCapable()
  const enabled = !reduce && canHover

  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const gx = useMotionValue(50)
  const gy = useMotionValue(50)

  /*
    Springs on the rotation only. The glare's position is read straight from the
    pointer — lagging the highlight behind the tilt makes the surface read as
    two separate effects rather than one lit object.
  */
  const srx = useSpring(rx, SPRING_MOUSE)
  const sry = useSpring(ry, SPRING_MOUSE)

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current

    if (!el || !enabled) return

    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height

    ry.set((px - 0.5) * max)
    rx.set((0.5 - py) * max)
    gx.set(px * 100)
    gy.set(py * 100)
  }

  const onLeave = () => {
    rx.set(0)
    ry.set(0)
  }

  const transform = useMotionTemplate`perspective(1000px) rotateX(${srx}deg) rotateY(${sry}deg)`
  /*
    `--color-foreground`, not the `--foreground` the upstream file reaches for.
    This project is on Tailwind v4, where the palette is declared in `@theme`
    (app/tokens.css) and every token is emitted under a `--color-` prefix. The
    unprefixed name resolves to nothing here, which makes the whole
    radial-gradient invalid and drops the glare silently.
  */
  const glareBg = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, var(--color-foreground), transparent 50%)`

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ transform, transformStyle: 'preserve-3d' }}
      className={cn(
        'group relative overflow-hidden rounded-2xl will-change-transform',
        className,
      )}
    >
      {children}

      {glare && enabled ? (
        <motion.div
          aria-hidden
          style={{ background: glareBg }}
          /*
            Faded out until the cursor is actually on the card, which upstream
            does not do — it ships this at a flat opacity-15. The highlight's
            position starts at dead-centre and `onLeave` only resets the
            rotation, so an untouched card sits there with a grey blob printed
            in the middle of it. Fine in a one-card demo where the pointer is
            always on the card; not fine in a row of three a visitor scrolls
            past.

            CSS rather than React state: hover is the one thing the browser can
            already track, and driving it from an onEnter/onLeave handler would
            re-render the card on every crossing to say something a class
            already says.
          */
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-15"
        />
      ) : null}
    </motion.div>
  )
}
