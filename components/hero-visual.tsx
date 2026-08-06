const NAMES = [
  { name: 'Marcus',  left: 72, top: 8,  size: 1.15, delay: 0 },
  { name: 'Priya',   left: 87, top: 19, size: 0.9,  delay: 1.1 },
  { name: 'Sofia',   left: 73, top: 30, size: 1.4,  delay: 2.2 },
  { name: 'Daniel',  left: 88, top: 41, size: 0.95, delay: 3.3 },
  { name: 'Amara',   left: 72, top: 52, size: 1.2,  delay: 4.4 },
  { name: 'Jonas',   left: 86, top: 63, size: 0.85, delay: 5.5 },
  { name: 'Leila',   left: 74, top: 74, size: 1.05, delay: 6.6 },
  { name: 'Hiroshi', left: 85, top: 85, size: 1.1,  delay: 7.7 },
]

/**
 * SWAP POINT. This component owns the hero's visual region and nothing else
 * depends on its internals. When product screenshots exist, replace the body
 * of this component with the mockup. The layout around it does not change.
 *
 * Names are confined to the right-hand band on purpose. The hero's text column
 * is capped at max-w-3xl inside a max-w-[1100px] container, so it occupies
 * roughly the left two thirds at desktop widths. An earlier version scattered
 * names across the full width and they landed on top of the headline, which is
 * the one thing this decoration must never do. They are hidden below xl, where
 * the narrower viewport lets the headline's max-w-3xl cap span nearly the full
 * content width and no safe band exists.
 *
 * Purely decorative, so the whole layer is hidden from assistive tech.
 */
export function HeroVisual() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-brand-100/70 via-neutral-50 to-neutral-50" />

      {NAMES.map((n) => (
        <span
          key={n.name}
          className="absolute hidden font-semibold text-brand-400/45 xl:block motion-safe:animate-[nameFade_9s_ease-in-out_infinite]"
          style={{
            left: `${n.left}%`,
            top: `${n.top}%`,
            fontSize: `${n.size}rem`,
            animationDelay: `${n.delay}s`,
          }}
        >
          {n.name}
        </span>
      ))}

      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-neutral-50 to-transparent" />
    </div>
  )
}
