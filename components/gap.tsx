import VerticalBarsNoise from '@/components/ui/vertical-bars'
import { Reveal } from '@/components/reveal'

/**
 * The three cards.
 *
 * Bodies are the copy as supplied, with two typographic corrections: a `your're`
 * and the hyphens standing in for em dashes. Titles are short declaratives in
 * the reference's shape — two to four words, sentence case, no verb required.
 */
const VALUES = [
  {
    title: 'Forty people, six names',
    body:
      'You met forty people this quarter. Be honest—you can probably name six, which is why you’re still calling that coworker “bro” and praying nobody at the networking event expects you to remember their name.',
    /*
      A circle with a narrow wedge cut from the top — the fraction of a room you
      actually come away with. Drawn rather than filled, like every glyph here.
    */
    icon: (
      <>
        <circle cx="12" cy="12" r="9.25" />
        <path d="M12 12V2.75M12 12l6.54-6.54" />
      </>
    ),
  },
  {
    title: 'The smile and the nod',
    body:
      'That awkward moment when someone greets you by name and you’re just smiling, hoping it doesn’t come up? Totally normal—it’s not a character flaw, it’s just how brains work under pressure.',
    /* Two circles overlapping: the exchange, and the part of it you both share. */
    icon: (
      <>
        <circle cx="9" cy="12" r="6.75" />
        <circle cx="15" cy="12" r="6.75" />
      </>
    ),
  },
  {
    title: 'It never got encoded',
    body:
      'Their name showed up mid-handshake while you were also managing eye contact and what to say next, so it never really landed. First day of class, first week on the job, a room full of strangers—same moment, different backdrop.',
    /*
      A ring that does not close — the loop the name never completed.

      This replaced a circle with an arrow struck through it, which at 40px read
      as a prohibition sign rather than as something passing through. A gap is
      unambiguous at any size: there is no glyph it can be mistaken for.
    */
    icon: <path d="M21.11 13.61A9.25 9.25 0 1 1 15.16 3.31" />,
  },
]

export function Gap() {
  return (
    /*
      The page's one warm band, replacing the pastel wash this section used to
      carry. Two things moved it: the pastel now lives in the How It Works panel
      above, where a second full-bleed version of it directly underneath read as
      the same section twice — and the reference puts its values row on a
      textured beige, which is what `gold-100` is mapped to in docs/DESIGN.md.

      `isolate` because the grain below blends against this band; without a
      stacking context of its own it would reach past the section edges.
    */
    <section
      id="why"
      className="relative isolate scroll-mt-16 overflow-hidden bg-gold-100 px-5 py-24
        sm:px-8 sm:py-[7.5rem]"
    >
      {/*
        The texture, replacing the static fractal-noise overlay this band used
        to carry. Same job — put a tooth on the paper so the white cards have
        something to sit on — done live, so the field drifts and answers the
        pointer instead of holding still.

        Colours are the warm ramp, not the component's near-black defaults: the
        bars sit over the whole band and the cards sit over the bars, so a #000
        field would put dark pixels directly under body copy. neutral-400 on
        gold-100 is texture you read as paper rather than as content.

        aria-hidden and -z-10: it is decoration, and it belongs behind
        everything in the section. It is deliberately *not* pointer-events-none
        — the empty band around the cards is where the pointer interaction
        lives, and the cards, sitting above it, still take their own events.
      */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <VerticalBarsNoise
          backgroundColor="#F7EED4"
          lineColor="#E7D397"
          barColor="#C0BDB7"
          animationSpeed={0.0004}
        />
      </div>

      <div className="mx-auto w-full max-w-[1100px]">
        {/*
          Two lines, broken by hand rather than by the browser. The reference
          sets its values heading in display type and splits it across two
          lines, and the split is the composition — a balanced wrap would put
          the break wherever the measure happened to fall.

          Not `text-display`: that token maxes at 80px, and at 1024px wide the
          second line runs past the container and wraps to three. This tops out
          at 64px, which is what the reference actually measures.
        */}
        <Reveal
          as="h2"
          className="mx-auto max-w-4xl text-center text-[clamp(2.25rem,5.4vw,4rem)]
            font-medium leading-[1.05] tracking-[-0.04em] text-neutral-900"
        >
          <span className="block">Forgetting a name</span>
          <span className="block">is not a character flaw.</span>
        </Reveal>

        {/*
          Three across from md, stacked below — the reference collapses this row
          at 800px. 24px gutters, and the cards stretch to a shared height by
          default, which is what keeps the row reading as one object when one
          card runs a line longer than its neighbours.
        */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {VALUES.map((value, index) => (
            <Reveal
              as="article"
              key={value.title}
              /* 90ms apart, the same run-of-three interval as the step rows. */
              delay={120 + index * 90}
              className="rounded-2xl bg-white p-7 sm:p-10"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-10 w-10 text-neutral-900"
              >
                {value.icon}
              </svg>

              <h3 className="mt-6 text-xl font-medium tracking-[-0.02em] text-neutral-900">
                {value.title}
              </h3>

              <p className="mt-2 leading-relaxed text-neutral-600 text-pretty">{value.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
