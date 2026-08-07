import { Nav } from '@/components/nav'
import { Hero } from '@/components/hero'
import { Gap } from '@/components/gap'
import { HowItWorks } from '@/components/how-it-works'
import { Privacy } from '@/components/privacy'
import { ClosingCta } from '@/components/closing-cta'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Gap />
        <HowItWorks />
        <Privacy />
        <ClosingCta />
      </main>
      <Footer />
    </>
  )
}
