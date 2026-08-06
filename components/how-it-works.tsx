const STEPS = [
  {
    n: '01',
    title: 'Capture after the handshake',
    body:
      'Step away, speak one sentence. Twenty seconds, and never while they are standing in front of you.',
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
      'Fifteen minutes before your next meeting: their face, their role, and one thing you talked about.',
    accent: true,
  },
]

export function HowItWorks() {
  return (
    <section className="px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[1100px]">
        <h2 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight text-neutral-900 text-balance sm:text-4xl">
          Two moments, and nothing in between.
        </h2>

        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <li
              key={step.n}
              className={`rounded-2xl border p-8 ${
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
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
