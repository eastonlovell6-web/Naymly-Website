export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold text-brand-500">Naymly</h1>
      <div className="flex gap-2">
        <div className="h-10 w-10 rounded bg-brand-500" />
        <div className="h-10 w-10 rounded bg-coral-500" />
        <div className="h-10 w-10 rounded bg-gold-500" />
        <div className="h-10 w-10 rounded bg-neutral-900" />
      </div>
    </main>
  )
}
