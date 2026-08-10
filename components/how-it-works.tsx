import { Reveal } from '@/components/reveal'

const STEPS = [
  {
    n: '01',
    title: 'Capture after the handshake',
    body:
      'Step away, speak one sentence. 20 seconds, and never while they are standing in front of you.',
    accent: false,
  },
  {
    n: '02',
    title: 'It holds the context',
    body:
      'Their role, where you met, and the one detail worth remembering. Nothing you have to organize later.',
    accent: false,
  },
  {
    n: '03',
    title: 'The brief arrives before you do',
    body:
      '15 minutes before your next meeting: their face, their role, and one thing you talked about.',
    accent: true,
  },
]

/**
 * The reveal delay for each card, and the reason it is a table of literal class
 * names rather than arithmetic on the index.
 *
 * The stagger is wanted only in the three-column case. Below md the cards are
 * stacked, so they cross the trigger point one at a time as the visitor scrolls
 * — the scroll is already the stagger, and adding delay on top of it just makes
 * each card late to its own arrival. That is a media query, which rules out the
 * component's `delay` prop: that prop writes an inline style, and an inline
 * style cannot be scoped to a breakpoint.
 *
 * Which leaves a class, and the classes have to be written out in full. Tailwind
 * finds utilities by scanning source text, so `md:[--reveal-delay:${n}ms]` built
 * at runtime would never be generated.
 *
 * The values: 220ms is roughly one heading reveal, so the row starts as the
 * heading above it finishes rather than racing it, and each card follows 110ms
 * behind the last. That interval is deliberately far short of the 700ms the
 * reveal itself takes — the three overlap heavily and the row reads as one
 * cascade resolving left to right. Stagger by the full duration instead and it
 * stops being a cascade and becomes three animations queued up, which is the
 * version that feels slow.
 */
const STAGGER = [
  'md:[--reveal-delay:220ms]',
  'md:[--reveal-delay:330ms]',
  'md:[--reveal-delay:440ms]',
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-16 px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[1100px]">
        <Reveal
          as="h2"
          className="max-w-2xl text-3xl font-bold leading-tight tracking-tight text-neutral-900 text-balance sm:text-4xl"
        >
          Two moments, and nothing in between.
        </Reveal>

        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal
              as="li"
              key={step.n}
              className={`rounded-2xl border p-8 ${STAGGER[i]} ${
                step.accent
                  ? 'border-coral-300 bg-coral-100'
                  : 'border-neutral-200 bg-white'
              }`}
            >
              <span
                aria-hidden="true"
                className={`text-sm font-bold tracking-widest ${
                  step.accent ? 'text-coral-700' : 'text-brand-500'
                }`}
              >
                {step.n}
              </span>

              <h3 className="mt-4 text-xl font-bold leading-snug text-neutral-900 text-balance">
                {step.title}
              </h3>

              <p className="mt-3 leading-relaxed text-neutral-600">{step.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
