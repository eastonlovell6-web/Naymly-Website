import type { Metadata } from 'next'
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

/*
  Carries every label on the page: button text, section eyebrows, the 001/002
  ordinals on the steps. Never prose — see docs/DESIGN.md.

  Loaded at 400/500 only, which is the whole weight range this design uses.
  Pulling the default range would ship six more files for faces nothing renders.
*/
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  weight: ['400', '500'],
  display: 'swap',
})

/*
  The wordmark, and nothing else. Vercel's Geist, not the Geist Mono already
  loaded for labels above — same family, but the sans cut, so the mark reads
  as clean and neutral rather than as a display face doing a "logo" bit.

  700 only, which is what the mark asks for. No second weight is loaded
  because nothing else on the page renders in this face.
*/
const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  weight: ['700'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://naymly.com'),
  title: 'Naymly | Never blank on a name again',
  description:
    'Naymly captures who you met in 20 seconds, then hands you their face, their role, and the one thing you talked about, 15 minutes before you see them next.',
  openGraph: {
    title: 'Naymly | Never blank on a name again',
    description:
      'Capture who you met in 20 seconds. Get the brief 15 minutes before you see them next.',
    url: 'https://naymly.com',
    siteName: 'Naymly',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Naymly | Never blank on a name again',
    description:
      'Capture who you met in 20 seconds. Get the brief 15 minutes before you see them next.',
  },
  // Phase 1 shipped this as noindex, because a preview build that accepted
  // emails and discarded them must never be indexed. Signups now persist, so
  // the site is allowed to be found.
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${geistMono.variable} ${geistSans.variable}`}
    >
      <head>
        {/*
          Scroll reveals hide their content in CSS so it is already hidden at
          the first paint, and JavaScript is what brings it back. With scripting
          off, nothing ever would — most of this page would render blank. This
          restores the revealed state for that case.

          `.motion-reveal` is the same problem arriving by a different route:
          the service cards animate in from JavaScript, and their hidden state
          is an inline opacity:0 rendered by the server. Inline styles are why
          both selectors need !important.

          In <head> rather than beside the content so it applies before the
          first paint; a <style> further down would leave the page briefly empty
          even here. dangerouslySetInnerHTML because React will not take a raw
          string child for a <style> tag.
        */}
        <noscript
          dangerouslySetInnerHTML={{
            __html:
              '<style>.reveal, .motion-reveal { opacity: 1 !important; transform: none !important; }</style>',
          }}
        />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  )
}
