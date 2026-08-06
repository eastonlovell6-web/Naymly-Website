'use client'

import { useEffect, useState } from 'react'
import { Wordmark } from '@/components/wordmark'

const LINKS = [
  { href: '#why', label: 'Why' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#privacy', label: 'Privacy' },
]

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
      {/*
        Three bands, matching the reference: wordmark left, section links dead
        centre, action right. The grid rather than justify-between is what keeps
        the links optically centred on the page — with flex they centre in
        whatever space the wordmark and the button leave over, and those two are
        different widths, so the links drift left.
      */}
      <nav
        aria-label="Main"
        className="mx-auto grid h-16 max-w-[1100px] grid-cols-[auto_1fr_auto] items-center px-5 sm:px-8"
      >
        <a
          href="#top"
          aria-label="Naymly, back to top"
          className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50"
        >
          <Wordmark />
        </a>

        {/*
          Hidden below md rather than collapsed into a menu button: there are
          three of them, they all point at sections of this one page, and the
          hero's own CTA already covers the only action that matters on a phone.
        */}
        <ul className="hidden items-center justify-center gap-8 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded text-sm font-medium text-neutral-700 transition-colors
                  hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-brand-500 focus-visible:ring-offset-4 focus-visible:ring-offset-neutral-50"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/*
          col-start-3 so this stays in the right band even at the widths where
          the link list is display:none and would otherwise leave its column
          empty and let the button slide inward.
        */}
        <a
          href="#waitlist"
          className="col-start-3 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-neutral-50 transition
            hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50"
        >
          Get started
        </a>
      </nav>
    </header>
  )
}
