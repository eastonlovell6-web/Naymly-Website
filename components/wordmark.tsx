import { cn } from '@/lib/utils'

/**
 * The only place the Naymly wordmark is rendered. When a designed logo
 * exists, replace the contents of this component and nothing else changes.
 *
 * Geist Sans at 700, in the page's ink rather than brand blue. A wordmark is
 * the one element allowed to be set in a face nothing else on the site uses —
 * that difference is what makes it read as a mark rather than as the first word
 * of the nav. Geist over the page's own Jakarta on purpose: a neutral grotesk
 * keeps the mark minimal instead of decorative, which a display face like the
 * previous Passion One was not.
 *
 * tracking-tight, unlike the old Passion One mark: Geist is a normal-set
 * grotesk rather than a display face pre-spaced for large sizes, and left at
 * its default tracking "Naymly" reads slightly loose next to the nav links
 * beside it.
 *
 * cn rather than a template literal, because the footer passes `text-base` to
 * render a smaller mark and a plain join left that fighting the size baked in
 * here — with both in the same layer, the larger utility wins on source order
 * whatever the class attribute says. twMerge drops the loser instead.
 */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span
      className={cn(
        'font-wordmark text-2xl font-bold tracking-tight leading-none text-neutral-900',
        className,
      )}
    >
      Naymly
    </span>
  )
}
