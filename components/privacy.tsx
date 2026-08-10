import { Reveal } from '@/components/reveal'

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

/*
  The same left-to-right cascade as the cards in components/how-it-works.tsx,
  scoped to sm because this grid goes to three columns a breakpoint earlier than
  that one does. That file's STAGGER carries the full reasoning for why these are
  literal class names and where the numbers come from.
*/
const STAGGER = [
  'sm:[--reveal-delay:220ms]',
  'sm:[--reveal-delay:330ms]',
  'sm:[--reveal-delay:440ms]',
]

export function Privacy() {
  return (
    <section id="privacy" className="scroll-mt-16 bg-neutral-100 px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[1100px]">
        <Reveal
          as="h2"
          className="max-w-2xl text-3xl font-bold leading-tight tracking-tight text-neutral-900 text-balance sm:text-4xl"
        >
          You are keeping notes about real people. That deserves care.
        </Reveal>

        <ul className="mt-12 grid gap-8 sm:grid-cols-3">
          {COMMITMENTS.map((item, i) => (
            /*
              Staggered from sm rather than md, matching this grid's own
              breakpoint — these go to three columns a step earlier than the
              cards in how-it-works do. See STAGGER there for why the delays are
              written out as literal classes.
            */
            <Reveal as="li" key={item.title} className={STAGGER[i]}>
              {/*
                The rule wipes out from its left edge instead of rising with the
                rest of the item. It is 40px of solid gold and the only pure
                graphic element in the section, so it is the one thing here that
                can carry a different gesture without the group looking
                inconsistent — and a short horizontal bar sliding up reads as
                the text below it shifting, where a wipe reads as the bar being
                drawn.
              */}
              <Reveal variant="bar" className="h-1 w-10 rounded-full bg-gold-500" />
              <h3 className="mt-5 text-lg font-bold leading-snug text-neutral-900 text-balance">
                {item.title}
              </h3>
              <p className="mt-2 leading-relaxed text-neutral-600">{item.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
