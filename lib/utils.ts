import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * The class merger every shadcn component imports.
 *
 * components.json has always aliased `utils` at this path, but the file was
 * never created — nothing pulled in from the registry had needed it yet.
 *
 * twMerge on top of clsx, not just a join: it resolves conflicts by Tailwind's
 * own rules, so a `bg-foreground/10` handed in from a call site beats the
 * `bg-background` baked into a variant. Components in this project rely on that
 * — see the carousel control in components/ui/services-card.tsx, which restyles
 * the button's `outline` variant entirely from its className.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
