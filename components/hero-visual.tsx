import ConstellationGrid from '@/components/ui/constellation-grid'

/**
 * Hoisted, not inline: ConstellationGrid bakes labels into its nodes when it
 * builds the grid, so a fresh array identity on every render would rebuild the
 * simulation continuously.
 *
 * First names rather than the component's default hex coordinates. The readout
 * only appears on the few nodes directly under the cursor, and on a product
 * about remembering people, surfacing a name there is the whole pitch in
 * miniature — where `7:B` is a dev-tool tic that says nothing about Naymly.
 * Pass no `labels` prop to get the hex readout back.
 */
const NAMES = [
  'Marcus',
  'Priya',
  'Devon',
  'Sofia',
  'Elena',
  'Theo',
  'Amara',
  'Jonah',
  'Mei',
  'Rafael',
  'Nadia',
  'Caleb',
  'Iris',
  'Omar',
  'Lena',
  'Isaac',
  'Yuki',
  'Nora',
] as const

/*
  Canvas fillText takes a resolved font stack, so this cannot reference
  --font-jakarta: next/font mints a hashed family name at build time and
  ctx.font does not evaluate var(). At 11px the system sans is indistinguishable
  from Jakarta, and using it avoids the labels rendering in a fallback face for
  the first frames while the webfont loads.
*/
const LABEL_FONT = '600 11px ui-sans-serif, system-ui, -apple-system, sans-serif'

/**
 * SWAP POINT. This component owns the hero's visual region and nothing else
 * depends on its internals. When product screenshots exist, replace the body
 * of this component with the mockup. The layout around it does not change.
 *
 * The constellation mesh replaced the animated WebGL gradient, and the orbiting
 * globe that used to sit on the bottom edge of the fold came out with it. Two
 * independent animations on one fold compete rather than combine, and the mesh
 * spans the whole section where the globe only ever held the lower third.
 *
 * It is also the more honest illustration of the product: a field of people
 * that stays connected as you move through it, which is what Naymly claims to
 * do, rather than a decorative colour wash.
 *
 * Purely decorative, so the whole layer is hidden from assistive tech.
 */
export function HeroVisual() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 select-none"
    >
      <ConstellationGrid
        className="h-full w-full"
        /*
          Colours are the site's tokens, not the component's shipped near-black
          and sky cyan. The nav, the headline, and every section below this one
          are built on the warm neutral ramp; a dark fold would have meant a
          light-on-dark variant of all of them and a seam to hide at the bottom.
        */
        background="#F6F5F2" /* neutral-50, matching the body */
        nodeColor="48, 45, 40" /* neutral-700 */
        accentColor="65, 103, 201" /* brand-500 */
        /*
          connectionDistance is set equal to spacing, and that equality is the
          whole trick behind the clean lattice.

          Line opacity falls off with separation and reaches zero exactly at
          connectionDistance. Orthogonal neighbours rest at precisely one pitch
          apart, so at rest they land on that zero and draw nothing at all;
          diagonals are 78px out and never qualify. The field is dots and only
          dots until something moves.

          The component's shipped 75 leaves resting neighbours at 0.27 of peak.
          On the original's near-black that is swallowed, but on neutral-50 it
          measures about seven levels of grey — the faint grid ruling between
          the squares. Pulling the radius in to the pitch removes it by
          construction rather than by picking an alpha low enough to hide it.

          What survives is the part worth having: the cursor's shockwave
          compresses nodes below one pitch, so lines appear exactly where the
          mesh is being squeezed and nowhere else.

          `jitter` is left at its default of 0, so anchors stay on the exact
          lattice and the squares stay square.
        */
        spacing={55}
        connectionDistance={55}
        /*
          170 against the component's 220. That default was sized for a
          full-bleed demo where the highlight is the subject. Here it sits under
          a headline and a CTA, and at 220 the accent disc is wide enough to
          read as a second focal point competing with the button.
        */
        influenceRadius={170}
        /*
          Dark ink on a light ground at the same alpha as the original's light
          ink on a dark one reads much heavier — light backgrounds show low-alpha
          marks that dark ones swallow. These are set so the dots sit under the
          copy as texture and never compete with it.

          lineAlpha is the peak, approached only as a pair of nodes closes to
          nothing, and with the radius pulled in to the pitch it is reachable
          only under the cursor. It can sit higher than it otherwise would
          precisely because it no longer bleeds into the resting field.
        */
        lineAlpha={0.2}
        nodeAlpha={0.22}
        labels={NAMES}
        labelFont={LABEL_FONT}
      />

      {/*
        Softens the top so the nav sits on near-flat ground. The mesh is faint
        enough that it never threatens the wordmark's contrast the way the old
        gradient's dark end did, but nodes crossing behind the links still read
        as noise directly under text.
      */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-neutral-50 via-neutral-50/70 to-transparent" />

      {/*
        Fades the mesh out at the fold's bottom edge so it ends deliberately
        instead of being sliced off by the section boundary.
      */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-neutral-50 to-transparent" />
    </div>
  )
}
