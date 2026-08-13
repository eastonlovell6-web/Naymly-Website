import type { Metadata } from 'next'
import { Geist_Mono, Passion_One, Plus_Jakarta_Sans } from 'next/font/google'
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
  The wordmark, and nothing else. A display face this heavy has no second use on
  a page whose heaviest weight is otherwise 500 — putting it on a heading would
  read as a different site's heading.

  700 only, which is what the mark asks for. Passion One also ships 400 and 900;
  loading either would be two more files for a face that renders in one place.
*/
const passionOne = Passion_One({
  subsets: ['latin'],
  variable: '--font-passion-one',
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
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${geistMono.variable} ${passionOne.variable}`}
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
