'use client'

import { useEffect, useRef, type ElementType, type ReactNode } from 'react'

/**
 * One observer for the whole page, created lazily on first mount and shared by
 * every Reveal on it.
 *
 * Per-element observers are the obvious implementation and the wrong one here:
 * each one is its own callback and its own set of intersection rectangles, and
 * this page has upwards of a dozen reveals on it. A single observer batches all
 * of them into one callback per frame, which is what the API is shaped for.
 */
let sharedObserver: IntersectionObserver | null = null

/**
 * Everything observed and not yet revealed. Exists for the safety net below.
 */
const pending = new Set<Element>()

function reveal(el: Element) {
  el.classList.add('is-revealed')

  /*
    Reveals are one-way: once something has been seen it stays seen. Re-hiding
    on scroll-up is the version of this effect that draws attention to itself,
    and it makes the page feel unstable when a visitor scrolls back to re-read
    something.

    Unobserving is not just tidiness — it is what keeps the observer's working
    set shrinking as the visitor moves down the page, so a long scroll costs
    less by the end than it did at the start.
  */
  sharedObserver?.unobserve(el)
  pending.delete(el)

  if (pending.size === 0) detachEndWatcher()
}

/* ---------------------------------------------------------------------------
   The document-end safety net.

   The observer's trigger line sits 12% of the viewport above its bottom edge,
   which means anything living in the last 12% of the document can never reach
   it — the page runs out of scroll first. The footer is exactly that: it is the
   final element, roughly 40px tall, and it sat at opacity 0 permanently.

   No amount of tuning the inset fixes this. Any negative bottom margin at all
   starves whatever ends up below the line at maximum scroll, and which elements
   those are depends on the viewport, so there is no safe constant.

   So the trigger line keeps the timing it is there for, and reaching the bottom
   of the page releases whatever it stranded. The listener is attached only
   while something is actually pending and removed the moment nothing is, so it
   costs nothing for most of a visit and nothing at all once the page has been
   read to the end.
   --------------------------------------------------------------------------- */
function onReachEnd() {
  const scrolled = window.innerHeight + window.scrollY
  /* A 2px tolerance: fractional device pixel ratios keep this sum a hair short
     of scrollHeight even when the page is scrolled as far as it goes. */
  if (scrolled < document.documentElement.scrollHeight - 2) return

  for (const el of [...pending]) reveal(el)
}

function attachEndWatcher() {
  window.addEventListener('scroll', onReachEnd, { passive: true })
  window.addEventListener('resize', onReachEnd, { passive: true })
}

function detachEndWatcher() {
  window.removeEventListener('scroll', onReachEnd)
  window.removeEventListener('resize', onReachEnd)
}

function getObserver(): IntersectionObserver {
  if (sharedObserver) return sharedObserver

  sharedObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) reveal(entry.target)
      }
    },
    {
      /*
        The trigger point sits 12% of the viewport up from the bottom edge, so
        an element starts moving once it is properly on screen rather than the
        instant its first pixel crosses the fold. Firing at the very edge means
        the animation plays in the visitor's peripheral vision and is over
        before they look at it, which reads as things being mysteriously
        already-there rather than as motion.
      */
      rootMargin: '0px 0px -12% 0px',
      /*
        Near-zero rather than something like 0.2: a threshold is a fraction of
        the element, so any real value would never fire for a block taller than
        the viewport. The rootMargin above is doing the "wait until it is
        properly visible" work, and it does it in viewport units, which is the
        unit that actually matters here.
      */
      threshold: 0.01,
    },
  )

  return sharedObserver
}

type RevealProps = {
  /** Defaults to a div. Pass the real tag so this adds no wrapper element. */
  as?: ElementType
  /** Optional: a reveal on a purely decorative element has nothing inside it. */
  children?: ReactNode
  className?: string
  /**
   * Milliseconds. Stagger a group by handing each member an increasing value —
   * see the step rows in components/how-it-works.tsx.
   */
  delay?: number
  /**
   * `rise` (default) fades up. `fade` holds still and only fades, for things
   * whose position is load-bearing. `bar` wipes out from its left edge, for
   * rules and dividers.
   */
  variant?: 'rise' | 'fade' | 'bar'
} & Record<string, unknown>

/**
 * Reveals its children as they scroll into view.
 *
 * The hidden state lives in CSS on the `reveal` class, not in React state, and
 * that ordering is the whole design: markup arrives from the server already
 * carrying the class, so the element is hidden by the first paint. Doing it the
 * other way round — render visible, hide on mount — shows every section on the
 * page for one frame before they all disappear.
 *
 * Which means a visitor with JavaScript disabled would get a blank page, so
 * app/layout.tsx carries a <noscript> block that neutralizes the class.
 */
export function Reveal({
  as: Tag = 'div',
  children,
  className = '',
  delay = 0,
  variant = 'rise',
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    /*
      Anything already on screen at mount is revealed outright rather than
      handed to the observer. The observer would do it too — it reports
      intersection on first observe — but a frame later, so the top of the page
      would visibly play its entrance after hydration. Sections above the fold
      should simply be there.
    */
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('is-revealed')
      return
    }

    const observer = getObserver()
    observer.observe(el)

    if (pending.size === 0) attachEndWatcher()
    pending.add(el)

    return () => {
      observer.unobserve(el)
      pending.delete(el)
      if (pending.size === 0) detachEndWatcher()
    }
  }, [])

  return (
    <Tag
      ref={ref}
      data-reveal={variant}
      className={`reveal ${className}`}
      /*
        The delay rides in as a custom property rather than as transition-delay
        directly, because the transition itself is declared in globals.css and
        an inline transition-delay would have to restate the whole shorthand to
        sit alongside it.
      */
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as React.CSSProperties) : undefined}
      {...rest}
    >
      {children}
    </Tag>
  )
}
