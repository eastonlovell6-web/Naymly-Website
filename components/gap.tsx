import { GradientBackground } from '@/components/ui/dreamy-pastel-wash'
import { Reveal } from '@/components/reveal'

export function Gap() {
  return (
    <section
      id="why"
      className="relative isolate scroll-mt-16 overflow-hidden px-5 py-24 sm:px-8 sm:py-28"
    >
      {/* The component hardcodes `position: relative` inline, which beats a
          Tailwind `absolute` class — so the positioning lives on a wrapper. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <GradientBackground />
      </div>

      <div className="mx-auto max-w-2xl text-center">
        <Reveal
          as="h2"
          className="text-3xl font-bold leading-tight tracking-tight text-neutral-900 text-balance sm:text-4xl"
        >
          Forgetting a name is not a character flaw.
        </Reveal>

        {/*
          Behind the heading by 120ms, which is the interval used for a
          heading-then-body pair everywhere on this page. Short enough to read
          as one gesture arriving in order, rather than as two separate events.
        */}
        <Reveal
          as="p"
          delay={120}
          className="mt-6 text-lg leading-relaxed text-neutral-700"
        >
          You met forty people this quarter. You can name six of them. That is
          not because you did not care. It is because the name never got encoded
          in the first place. It arrived in the middle of a handshake, competing
          with everything else you were tracking, and it was gone before the
          conversation ended.
        </Reveal>
      </div>
    </section>
  )
}
