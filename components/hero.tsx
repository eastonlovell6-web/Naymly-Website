import { WaitlistForm } from '@/components/waitlist-form'
import { HeroVisual } from '@/components/hero-visual'

export function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden scroll-mt-16">
      <HeroVisual />

      <div className="relative mx-auto max-w-[1100px] px-5 py-24 sm:px-8 sm:py-32">
        <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-neutral-900 sm:text-6xl">
          Never blank on a name again.
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-600 sm:text-xl">
          Naymly captures who you met in 20 seconds, then hands you their face,
          their role, and the one thing you talked about, 15 minutes before you
          see them next.
        </p>

        <div className="mt-10">
          <WaitlistForm source="hero" />
        </div>

        <p className="mt-4 text-sm text-neutral-500">
          Coming to iOS. Join the waitlist and you will hear from us first.
        </p>
      </div>
    </section>
  )
}
