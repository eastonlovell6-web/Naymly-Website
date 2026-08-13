import { HeroVisual } from '@/components/hero-visual'
import { HeroProductFrame } from '@/components/hero-product-frame'
import { HeroWaitlist } from '@/components/hero-waitlist'

export function Hero() {
  return (
    <section
      id="top"
      /*
        Taller than the viewport on purpose — this is the reference's hero, where
        the product frame starts inside the fold and runs off the bottom of it,
        so the crop itself is what tells you there is more to see.

        That is a reversal. This section used to be exactly min-h-dvh, sized so
        nothing from the next section showed above the fold, with an "explore
        more" badge pinned to the bottom edge doing the work the crop now does.
        The badge is gone with it: a cropped object is a stronger scroll cue than
        a label saying scroll, and there is no room for both.

        - No min-h-dvh here any more. The copy block below owns the fold height
          instead, so the frame's top edge is positioned against the viewport
          rather than against whatever the copy happens to measure.
        - The negative top margin spans the sticky nav so the gradient sits behind
          it. The nav is transparent until you scroll and was revealing the plain
          body background as a warm band above the gradient, which is not what a
          nav that starts transparent is for. The matching top padding keeps the
          content clear of it. It is 4rem + 1px, not 4rem: the nav is an h-16
          inner element inside a header carrying border-b, so the header measures
          65px and a flat -mt-16 leaves a 1px seam of body background on top.
      */
      className="relative isolate -mt-[calc(4rem_+_1px)] flex flex-col overflow-hidden pt-[calc(4rem_+_1px)]"
    >
      <HeroVisual />

      {/*
        One centred column: headline, supporting copy, buttons, availability
        note, in that order and on the centre line at every width.

        This replaced a twelve-column split that put the headline on the left
        and everything else in a narrow band on the right. That layout only
        existed above lg — below it the two halves stacked into this same
        order anyway — so the stack is now the single arrangement rather than
        the small-screen fallback for one.

        flex-1 takes the space left between the nav and the badge and
        justify-center puts the block in the middle of it. The padding is
        top-heavy rather than symmetric, which is what biases the copy below
        that centre line: with justify-center the block sits in the middle of
        the content box, so an extra 104px of top padding over bottom moves it
        52px down the fold. The reference carries visibly more air above its
        headline than below its button — about 25% of the fold against 16% —
        and a straight centre put ours the other way round, high in the fold
        with the dead space underneath.

        It stays padding on both sides rather than pt alone: the block is still
        centred in what is left, so it needs a floor under it as much as a
        ceiling over it once the window gets short enough for the two to meet.
        The reference's full ratio is not reachable here — it has nothing under
        its button, where we have the badge pinned to the bottom edge, and
        pushing far enough to match would drive that badge off the fold at
        common laptop heights.

        1380px rather than the 1100px the rest of the page uses. The reference
        runs its supporting line to about 84% of the window as a single line,
        and that line needs 1274px once its own size reaches the ceiling below.
        1380 less the 64px of padding clears that with room to spare; 1100, and
        an intermediate 1240, both left it short and broke the line in two from
        1440 up, so the copy got narrower as the window got wider.

        Widening costs nothing here because this block is centred: 1100 was
        aligning the old left-hand headline with the wordmark, and there is no
        longer a left edge for it to align. The badge below keeps 1100, which
        is where that alignment actually still matters.
      */}
      {/*
        min-h in dvh rather than flex-1, which is what sets the crop. The frame
        below starts wherever this block ends, so pinning that end to 72% of the
        viewport leaves a predictable slice of the frame — about 190px on a
        900px window — showing above the fold at every height. flex-1 could not
        do this: it distributes leftover space in a section that no longer has a
        fixed height to have leftovers of.

        72%, not more: the frame needs enough of itself visible to read as a
        cropped object rather than as a stray horizontal rule, and enough of the
        copy above it to not feel shoved up against the nav. dvh for the reason
        it always was — on mobile 100vh is the tallest the viewport ever gets, so
        browser chrome overlaps anything measured against it.

        min-h rather than h: on a short window, or at large text sizes, the copy
        grows the block instead of overflowing it.
      */}
      <div
        className="relative mx-auto flex min-h-[72dvh] w-full max-w-[1380px] flex-col items-center justify-center
          px-5 pt-24 pb-8 text-center sm:px-8 sm:pt-28 sm:pb-10"
      >
        {/*
          Display sizing, not body sizing: leading below 1 and negative
          tracking, both of which only work this far up the scale.

          `text-display` now, rather than a one-off clamp declared here. Same
          fluid 8.2vw basis and the same 3rem floor — a step scale can only hit
          a fixed percentage of the window at one window size per step, which is
          what the old 4.75rem/5.5rem pair drifted either side of — but the
          leading, tracking and ceiling come from the token in app/tokens.css so
          this headline and every section heading move together.

          Two things changed with it, both from docs/DESIGN.md:
          - The ceiling drops 8rem → 5rem. 80px is where the reference caps its
            own display type, and past about 1560px the old ceiling was letting
            this line outgrow the container it sits in.
          - font-extrabold → font-medium. Nothing on the reference is heavier
            than 500, and at this size weight is not what carries a headline —
            the -0.05em tracking and the leading of exactly 1 are. Extrabold at
            80px reads as shouting; medium reads as set.

          No width cap: the container wraps it to two lines on its own at this
          size, and text-balance evens them instead of leaving a short orphan
          on the second.
        */}
        <h1 className="text-display font-medium text-neutral-900 text-balance">
          Never{' '}
          {/*
            The underline is drawn rather than typographic — no text-decoration,
            no border-bottom — because the point of it is that it is not
            straight. Two passes of a wobbling stroke that cross each other read
            as one mark made by hand; a single clean curve just reads as a
            curved rule.

            preserveAspectRatio="none" stretches the box to whatever width the
            word happens to be, and that is safe here rather than distorting:
            the SVG is sized in em on both axes against a word whose width is
            also proportional to the font size, so the rendered aspect stays
            near the viewBox's own at every point on the headline's clamp. The
            stroke comes out within about 10% of round.

            Geometry and animation live in globals.css — the draw needs
            keyframes, which no utility can express.
          */}
          <span className="sketch-underline">
            blank
            <svg
              className="sketch-underline-mark"
              viewBox="0 0 200 14"
              preserveAspectRatio="none"
              fill="none"
              aria-hidden="true"
            >
              {/*
                pathLength="1" restates each path as one unit long whatever its
                real geometry, so the dash pair that hides it is 1 and the draw
                is offset 1 → 0. Without it the dasharray has to be the measured
                length of the curve, which means measuring it in the browser and
                turning a static headline into a client component to do so.
              */}
              {/*
                The first pass carries the weight: it sags through the first
                half, recovers, and finishes higher than it started, which is
                what a fast stroke pulled left to right by a right hand
                actually does. The rise is deliberate — a mark that ends level
                with its start looks measured, and this one should not.
              */}
              <path
                className="sketch-underline-pass-1"
                pathLength={1}
                d="M 2.5 7.4 C 24 10.4, 46 11.6, 70 11.4 C 96 11.2, 124 9.4, 150 8 C 168 7, 184 6.6, 197.5 5.6"
              />
              {/*
                The second crosses the first twice — under it at both ends,
                over it through the middle — and stops short of both. Two
                curves that stay parallel read as a double underline however
                faint the lower one is; crossing is the whole difference.
              */}
              <path
                className="sketch-underline-pass-2"
                pathLength={1}
                d="M 14 11.8 C 44 9.2, 72 8.6, 104 9.6 C 130 10.4, 158 9, 188 6.2"
              />
            </svg>
          </span>{' '}
          on a name again.
        </h1>

        {/*
          neutral-700 rather than the neutral-600 this used to be. The hero
          background is an animated gradient that drifts as dark as brand-300,
          where neutral-600 measures 4.28:1 and neutral-500 only 2.56:1, both
          under the 4.5:1 AA floor for text this size. Darkening the type keeps
          the gradient's full range instead of washing it out to near-white to
          compensate.
        */}
        {/*
          The full width of the container, on the same fluid basis as the
          headline: 1.55vw is the reference's supporting size, and the line it
          sets runs to roughly 84% of the window, which is the widest single
          element on that fold. Ours lands on one line from about 1200px up and
          breaks to two below it, where text-balance evens the pair.

          This was max-w-3xl at a flat text-lg, and before that max-w-64 sized
          to match a button row it no longer sits beside. Both were narrower
          than the headline above them, which is the opposite of the reference,
          where the supporting line is the element that sets the block's width.

          The floor is the previous text-lg: 1.55% of a phone is 6px. The
          ceiling stops it reaching the headline's weight on very wide windows.
          leading-relaxed drops to leading-snug once the line gets long, since
          1.625 line-height on a 1200px measure opens a gap wide enough to lose
          the return sweep on the two-line case.
        */}
        <p
          className="mt-9 max-w-full text-[clamp(1.125rem,1.55vw,1.5rem)] leading-snug text-neutral-700 text-balance
            sm:mt-10"
        >
          Naymly keeps track of every connection in your life, bringing you the
          right details the very moment you need them.
        </p>

        {/*
          The reference leaves noticeably more air above its button than
          between its headline and supporting line — 4.1% of the window against
          2.9% — which is what stops the three of them reading as one
          undifferentiated stack. mt-14 is that 4.1% at 1440.
        */}
        {/*
          Two glass objects, sitting directly on the constellation mesh, which
          is what makes the treatment worth having here and nowhere else on the
          page: the surfaces blur the dots behind them and leave them sharp
          beside them, so the row reads as physically above the fold rather than
          drawn on it. The surfaces themselves live in globals.css.

          The button used to be a link to the form at the foot of the page. It
          now submits an address typed here, which is the point of the field
          beside it: the fold is where the intent is, and sending a visitor a
          full page down to act on it loses some of them on the way. The closing
          CTA keeps its own copy of the form for anyone who reads first.
        */}
        <div className="mt-11 flex justify-center sm:mt-14">
          <HeroWaitlist />
        </div>

        {/*
          Not in the reference, which has nothing under its buttons. Kept anyway
          because it is the one thing on the fold that says this is a waitlist
          and not a download, and dropping real product information to match the
          proportions of a mock is the wrong trade.
        */}
        <p className="mt-4 text-sm text-neutral-600">
          Coming to iOS. You will hear from us first.
        </p>
      </div>

      {/*
        The product frame, straddling the fold.

        Aligned to the same 1100px container as the rest of the page, so its
        edges line up with the wordmark above and the section headings below
        rather than floating at an arbitrary inset — the reference's whole trick
        is that the frame is wide and prominent while still sitting in the same
        column as everything else.

        This is where the map now lives. It used to be a section of its own two
        folds down, which meant the one screen that shows what the product
        actually produces was the one most visitors never reached.
      */}
      <div className="relative mx-auto w-full max-w-[1100px] px-5 pb-24 sm:px-8 sm:pb-[7.5rem]">
        <HeroProductFrame />

        {/*
          The old #places heading, demoted to a caption. A map of names needs one
          line saying what it is — without it the frame reads as a screenshot of
          a map rather than as six months of introductions kept in place.
        */}
        <p className="mt-5 text-sm text-neutral-600">
          Six months of introductions, still attached to where they happened.{' '}
          <span className="hidden sm:inline">
            Hover a name for the rest of what you captured.
          </span>
        </p>
      </div>
    </section>
  )
}
