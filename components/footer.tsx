import { Wordmark } from '@/components/wordmark'

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-4 sm:flex-row">
        <Wordmark className="text-base" />

        <div className="flex items-center gap-6 text-sm text-neutral-500">
          <a
            href="mailto:hello@naymly.com"
            className="rounded transition hover:text-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            hello@naymly.com
          </a>
          <span>&copy; {new Date().getFullYear()} Naymly</span>
        </div>
      </div>
    </footer>
  )
}
