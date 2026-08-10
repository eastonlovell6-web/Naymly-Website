import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
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
    <html lang="en" className={jakarta.variable}>
      <head>
        {/*
          Scroll reveals hide their content in CSS so it is already hidden at
          the first paint, and JavaScript is what brings it back. With scripting
          off, nothing ever would — most of this page would render blank. This
          restores the revealed state for that case.

          In <head> rather than beside the content so it applies before the
          first paint; a <style> further down would leave the page briefly empty
          even here. dangerouslySetInnerHTML because React will not take a raw
          string child for a <style> tag.
        */}
        <noscript
          dangerouslySetInnerHTML={{
            __html:
              '<style>.reveal { opacity: 1 !important; transform: none !important; }</style>',
          }}
        />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  )
}
