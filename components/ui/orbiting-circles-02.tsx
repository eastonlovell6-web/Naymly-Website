'use client'

import React from 'react'
import ParticleSphereAnimation from '@/components/ui/orbiting-circles-02-utils/particalsphear'

/**
 * Concentric circles of a life, innermost first: the people you never forget,
 * then the ones you sometimes do, then everyone you meet once and mean to
 * remember. Angles are evenly spread per ring so no two people bunch up.
 *
 * The upstream component mirrored each icon at +180deg to fill its rings. That
 * is fine for product logos and wrong for faces, where the same person twice on
 * one orbit reads as a bug, so the mirroring is gone and each ring lists its
 * full cast directly.
 */
const orbits = [
  {
    size: 'w-110 h-110 md:w-180 md:h-180',
    duration: 18,
    people: [
      { emoji: '👩', label: 'Mom', angle: -120 },
      { emoji: '👨', label: 'Dad', angle: 0 },
      { emoji: '👶', label: 'Baby', angle: 120 },
    ],
  },
  {
    size: 'w-150 h-150 md:w-220 md:h-220',
    duration: 24,
    people: [
      { emoji: '👵', label: 'Grandma', angle: -60 },
      { emoji: '👴', label: 'Grandpa', angle: 60 },
      { emoji: '🧑‍🤝‍🧑', label: 'Friends', angle: 180 },
    ],
  },
  {
    size: 'w-180 h-180 md:w-265 md:h-265',
    duration: 30,
    people: [
      { emoji: '🧑‍💼', label: 'Colleague', angle: -135 },
      { emoji: '👩‍🏫', label: 'Teacher', angle: -45 },
      { emoji: '🧑‍⚕️', label: 'Doctor', angle: 45 },
      { emoji: '🧑‍🔧', label: 'Neighbor', angle: 135 },
    ],
  },
]

export default function OrbitingCirclesGlobe() {
  return (
    <div
      // Purely decorative. The section heading carries the meaning, and letting
      // a screen reader announce ten bare emoji as "woman, man, baby..." is noise.
      aria-hidden="true"
      /*
        Height is derived, not chosen. Every ring is bottom-anchored and pulled
        down by half its own height, so the tallest one only reaches its radius
        above the bottom edge: 180/2 = 90 units at base, 265/2 = 133 at md. The
        remaining 14/15 units clear the badge that straddles the ring line at its
        topmost point, which overflow-hidden would otherwise shave off, with
        enough slack left that bumping the badge padding a step does not clip it.
        Upstream's 110/160 left 20 and 27 units of dead air up here, which reads
        as a broken margin between this and whatever copy sits above it.
      */
      className="relative flex h-104 w-full justify-center overflow-hidden md:h-148"
    >
      <style>{`
        @keyframes orbit-cw {
          from { transform: rotate(var(--start-angle)) }
          to   { transform: rotate(calc(var(--start-angle) + 360deg)) }
        }
        @keyframes orbit-ccw {
          from { transform: rotate(var(--start-angle)) }
          to   { transform: rotate(calc(var(--start-angle) - 360deg)) }
        }
        @keyframes counter-cw {
          from { transform: rotate(var(--counter-offset, 0deg)) }
          to   { transform: rotate(calc(var(--counter-offset, 0deg) - 360deg)) }
        }
        @keyframes counter-ccw {
          from { transform: rotate(var(--counter-offset, 0deg)) }
          to   { transform: rotate(calc(var(--counter-offset, 0deg) + 360deg)) }
        }
      `}</style>

      {/* Center particle globe */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 z-10 aspect-square w-75 -translate-x-1/2 translate-y-1/2 md:w-145">
        <ParticleSphereAnimation />
      </div>

      {/* Orbiting rings */}
      {orbits.map((orbit, index) => {
        // Alternating direction stops the rings from reading as one rigid object.
        const isClockwise = index % 2 === 0
        const orbitAnim = isClockwise ? 'orbit-cw' : 'orbit-ccw'
        const counterAnim = isClockwise ? 'counter-cw' : 'counter-ccw'

        return (
          <div
            key={index}
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rounded-full border border-border ${orbit.size}`}
          >
            {orbit.people.map((person) => (
              // The rail. Zero width and pinned to the ring's centre so rotating
              // it about origin-bottom sweeps its top end around the ring edge.
              <div
                key={person.label}
                className="absolute top-0 left-1/2 h-1/2 w-0 origin-bottom"
                style={
                  {
                    '--start-angle': `${person.angle}deg`,
                    animation: `${orbitAnim} ${orbit.duration}s linear infinite`,
                  } as React.CSSProperties
                }
              >
                {/*
                  Static positioner. The badge cannot centre itself because its
                  own transform is owned by the counter-rotation keyframes, so
                  the offset lives one level up where nothing is animating.
                  Percentage translate is exact at any badge size, unlike the
                  fixed negative margin upstream used, which only lined up at md.
                */}
                <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2">
                  <div
                    className="rounded-full border border-border bg-background p-3 sm:p-4"
                    // Cancels the rail's rotation so each face stays upright
                    // through the whole orbit.
                    style={
                      {
                        '--counter-offset': `${-person.angle}deg`,
                        animation: `${counterAnim} ${orbit.duration}s linear infinite`,
                      } as React.CSSProperties
                    }
                  >
                    <span className="flex h-6 w-6 items-center justify-center text-base leading-none select-none md:h-8 md:w-8 md:text-2xl">
                      {person.emoji}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
