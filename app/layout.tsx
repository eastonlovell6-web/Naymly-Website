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
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
