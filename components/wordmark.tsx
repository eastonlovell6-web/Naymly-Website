/**
 * The only place the Naymly wordmark is rendered. When a designed logo
 * exists, replace the contents of this component and nothing else changes.
 */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`text-xl font-extrabold tracking-tight text-brand-500 ${className}`}>
      Naymly
    </span>
  )
}
