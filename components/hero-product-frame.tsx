'use client'

import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'

/*
  Same lazy import as the old #places section used, and for the same reason:
  MapLibre is roughly 250KB of JavaScript before a single tile is fetched, and
  the map builds a WebGL context against a real element while its markers call
  document.createElement during render — there is no server-rendered version of
  any of it, so ssr: false is not optional.

  What changed is where that cost lands. This frame sits on the fold, so the
  observer trick the old section relied on — "load it when the visitor is nearly
  here" — no longer buys anything, because the visitor is already here on
  arrival. Hence the static image below: the fold gets a picture, and the 250KB
  only ever loads for someone who has shown they want to use the thing.
*/
const PeopleMapCanvas = dynamic(() => import('@/components/people-map-canvas'), {
  ssr: false,
})

/**
 * The framed product shot in the hero, cropped by the fold.
 *
 * Renders a pre-rendered picture of the map until the visitor either scrolls
 * the frame fully into view or clicks it, then swaps in the live map. The image
 * is a real capture of this exact map at this exact camera — same seven pins,
 * same basemap — so the swap is a change of capability rather than of picture,
 * and nothing jumps when it happens.
 */
export function HeroProductFrame() {
  const frameRef = useRef<HTMLDivElement>(null)
  const [live, setLive] = useState(false)

  /*
    A negative bottom rootMargin, not a threshold on how much of the frame is
    visible. The distinction matters and cost a bug to find.

    A threshold is a fraction of the *element*, and this element's height varies
    with the breakpoint while the crop does not: at rest the frame is 187px of
    562 showing on a 1440x900 window (33%), but 171px of 280 on a 390x844 phone
    (61%). Any threshold low enough to fire on desktop scroll already fires on a
    phone at rest, which loaded MapLibre on the fold for every mobile visitor —
    the exact cost this component exists to defer.

    What is actually constant is the geometry the hero enforces: the frame's top
    edge sits at 72dvh on every viewport, because the copy block above carries
    min-h-[72dvh]. So shrink the root's bottom edge to 55% of the viewport and
    the frame cannot intersect it at rest on any screen — it only does once the
    visitor has scrolled roughly a quarter of a viewport down, which is intent
    rather than arrival.

    This is coupled to that 72dvh: raise the copy block's min-height above ~55dvh
    and this stops deferring anything.
  */
  useEffect(() => {
    const el = frameRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setLive(true)
        observer.disconnect()
      },
      { rootMargin: '0px 0px -45% 0px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={frameRef}
      /*
        24px radius and a hairline border, which is the reference's product
        frame almost exactly. The shadow is two layers: a 1px contact shadow so
        the edge reads against the constellation behind it, and a long soft one
        that lifts the whole card off the page.
      */
      className="naymly-map overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50
        shadow-[0_1px_2px_rgb(15_13_10/0.04),0_24px_64px_-24px_rgb(15_13_10/0.28)]"
      /*
        Pointer intent, so someone who reaches for the frame while it is still
        cropped by the fold gets the live map without having to scroll it into
        view first. Deliberately not a button and carrying no role: the static
        image is complete content on its own, with alt text describing what is
        pinned where, and nothing here is reachable only by pointer — a keyboard
        visitor scrolling down trips the observer above and gets the same swap.
      */
      onMouseEnter={() => setLive(true)}
      onClick={() => setLive(true)}
    >
      {/*
        The height is the one thing the map cannot supply itself — it fills its
        container, and a container with no height is a container with no map.
        These match the aspect the static image was captured at, so the swap
        does not resize the frame.
      */}
      <div className="relative h-[280px] w-full sm:h-[420px] lg:h-[560px]">
        {live ? (
          <PeopleMapCanvas />
        ) : (
          <Image
            src="/hero-map.png"
            alt="A map of New York with seven people pinned to the places they were met, including Maya Chen at the Javits Center and Elena Duarte in Jersey City"
            fill
            /*
              priority: this is the fold's largest element, so it is the LCP
              candidate. Without it Next lazy-loads it and the fold paints empty
              for a beat — which is the exact failure the static image exists to
              prevent.
            */
            priority
            sizes="(max-width: 1140px) 100vw, 1100px"
            className="object-cover object-center"
          />
        )}
      </div>
    </div>
  )
}
