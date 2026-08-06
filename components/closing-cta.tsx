import { WaitlistForm } from '@/components/waitlist-form'

export function ClosingCta() {
  return (
    <section id="waitlist" className="scroll-mt-16 bg-brand-600 px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto flex max-w-[1100px] flex-col items-center text-center">
        <h2 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight text-white text-balance sm:text-4xl">
          Be there when it ships.
        </h2>

        <p className="mt-5 max-w-lg text-lg leading-relaxed text-brand-100">
          Naymly is coming to iOS. Join the waitlist and you will hear from us
          before anyone else.
        </p>

        <div className="mt-10 flex justify-center">
          <WaitlistForm source="footer" variant="dark" />
        </div>
      </div>
    </section>
  )
}
