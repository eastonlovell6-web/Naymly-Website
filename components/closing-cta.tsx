import { HeroWaitlist } from '@/components/hero-waitlist'
import { Reveal } from '@/components/reveal'

export function ClosingCta() {
  return (
    /*
      The shortest band on the page — 80px against the 120px the sections above
      it carry. The reference does the same thing: its closing CTA is a single
      line and a single button in noticeably less air than anything before it,
      which is what makes it read as the end rather than as one more section
      that happens to be last. With the band white rather than brand-600, the
      compression is what marks the ending; the colour no longer does.
    */
    <section id="waitlist" className="scroll-mt-16 bg-white px-5 py-20 sm:px-8">
      <div className="mx-auto flex max-w-[1100px] flex-col items-center text-center">
        <Reveal
          as="h2"
          className="max-w-2xl text-section font-medium text-neutral-900 text-balance"
        >
          Be there when it ships.
        </Reveal>

        <Reveal
          as="p"
          delay={120}
          className="mt-5 max-w-lg text-lede text-neutral-600"
        >
          Naymly is coming to iOS. Join the waitlist and you will hear from us
          before anyone else.
        </Reveal>

        {/*
          The form fades without travelling, unlike the two above it. This is the
          page's one real input, and it is the last thing to arrive — an element
          a visitor is about to click should be settled in place by the time it
          becomes visible, not still moving toward its final position. The delay
          keeps its order in the stack; the held position is what keeps it
          usable at the moment it appears.
        */}
        {/*
          The same glass field and button as the fold, not the bordered input
          and solid pill this used to be. A visitor who scrolls the whole page
          meets this control twice, and two different-looking submits for one
          action read as two different things being offered.
        */}
        <Reveal
          variant="fade"
          delay={240}
          className="mt-10 flex w-full justify-center"
        >
          <HeroWaitlist source="footer" />
        </Reveal>
      </div>
    </section>
  )
}
