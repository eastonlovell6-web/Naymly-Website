import { WaitlistForm } from '@/components/waitlist-form'
import { Reveal } from '@/components/reveal'

export function ClosingCta() {
  return (
    <section id="waitlist" className="scroll-mt-16 bg-brand-600 px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto flex max-w-[1100px] flex-col items-center text-center">
        <Reveal
          as="h2"
          className="max-w-2xl text-3xl font-bold leading-tight tracking-tight text-white text-balance sm:text-4xl"
        >
          Be there when it ships.
        </Reveal>

        <Reveal
          as="p"
          delay={120}
          className="mt-5 max-w-lg text-lg leading-relaxed text-brand-100"
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
        <Reveal variant="fade" delay={240} className="mt-10 flex justify-center">
          <WaitlistForm source="footer" variant="dark" />
        </Reveal>
      </div>
    </section>
  )
}
