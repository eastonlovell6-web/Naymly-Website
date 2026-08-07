const COMMITMENTS = [
  {
    title: 'Photos are processed on your device',
    body: 'Faces never leave your phone to be recognized.',
  },
  {
    title: 'The AI reads text, never photos',
    body: 'Only the name and the context you captured are ever sent for processing.',
  },
  {
    title: 'One tap deletes everything',
    body: 'On your phone and in the cloud, together, with nothing left behind.',
  },
]

export function Privacy() {
  return (
    <section id="privacy" className="scroll-mt-16 bg-neutral-100 px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[1100px]">
        <h2 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight text-neutral-900 text-balance sm:text-4xl">
          You are keeping notes about real people. That deserves care.
        </h2>

        <ul className="mt-12 grid gap-8 sm:grid-cols-3">
          {COMMITMENTS.map((item) => (
            <li key={item.title}>
              <div className="h-1 w-10 rounded-full bg-gold-500" />
              <h3 className="mt-5 text-lg font-bold leading-snug text-neutral-900 text-balance">
                {item.title}
              </h3>
              <p className="mt-2 leading-relaxed text-neutral-600">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
