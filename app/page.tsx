import { Nav } from '@/components/nav'
import { Hero } from '@/components/hero'
import { HowItWorks } from '@/components/how-it-works'
import { Gap } from '@/components/gap'
import { ClosingCta } from '@/components/closing-cta'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <Gap />
        <ClosingCta />
      </main>
      <Footer />
    </>
  )
}
