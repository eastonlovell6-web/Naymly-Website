const NAMES = [
  'Marcus', 'Priya', 'Sofia', 'Daniel', 'Amara', 'Jonas',
  'Leila', 'Tomás', 'Grace', 'Hiroshi', 'Nadia', 'Owen',
]

/**
 * SWAP POINT. This component owns the hero's visual region and nothing else
 * depends on its internals. When product screenshots exist, replace the body
 * of this component with the mockup. The layout around it does not change.
 *
 * Today it renders names fading out, evoking the forgetting the product
 * solves. Purely decorative, so it is hidden from assistive tech.
 */
export function HeroVisual() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-brand-100/70 via-neutral-50 to-neutral-50" />

      {NAMES.map((name, i) => (
        <span
          key={name}
          className="absolute font-semibold text-brand-400/45 motion-safe:animate-[nameFade_9s_ease-in-out_infinite]"
          style={{
            left: `${(i * 37 + 9) % 88}%`,
            top: `${(i * 53 + 12) % 82}%`,
            fontSize: `${0.85 + ((i * 7) % 5) * 0.22}rem`,
            animationDelay: `${(i * 0.75) % 9}s`,
          }}
        >
          {name}
        </span>
      ))}

      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-neutral-50 to-transparent" />
    </div>
  )
}
