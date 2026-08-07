import OrbitingCirclesGlobe from '@/components/ui/orbiting-circles-02'

/**
 * Sits between Privacy and ClosingCta. Deliberately neutral-50 rather than the
 * neutral-100 of the section above it: the orbit badges use bg-background, which
 * maps to neutral-50, and they have to be opaque against the surface so they
 * punch a clean hole through the ring line they cross.
 *
 * The globe is half below its own container's edge by design, so this section
 * carries top padding only and lets the visual run into the CTA beneath it.
 */
export function PeopleOrbit() {
  return (
    <section className="relative overflow-hidden bg-neutral-50 px-5 pt-24 sm:px-8 sm:pt-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold leading-tight tracking-tight text-neutral-900 text-balance sm:text-4xl">
          Everyone worth remembering, in one orbit.
        </h2>

        <p className="mt-6 text-lg leading-relaxed text-neutral-600">
          Your daughter&rsquo;s teacher. The founder from the conference. The
          neighbor whose dog you greet by name. Naymly holds all of them, and
          brings the right one back the moment before it matters.
        </p>
      </div>

      <div className="mt-6">
        <OrbitingCirclesGlobe />
      </div>
    </section>
  )
}
