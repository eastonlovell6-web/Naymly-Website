import { GradientBackground } from '@/components/ui/soft-pastel-blend'
import { Reveal } from '@/components/reveal'

/**
 * The three steps.
 *
 * Plain data now, where this used to carry an `icon` component and a `gradient`
 * pair of Tailwind stops per step. The rows this section renders have neither —
 * a row in this layout is a title, one line, and its ordinal, and the ordinal is
 * the only thing distinguishing one from the next (see docs/DESIGN.md). Dropping
 * the icon field also puts this file back on the server: an icon was a function,
 * functions do not survive serialization into a client component, and that alone
 * was what forced the whole section to be `'use client'`.
 */
const STEPS = [
  {
    number: '001',
    title: 'Capture after the handshake',
    description:
      'Step away, speak one sentence. 20 seconds, and never while they are standing in front of you.',
  },
  {
    number: '002',
    title: 'It holds the context',
    description:
      'Their role, where you met, and the one detail worth remembering. Nothing you have to organize later.',
  },
  {
    number: '003',
    /*
      The arrival, which is the app's whole point — so it is triggered by the
      place, not by the calendar. This step used to fire 15 minutes before a
      scheduled meeting, which quietly narrowed the product to people who live
      in their calendar and made the trigger something you had to set up. A
      brief that shows up because you walked in the door needs no setup at all,
      and it covers the gym and the school run as readily as the office.
    */
    title: 'Arrive, and it is already there',
    description:
      'Walk into work, the gym, or school and that place’s brief arrives on its own. Everyone you have met there, and one thing you talked about.',
  },
]

/**
 * The mark in the stat card's top-right corner — eight spokes drawn as four
 * lines through one point, which is the reference's glyph exactly.
 *
 * Hairline stroke and no fill on purpose: at this size anything heavier reads
 * as an icon with a meaning, and this has none. It is the one piece of drawing
 * in the card, there to stop the top-right corner being empty.
 */
function Asterisk() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      className="h-6 w-6 shrink-0 text-neutral-900 sm:h-7 sm:w-7"
    >
      <path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9L4.9 19.1" />
    </svg>
  )
}

export function HowItWorks() {
  return (
    /*
      Pure white, which is a step brighter than the page's warm off-white
      (neutral-50 #F6F5F2) rather than the same colour — so it still reads as a
      band, just a cool one instead of a tinted one. That is the reference's own
      features section, and it is what the alternation now runs on: warm fold →
      white → pastel wash, no two adjacent sections sharing a background.

      The one white surface on the page, so it is deliberately not tokenised:
      neutral-50 is the page, and anything that wanted to match this band would
      be this band.
    */
    <section id="how-it-works" className="scroll-mt-16 bg-white py-24 sm:py-[7.5rem]">
      <div className="mx-auto w-full max-w-[1100px] px-5 sm:px-8">
        {/*
          The heading is centred over the whole width rather than sitting in the
          left column, which is the reference's features pattern (docs/DESIGN.md,
          section 4): one centred statement, then a two-column split beneath it
          where both columns start at the same line. Holding it to 3xl keeps it
          to two lines at the width the container allows.
        */}
        <div className="mx-auto max-w-3xl text-center">
          <Reveal as="p" className="eyebrow">
            How it works
          </Reveal>

          <Reveal
            as="h2"
            delay={120}
            className="mt-5 text-section font-medium text-neutral-900 text-balance"
          >
            Two moments, and nothing in between.
          </Reveal>
        </div>

        {/*
          45/55, the reference's split — the visual takes slightly less than half
          so the rows beside it get the width their second line needs.

          Both columns stretch to the same height (the grid's default), which is
          what the panel below relies on instead of an aspect ratio once there is
          a second column to match.
        */}
        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,45fr)_minmax(0,55fr)]">
          {/*
            Square corners, deliberately. Every other framed thing on this page
            is heavily rounded; the reference's feature visual is a hard
            rectangle, and that edge is most of what makes the column read as a
            field of colour rather than as one more card.

            aspect-[4/3] is the mobile-only shape. From lg the panel is stretched
            by the grid to whatever the rows next to it come to, so the ratio is
            dropped and a floor put under it instead.
          */}
          <Reveal
            delay={240}
            className="relative aspect-[4/3] w-full overflow-hidden lg:aspect-auto
              lg:h-full lg:min-h-[24rem]"
          >
            {/* The component hardcodes `position: relative` inline, which beats a
                Tailwind `absolute` class — so the positioning lives on a wrapper. */}
            <div aria-hidden="true" className="absolute inset-0">
              <GradientBackground />
            </div>

            {/*
              The card floats in the middle of the panel — centred on both axes,
              at roughly two thirds of the panel's width, which is where the
              reference puts it.
            */}
            <div className="absolute inset-0 flex items-center justify-center p-5">
              <div
                /* White, matching the band it now sits in — the warm neutral-50
                   it carried before read as a slightly dirty card against the
                   pastel once the section stopped being tinted. */
                className="w-[72%] min-w-[15rem] max-w-[24rem] rounded-md bg-white/95 p-4
                  shadow-[0_1px_2px_rgb(15_13_10/0.05),0_16px_40px_-16px_rgb(15_13_10/0.25)]
                  backdrop-blur-sm sm:p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="font-mono text-label text-neutral-900">Time to capture</p>
                  <Asterisk />
                </div>

                {/*
                  The gap under the label is the card's whole proportion: the
                  reference leaves most of the height empty and hangs the number
                  off the bottom edge, and closing that space turns a product
                  readout into a stat badge.
                */}
                <div className="mt-10 flex items-end justify-between gap-4 sm:mt-12">
                  <p className="flex items-baseline gap-1.5">
                    <span className="text-[2rem] font-medium leading-none tracking-[-0.03em] text-neutral-900 sm:text-[2.25rem]">
                      20
                    </span>
                    <span className="font-mono text-label text-neutral-500">sec</span>
                  </p>

                  <span className="font-mono text-label text-brand-500">per person</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/*
            A list, not a stack of divs — three sequential steps with ordinals is
            exactly what an ordered list is, and the numbers are rendered rather
            than generated so they read as the design element they are.
          */}
          <div>
            <ol className="border-t border-neutral-900/10">
              {STEPS.map((step, index) => (
                <Reveal
                  as="li"
                  key={step.number}
                  /*
                    Staggered behind the heading pair above, 90ms apart. Shorter
                    than the 120ms used for a heading-and-body pair: these are one
                    run of three, and at 120 the last row arrives late enough to
                    read as a separate event.
                  */
                  delay={240 + index * 90}
                  className="grid grid-cols-[1fr_auto] items-baseline gap-x-8 border-b
                    border-neutral-900/10 py-6 sm:py-7"
                >
                  <div>
                    <h3 className="text-xl font-medium tracking-[-0.02em] text-neutral-900">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-prose leading-relaxed text-neutral-600 text-pretty">
                      {step.description}
                    </p>
                  </div>

                  {/*
                    aria-hidden: the ordinal is decoration restating the list order,
                    and a screen reader already announces "1 of 3" from the <ol>.
                    Read out, it becomes "zero zero one" ahead of every step.
                  */}
                  <span aria-hidden="true" className="font-mono text-label text-neutral-400">
                    {step.number}
                  </span>
                </Reveal>
              ))}
            </ol>

            {/*
              The reference closes this column with a small dark button under the
              last rule, and that button is what stops the rows from running out
              into whitespace. It is the page's existing pill rather than the
              reference's square block: every other action on this site is a
              pill, and one square button in the middle of the page would read as
              a component from somewhere else.
            */}
            <Reveal delay={510} className="mt-10">
              <a
                href="#waitlist"
                className="pill focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-neutral-900 focus-visible:ring-offset-2
                  focus-visible:ring-offset-white"
              >
                Join the waitlist
              </a>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
