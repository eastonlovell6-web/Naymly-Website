'use client'

import { useEffect, useState } from 'react'
import { Wordmark } from '@/components/wordmark'

/**
 * Transparent while the visitor is at the top of the hero, gaining a surface
 * once they scroll past it. A client component because it needs the scroll
 * position.
 */
export function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)

    // Run once on mount so a reload partway down the page starts in the
    // correct state rather than flashing transparent.
    onScroll()

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-200 ${
        scrolled
          ? 'border-b border-neutral-200/70 bg-neutral-50/85 backdrop-blur'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-5 sm:px-8"
      >
        <a
          href="#top"
          aria-label="Naymly, back to top"
          className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          <Wordmark />
        </a>

        <a
          href="#waitlist"
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition
            hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          Join the waitlist
        </a>
      </nav>
    </header>
  )
}
