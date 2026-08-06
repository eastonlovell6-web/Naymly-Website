/**
 * The circular rotating-text badge from the bottom-left of the fold: a ring of
 * repeating words turning slowly around a static arrow.
 *
 * Inverted from the reference, which sets a dark disc on a dark background so
 * the badge reads as a quiet marker rather than a second call to action. This
 * hero is light, so holding that same relationship means a light disc, not a
 * dark one — a neutral-900 circle here would be the highest-contrast object on
 * the fold and would out-shout the actual CTA.
 */
export function ExploreMore({ href }: { href: string }) {
  return (
    <a
      href={href}
      aria-label="Explore more"
      className="group relative grid h-24 w-24 place-items-center rounded-full border border-neutral-200
        bg-neutral-50/70 backdrop-blur-sm transition-colors hover:border-neutral-300
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500
        focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50"
    >
      {/*
        The whole SVG spins, not the text inside it, so the glyphs keep their
        position on the path and the ring turns as one piece.

        motion-safe is redundant with the global prefers-reduced-motion rule in
        globals.css, which clamps every animation to one 0.01ms pass. It is here
        because that rule leaves the element frozen at whatever rotation the
        single pass lands on, and skipping the animation outright is the honest
        version of "off".
      */}
      <svg
        viewBox="0 0 100 100"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full motion-safe:animate-[spin_18s_linear_infinite]"
      >
        <defs>
          {/*
            Two arcs rather than one circle element: textPath needs a path, and a
            circle gives no control over where the run starts. Drawn clockwise
            from the 9 o'clock position so the text sits upright on the top half.
          */}
          <path
            id="explore-more-ring"
            d="M 50,50 m -35,0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
            fill="none"
          />
        </defs>

        <text className="fill-neutral-500 text-[10px] font-semibold tracking-[0.18em] uppercase">
          {/*
            Trailing separator included so the seam where the string meets its
            own start looks like every other gap in the ring. The copy is sized
            to run the full circumference; a shorter string would leave a bald
            patch that rotates into view.
          */}
          <textPath href="#explore-more-ring" startOffset="0">
            Explore more · Explore more ·
          </textPath>
        </text>
      </svg>

      {/* The static centre. Down, because the thing it explores is below. */}
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="relative h-4 w-4 fill-coral-500 transition-transform group-hover:translate-y-0.5"
      >
        <path d="M12 17 4 8h16z" />
      </svg>
    </a>
  )
}
