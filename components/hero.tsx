import { HeroVisual } from '@/components/hero-visual'
import { ExploreMore } from '@/components/explore-more'

export function Hero() {
  return (
    <section
      id="top"
      /*
        Fills the viewport exactly, so nothing from the next section shows above
        the fold on landing.
        - dvh, not vh: on mobile 100vh is the tallest the viewport ever gets, so
          the browser chrome overlaps the bottom of the section and clips it.
        - The negative top margin spans the sticky nav so the gradient sits behind
          it. The nav is transparent until you scroll and was revealing the plain
          body background as a warm band above the gradient, which is not what a
          nav that starts transparent is for. The matching top padding keeps the
          content clear of it. It is 4rem + 1px, not 4rem: the nav is an h-16
          inner element inside a header carrying border-b, so the header measures
          65px and a flat -mt-16 leaves a 1px seam of body background on top.
        - min-h rather than h: if the content is ever taller than the viewport,
          on a landscape phone or at large text sizes, the section grows instead
          of overflowing.
        - flex-col, so the copy sits at the top and the badge is pushed to the
          bottom edge by mt-auto rather than being positioned against a height
          this section does not know in advance.
      */
      className="relative isolate -mt-[calc(4rem_+_1px)] flex min-h-dvh flex-col overflow-hidden pt-[calc(4rem_+_1px)]"
    >
      <HeroVisual />

      <div className="relative mx-auto w-full max-w-[1100px] px-5 pt-14 sm:px-8 sm:pt-20">
        {/*
          Six columns of headline, five of supporting copy, and a full empty
          column between them. The gap is the point: in the reference the two
          blocks are far enough apart to read as separate objects rather than as
          a paragraph that wrapped, which a plain 7/5 split with gutter spacing
          does not achieve at this type size. Below lg they stack in source
          order, which is already the reading order.
        */}
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          {/*
            Display sizing, not body sizing: leading below 1 and negative
            tracking, both of which only work this far up the scale. The headline
            is three lines here where the reference is two, because this copy is
            longer than the mock's — text-balance evens those lines out instead
            of leaving a short orphan on the last one.
          */}
          <h1
            className="text-5xl font-extrabold leading-[0.98] tracking-[-0.03em] text-neutral-900 text-balance
              sm:text-6xl lg:col-span-6 lg:text-[4.75rem] xl:text-[5.5rem]"
          >
            Never blank on a name again.
          </h1>

          {/*
            col-start-8 leaves column 7 empty as the divider described above.
            pt-3 optically aligns the first line of this paragraph with the cap
            height of the headline beside it, which a flat top edge does not do
            when the two type sizes are this far apart.
          */}
          <div className="lg:col-span-5 lg:col-start-8 lg:pt-3">
            {/*
              neutral-700 rather than the neutral-600 this used to be. The hero
              background is an animated gradient that drifts as dark as
              brand-300, where neutral-600 measures 4.28:1 and neutral-500 only
              2.56:1, both under the 4.5:1 AA floor for text this size. Darkening
              the type keeps the gradient's full range instead of washing it out
              to near-white to compensate.
            */}
            {/*
              max-w-64 is measured off the button row below, not picked: the pill
              and the round secondary come to about 256px together, and in the
              reference the supporting copy and the buttons are exactly the same
              width. Left at the column's full width the paragraph runs wider
              than the controls under it and the right-hand block stops reading
              as one object.
            */}
            <p className="max-w-64 text-base leading-relaxed text-neutral-700">
              Naymly keeps track of every connection in your life, bringing you
              the right details the very moment you need them.
            </p>

            <div className="mt-6 flex items-center gap-3">
              {/*
                The reference pairs a bright accent fill with dark text, and that
                pairing is why the button carries the fold. Reproducing it on
                coral means text-neutral-900, not the white this site uses on
                coral elsewhere: white on coral-500 is 3.21:1, under AA for text
                at this size, where neutral-900 on the same fill is 5.9:1.
              */}
              <a
                href="#waitlist"
                className="rounded-full bg-coral-500 px-8 py-3.5 text-base font-semibold text-neutral-900 transition
                  hover:bg-coral-300 focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-coral-700 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50"
              >
                Join the waitlist
              </a>

              {/*
                The round secondary sits where the reference puts a play button.
                There is no video to play, so it points at the mechanics instead
                of miming a control that does nothing. It duplicates no other
                link on the fold: the badge further down goes to the section
                above this one.
              */}
              <a
                href="#how-it-works"
                aria-label="See how Naymly works"
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-neutral-900 transition
                  hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-coral-500">
                  <path d="M8 5l9 7-9 7z" />
                </svg>
              </a>
            </div>

            {/*
              Not in the reference, which has nothing under its buttons. Kept
              anyway because it is the one thing on the fold that says this is a
              waitlist and not a download, and dropping real product information
              to match the proportions of a mock is the wrong trade.
            */}
            <p className="mt-4 max-w-64 text-sm text-neutral-600">
              Coming to iOS. You will hear from us first.
            </p>
          </div>
        </div>
      </div>

      {/*
        The badge, on the bottom edge of the fold where the orbit used to end.

        mt-auto takes up whatever slack is left between the copy and the bottom
        of the viewport, so it stays pinned to the fold at any window height
        rather than sitting at a fixed offset that is only correct at one.

        Aligned to the same 1100px container as the copy above, so it lines up
        under the wordmark instead of floating at an arbitrary inset. The mesh
        now runs the full height of the section, so unlike the orbit there is no
        artwork here for it to land on top of — the only constraint left is the
        one below.

        Hidden under 720px tall: mt-auto pins it to the bottom of the fold, so
        as the window shortens it climbs toward the copy until it reaches the
        last line. The threshold is that arithmetic — the copy runs to roughly
        485px at the narrow widths where the headline and the supporting block
        stack, and this badge is 96px plus its own 112px of padding.

        It was 860px when the orbit was here, sized around a 416px-tall visual
        that no longer exists. At that figure the badge disappeared on every
        common phone, which are 844px and under, leaving the bottom third of the
        fold with nothing in it at all.
      */}
      <div className="relative mx-auto mt-auto hidden w-full max-w-[1100px] px-5 pt-16 pb-12 sm:px-8 [@media(min-height:720px)]:block">
        <ExploreMore href="#why" />
      </div>
    </section>
  )
}
