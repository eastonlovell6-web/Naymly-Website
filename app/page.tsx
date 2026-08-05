import { WaitlistForm } from '@/components/waitlist-form'

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <WaitlistForm source="hero" />
    </main>
  )
}
