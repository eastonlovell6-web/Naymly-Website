import { cn } from '@/lib/utils'

/**
 * The only place the Naymly wordmark is rendered. When a designed logo
 * exists, replace the contents of this component and nothing else changes.
 *
 * Passion One at 700, in the page's ink rather than brand blue. A wordmark is
 * the one element allowed to be set in a face nothing else on the site uses —
 * that difference is what makes it read as a mark rather than as the first word
 * of the nav.
 *
 * No tracking-tight any more: Passion One is a condensed display face that is
 * already spaced for display sizes, and pulling it in further closed the
 * counters on the two 'n's.
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
        'font-wordmark text-2xl font-bold leading-none text-neutral-900',
        className,
      )}
    >
      Naymly
    </span>
  )
}
