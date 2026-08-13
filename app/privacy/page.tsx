import type { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'

/*
  ─────────────────────────────────────────────────────────────────────────────
  Everything on this page is a factual description of what lib/waitlist.ts,
  lib/rate-limit.ts, and the home page's Carto-backed map actually do, and was
  written from that code. Keep it that way: if the collection changes, this
  page changes in the same commit.

  Settled on 2026-08-13:

  - CARTO DISCLOSURE. The home page hero map (components/people-map-canvas.tsx
    via components/ui/mapcn-marker-tooltip.tsx) loads its basemap tiles live
    from basemaps.cartocdn.com. That is a real third party network request, so
    the "no third party embeds" line in "Analytics and cookies" was false.
    Disclosed it there instead of removing the map or self-hosting the tiles.

  - CONTACT ADDRESS VERIFIED. hello@naymly.com forwards through Cloudflare
    Email Routing (MX + SPF confirmed at the registrar) to an inbox someone
    reads. Tested end to end. The "a person reads that address" claim in "Who
    is responsible" is backed by a real test, not an assumption.

  Settled on 2026-08-12:

  - OPERATOR. No registered entity yet, US based, so the page names no company
    and no jurisdiction-specific regime.

  - CCPA does not apply. It is threshold based (revenue, volume, or selling
    personal information) and a pre-launch waitlist meets none of the tests.

  - GDPR is treated as out of scope because Naymly is US based and does not
    target the EU or UK. That position depends on continuing not to target
    them. If EU or UK marketing ever starts, this page needs a lawful basis
    and possibly a representative, so revisit it then.

  One thing still open:

  1. ENTITY NAME. An LLC is being formed. Once it is registered, put its legal
     name into "Who is responsible" and delete the sentence saying there is no
     registered company. Apple will also want the entity at App Store
     enrollment, so these land around the same time.

  This is a plain description of a small waitlist, not legal advice.
  ─────────────────────────────────────────────────────────────────────────────
*/

export const metadata: Metadata = {
  title: 'Privacy | Naymly',
  description:
    'What Naymly collects when you join the waitlist, why, how long it is kept, and how to have it deleted.',
  robots: { index: true, follow: true },
}

const UPDATED = '13 August 2026'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-lede font-semibold text-neutral-900">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-neutral-600">{children}</div>
    </section>
  )
}

export default function Privacy() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[680px] px-5 py-16 sm:px-8 sm:py-24">
        <h1 className="text-section font-semibold text-neutral-900">Privacy</h1>
        <p className="mt-4 text-lede text-neutral-600">
          Naymly is a product about handling other people&rsquo;s details with care. It would be
          strange to say that and then be vague about your own. So here is everything this website
          collects, in full.
        </p>
        <p className="mt-2 text-sm text-neutral-500">Last updated {UPDATED}.</p>

        <Section title="What this page covers">
          <p>
            This covers naymly.com, the website. The Naymly iOS app has not launched. When it does,
            it will have its own privacy policy, and the commitments made on the home page about how
            it handles your notes will be spelled out there.
          </p>
        </Section>

        <Section title="What is collected when you join the waitlist">
          <p>When you submit the form, three things are stored:</p>
          <ul className="flex list-disc flex-col gap-2 pl-5">
            <li>
              <strong className="font-medium text-neutral-900">Your email address.</strong> So we
              can tell you when Naymly launches. It is lowercased before it is stored, so the same
              address cannot end up on the list twice.
            </li>
            <li>
              <strong className="font-medium text-neutral-900">Which form you used.</strong> Either
              the one at the top of the page or the one at the bottom. This is only useful for
              knowing which part of the page does its job.
            </li>
            <li>
              <strong className="font-medium text-neutral-900">
                The page you arrived from, if any.
              </strong>{' '}
              Your browser sends this automatically as a referrer. It tells us whether you came from
              LinkedIn, a search, or a link someone shared. It is a page address, not anything about
              you.
            </li>
          </ul>
          <p>
            Nothing else. There is no name field, no company field, no phone number, and no tracking
            of what you did on the page before you submitted it.
          </p>
        </Section>

        <Section title="Your IP address is not stored">
          <p>
            To stop bots from flooding the waitlist, the server needs to notice when a lot of
            signups come from one place in a short time. Storing visitor IP addresses to do that
            would mean keeping a log of who visited, which is a bigger intrusion than the problem
            deserves.
          </p>
          <p>
            So the address is never written down. It is converted into an irreversible fingerprint
            using a secret key, and only that fingerprint is stored. It can answer &ldquo;have there
            been several signups from this one source in the past hour&rdquo; and nothing else. It
            cannot be turned back into an address, and it cannot be matched against a fingerprint
            from anywhere else. These records are deleted automatically after 24 hours.
          </p>
        </Section>

        <Section title="Analytics and cookies">
          <p>
            No analytics, no advertising pixels, and no cookies are set by this site.
          </p>
          <p>
            One exception: the map on the home page loads its basemap from Carto
            (basemaps.cartocdn.com), a third party map-tile provider. Rendering it means your
            browser requests map tiles directly from Carto&rsquo;s servers, which see your IP
            address and user agent the way any server does when it is asked for a file &mdash;
            the same as loading an image from any other domain. That request sets no cookie and
            reports nothing back to us. It is a rendering dependency, not tracking.
          </p>
        </Section>

        <Section title="Where it is stored, and who can see it">
          <p>
            Signups are stored in a Postgres database hosted by Supabase on servers in the United
            States. The site itself is hosted by Vercel. Both companies can technically access the
            infrastructure they run, as any host can.
          </p>
          <p>
            The database is configured so the waitlist cannot be read by the website&rsquo;s public
            code or by anyone visiting the site. Only the server, holding a secret key, can write to
            it. Your address is never shown back to another visitor, and the list is never sold,
            rented, or shared with anyone else.
          </p>
          <p>
            If you are outside the United States, joining the waitlist means your address is stored
            in the United States.
          </p>
        </Section>

        <Section title="How long it is kept">
          <p>
            Your email address is kept until Naymly launches and the waitlist has been contacted, or
            until you ask for it to be deleted, whichever comes first. If the product does not ship,
            the list is deleted.
          </p>
          <p>The anti-spam fingerprints described above are deleted after 24 hours.</p>
        </Section>

        <Section title="What you can ask for">
          <p>
            Email <ContactLink /> and you can ask to see whatever is stored about you, to have it
            corrected, or to have it deleted. Deletion is the easy one: it is a single row and it
            will be gone. You do not need to give a reason, and asking will not be treated as
            anything other than what it is.
          </p>
        </Section>

        <Section title="Changes">
          <p>
            If what is collected changes, this page changes with it and the date at the top moves.
            There is no mailing list for policy updates, because sending you mail you did not ask
            for would defeat the point.
          </p>
        </Section>

        <Section title="Who is responsible">
          <p>
            Naymly is an independent project based in the United States. It is not yet a registered
            company, so the person who runs it is responsible for the information described here.
          </p>
          <p>
            For anything on this page, or anything it does not answer, email <ContactLink />. A
            person reads that address.
          </p>
        </Section>

        <p className="mt-12">
          <Link
            href="/"
            className="rounded text-neutral-500 underline underline-offset-4 transition hover:text-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50"
          >
            Back to naymly.com
          </Link>
        </p>
      </main>
      <Footer />
    </>
  )
}

function ContactLink() {
  return (
    <a
      href="mailto:hello@naymly.com"
      className="rounded text-brand-500 underline underline-offset-4 transition hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50"
    >
      hello@naymly.com
    </a>
  )
}
