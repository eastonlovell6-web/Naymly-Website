import { HeroVisual } from '@/components/hero-visual'
import { ExploreMore } from '@/components/explore-more'
import { GlassButton } from '@/components/ui/glass-button'

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
        - flex-col, so the copy block takes the free space with flex-1 and
          centres itself inside it, leaving the badge to sit on the bottom edge
          rather than being positioned against a height this section does not
          know in advance.
      */
      className="relative isolate -mt-[calc(4rem_+_1px)] flex min-h-dvh flex-col overflow-hidden pt-[calc(4rem_+_1px)]"
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
      <div
        className="relative mx-auto flex w-full max-w-[1380px] flex-1 flex-col items-center justify-center px-5 pt-24
          pb-8 text-center sm:px-8 sm:pt-36 sm:pb-10"
      >
        {/*
          Display sizing, not body sizing: leading below 1 and negative
          tracking, both of which only work this far up the scale.

          Fluid rather than a breakpoint ladder. Measured off the reference,
          the headline is a fixed 8.2% of the window at every width — a step
          scale can only hit that at one window size per step and drifts either
          side of it, which is what the old 4.75rem/5.5rem pair did. 8.2vw
          holds the proportion across the range. The floor is the old mobile
          size, where a straight 8.2% would come to 32px and be too small to
          lead a fold; the 8rem ceiling stops it running away past about
          1560px, where the line would otherwise outgrow the container.

          No width cap: the container wraps it to two lines on its own at this
          size, and text-balance evens them instead of leaving a short orphan
          on the second.
        */}
        <h1
          className="text-[clamp(3rem,8.2vw,8rem)] font-extrabold leading-[0.98] tracking-[-0.03em] text-neutral-900
            text-balance"
        >
          {/*
            The one word the product is named for, in the one colour the brand
            owns. brand-500 is the wordmark's exact tone, so the headline points
            back at the logo in the nav above it rather than introducing a
            fourth colour to the fold.

            It reaches 4.8:1 on neutral-50 and holds 4.4:1 at the darkest point
            the hero gradient drifts to, both clear of the 3:1 floor this size
            of text needs and of the 4.5:1 body floor besides — so no lightening
            of the mesh behind it is required to carry it.
          */}
          Never blank on a <span className="text-brand-500">name</span> again.
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
          One glass object, sitting directly on the constellation mesh, which is
          what makes the treatment worth having here and nowhere else on the
          page: the surface blurs the dots behind it and leaves them sharp
          beside it, so the button reads as physically above the fold rather
          than drawn on it. The surface itself lives in globals.css.
        */}
        <div className="mt-11 flex items-center justify-center sm:mt-14">
          {/*
            glass-blue, not the coral fill this used to carry. A near-opaque
            accent pill sat on top of the mesh and hid it; the clear tone lets
            the dots through and blurs them, so the button belongs to the fold
            rather than covering part of it. What it gives up in raw colour it
            takes back in size and in the shadow it casts.

            size="wide", which is default at twice the horizontal padding. A
            round secondary used to sit beside this — 52px of circle plus 16px
            of gap — and its removal left the fold's one call to action at
            roughly three quarters of the width the pair held, small against a
            headline running to 8.2% of the window. The wider box puts the pill
            back at about that combined width, so the button still holds its
            share of the centre line instead of shrinking away from it.
          */}
          <GlassButton href="#waitlist" size="wide" className="glass-blue">
            Join the waitlist
          </GlassButton>
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
        The badge, on the bottom edge of the fold where the orbit used to end.

        The copy block above carries flex-1 and so absorbs whatever slack is
        left between the nav and here, which leaves this on the bottom edge of
        the fold at any window height rather than at a fixed offset that is
        only correct at one. That used to be mt-auto on this element; the two
        cannot both take the free space, and centring the copy in it is what
        the layout now wants.

        Aligned to the same 1100px container as the copy above, so it lines up
        under the wordmark instead of floating at an arbitrary inset. The mesh
        now runs the full height of the section, so unlike the orbit there is no
        artwork here for it to land on top of — the only constraint left is the
        one below.

        Hidden under 720px tall: this sits on the bottom of the fold, so as the
        window shortens the copy above it grows toward it until the two meet.
        The threshold is that arithmetic — the copy runs to roughly 485px at
        the narrow widths, and this badge is 96px plus its own 112px of
        padding.

        It was 860px when the orbit was here, sized around a 416px-tall visual
        that no longer exists. At that figure the badge disappeared on every
        common phone, which are 844px and under, leaving the bottom third of the
        fold with nothing in it at all.
      */}
      <div className="relative mx-auto hidden w-full max-w-[1100px] px-5 pt-16 pb-12 sm:px-8 [@media(min-height:720px)]:block">
        <ExploreMore href="#why" />
      </div>
    </section>
  )
}
