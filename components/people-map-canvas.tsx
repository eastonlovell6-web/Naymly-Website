'use client'

import { useEffect, useState } from 'react'

import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerLabel,
  MarkerTooltip,
  useMap,
} from '@/components/ui/mapcn-marker-tooltip'

/**
 * The map is the section's whole argument, so the pins are the copy: seven
 * people, the room each one was met in, and the one line you would want back
 * six months later.
 *
 * Coordinates are real, which matters more than it sounds — a label reading
 * "Chelsea Market" sitting over the Hudson is the kind of detail that makes a
 * visitor stop trusting the rest of the page. The names and roles are invented.
 *
 * Two fields are layout rather than content:
 *
 * `label` alternates the name above or below its dot. Several of these places
 * are genuinely close together — Grand Central and Rockefeller Center are 600m
 * apart — and at the zoom that fits all seven, that is under 80px. Putting one
 * name above its dot and its neighbour's below is what keeps the pair legible
 * without moving either pin off the place it actually is.
 *
 * `compact` marks the four that survive on a phone. Fitting seven names into a
 * 235x330 box means names on top of names; these four are the widest spread in
 * the set, so the map still reads as a city rather than a pile.
 */
type Person = {
  name: string
  role: string
  met: string
  lng: number
  lat: number
  label: 'top' | 'bottom'
  compact?: boolean
}

const PEOPLE: Person[] = [
  {
    name: 'Maya Chen',
    role: 'Head of product, Ramp',
    met: 'Javits Center, by the coffee cart',
    lng: -74.0021,
    lat: 40.758,
    label: 'top',
    compact: true,
  },
  {
    name: 'Hannah Reyes',
    role: 'Design lead, Cadence',
    met: 'The rooftop at Rockefeller Center',
    lng: -73.9787,
    lat: 40.7587,
    label: 'top',
  },
  {
    name: 'Devin Osei',
    role: 'Recruiter, Northbeam',
    met: 'The 6:40 out of Grand Central',
    lng: -73.9772,
    lat: 40.7527,
    label: 'bottom',
  },
  {
    name: 'Yuki Tanaka',
    role: 'Operations, Fieldstone',
    met: 'Gantry Plaza, after the offsite',
    lng: -73.9583,
    lat: 40.7447,
    label: 'top',
    compact: true,
  },
  {
    name: 'Priya Raghavan',
    role: 'Founder, Lumen Health',
    met: 'Chelsea Market, ten minutes after her demo',
    lng: -74.006,
    lat: 40.7424,
    label: 'top',
  },
  {
    name: 'Marcus Bell',
    role: 'Angel investor',
    met: 'A bench in Washington Square',
    lng: -73.9973,
    lat: 40.7308,
    label: 'bottom',
    compact: true,
  },
  {
    name: 'Elena Duarte',
    role: 'Partner, Harbor & Vine',
    met: 'Exchange Place, waiting on the ferry',
    lng: -74.0333,
    lat: 40.7167,
    label: 'bottom',
    compact: true,
  },
]

/**
 * Frames the map around whichever pins are showing.
 *
 * A fixed center and zoom cannot survive this layout: the card is 2:1 on a
 * desktop and taller than it is wide on a phone, so any single zoom that fits
 * all seven on one either buries half of them off-frame or shrinks the city to
 * a smudge on the other. Fitting to the pins is the only version that holds at
 * both ends, and it re-fits on resize rather than only at mount — the card's
 * height changes at two breakpoints.
 *
 * Renders nothing. It exists to reach the map instance through the context the
 * Map component provides, which is the only handle its children get.
 */
function FitToPeople({ people }: { people: Person[] }) {
  const { map } = useMap()

  useEffect(() => {
    if (!map) return

    const fit = () => {
      const lngs = people.map((person) => person.lng)
      const lats = people.map((person) => person.lat)
      const narrow = map.getContainer().clientWidth < 640

      /*
        The padding is deliberately lopsided towards the sides. A name is
        centred on its dot and runs to about 100px wide, so the outermost pins
        need half a label of clearance or the first and last names get clipped
        by the card's own rounded edge — vertical clearance only has to cover
        the ~20px the label sits above the dot, plus room for the attribution
        strip along the bottom.
      */
      map.fitBounds(
        [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ],
        {
          padding: narrow
            ? { top: 44, bottom: 48, left: 62, right: 62 }
            : { top: 68, bottom: 72, left: 112, right: 112 },
          /*
            No animation. This runs at mount and on every resize, and a flying
            camera on resize reads as the page fighting the window.
          */
          duration: 0,
        },
      )
    }

    fit()

    /*
      On the container rather than the window: the card changes shape at
      breakpoints the window does not announce in any other way, and this also
      covers the first fit landing before the card has been laid out.
    */
    const observer = new ResizeObserver(fit)
    observer.observe(map.getContainer())
    return () => observer.disconnect()
  }, [map, people])

  return null
}

export default function PeopleMapCanvas() {
  /*
    matchMedia rather than a CSS-only hide, because the pins that get dropped
    also have to leave the bounds calculation — a hidden marker still counts
    towards the frame, and the map would zoom out to fit names nobody can see.

    Safe to resolve during render with no hydration dance: this component is
    loaded by next/dynamic with ssr disabled, so it has never been rendered on
    a server and there is no server markup for a client-only value to disagree
    with. See components/people-map.tsx.
  */
  const [isNarrow, setIsNarrow] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches,
  )

  useEffect(() => {
    const query = window.matchMedia('(max-width: 639px)')
    const onChange = (event: MediaQueryListEvent) => setIsNarrow(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const people = isNarrow ? PEOPLE.filter((person) => person.compact) : PEOPLE

  return (
    <>
      <Map
        /*
          Pinned rather than detected. Left alone, the component follows
          `.dark` on <html> and falls back to the OS preference — this site
          sets neither class, so every visitor whose laptop is in dark mode
          would get a black basemap dropped into a cream page.
        */
        theme="light"
        /*
          The single most important option here. Without it, a scroll that
          happens to pass over the map zooms the map instead of the page, and
          the visitor is stuck mid-article wondering why the site broke.
          MapLibre's cooperative mode requires ctrl/⌘ + scroll on a desktop and
          two fingers on a touch screen, and puts up its own hint when someone
          tries the ordinary gesture.
        */
        cooperativeGestures
        /* Nothing here is 3D, and a stray right-drag that tilts the city is
           damage a visitor has no obvious way to undo. */
        dragRotate={false}
        pitchWithRotate={false}
        touchPitch={false}
      >
        <FitToPeople people={people} />

        {people.map((person) => (
          <MapMarker key={person.name} longitude={person.lng} latitude={person.lat}>
            <MarkerContent className="group">
              {/*
                A dot, not a teardrop pin. Seven teardrops on a pale basemap
                read as a search-results page; a small hard dot with a white
                collar reads as a place that was marked. The collar is what
                keeps it visible where it lands on a road or a park, both of
                which are close to brand-500 in value on this basemap.
              */}
              <span className="block size-3 rounded-full border-2 border-neutral-50 bg-brand-500 shadow-[0_1px_5px_rgb(15_13_10/0.4)] transition-transform duration-200 ease-out group-hover:scale-125" />

              <MarkerLabel
                position={person.label}
                /*
                  The name rides on its own chip. Set straight onto the map it
                  is unreadable the moment it crosses a road casing or a park
                  fill — this is a light basemap, and dark text on light grey
                  is only legible while nothing is behind it. The chip is the
                  page's own neutral-50 at 92%, so the map still shows through
                  and the label still belongs to this site rather than to
                  MapLibre.
                */
                className="rounded-full border border-neutral-200/70 bg-neutral-50/92 px-2 py-0.5 text-[11px] font-semibold tracking-tight text-neutral-900 shadow-[0_1px_3px_rgb(15_13_10/0.12)] transition-colors group-hover:border-brand-300 group-hover:text-brand-700"
              >
                {person.name}
              </MarkerLabel>
            </MarkerContent>

            {/*
              The name is already on the map, so the tooltip carries what the
              name cannot: who they were and where the conversation happened.
              That pairing is the product in one hover.
            */}
            <MarkerTooltip
              /*
                Sent to the side the name is not on. Left to choose, MapLibre
                flips the popup to whichever side has room, and the side with
                room is frequently the side the name chip is already occupying
                — the tooltip then lands on top of the name of the person it is
                describing. `anchor` is which edge of the popup meets the pin,
                so "top" hangs it below the dot and "bottom" floats it above.

                Fixing the anchor also gives up MapLibre's edge avoidance, which
                is safe only because the two are correlated: every pin whose
                name sits above it is in the upper half of the frame and gets a
                tooltip below, and every pin named from below is in the lower
                half and gets one above.
              */
              anchor={person.label === 'top' ? 'top' : 'bottom'}
              className="max-w-[15rem] px-3 py-2 leading-snug"
            >
              <p className="font-semibold">{person.role}</p>
              {/*
                text-balance again on the line itself. The component sets it on
                the tooltip's own box, but balancing is a property of the block
                that holds the text — these two paragraphs are separate blocks,
                and without it the second one wraps a single word onto its last
                line as often as not.
              */}
              <p className="mt-1 text-balance text-neutral-400">{person.met}</p>
            </MarkerTooltip>
          </MapMarker>
        ))}
      </Map>

      {/*
        The map itself is a WebGL canvas with seven absolutely positioned divs
        over it — there is nothing in it for a screen reader, and the names are
        content, not decoration. This is the same information in the order a
        person reading it would want.
      */}
      <ul className="sr-only">
        {PEOPLE.map((person) => (
          <li key={person.name}>
            {person.name}, {person.role}. {person.met}.
          </li>
        ))}
      </ul>
    </>
  )
}
