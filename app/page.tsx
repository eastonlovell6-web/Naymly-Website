import { Nav } from '@/components/nav'
import { Hero } from '@/components/hero'
import { Gap } from '@/components/gap'
import { HowItWorks } from '@/components/how-it-works'
import { Privacy } from '@/components/privacy'

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <Gap />
      <HowItWorks />
      <Privacy />
    </>
  )
}
