import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ')
}

const glassButtonVariants = cva(
  'relative isolate cursor-pointer rounded-full transition-all',
  {
    variants: {
      size: {
        default: 'text-base font-semibold',
        sm: 'text-sm font-semibold',
        lg: 'text-lg font-semibold',
        /*
          Same type and height as default, wider box. It exists as its own size
          rather than a padding class passed in from the hero because the
          padding belongs to the variants: cn here is a plain join with no
          conflict resolution, so a px-16 handed to the label would ship
          alongside default's px-8 and leave which one wins to stylesheet order.
        */
        wide: 'text-base font-semibold',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

const glassButtonTextVariants = cva(
  'glass-button-text relative block select-none tracking-tight',
  {
    variants: {
      size: {
        default: 'px-8 py-3.5',
        sm: 'px-5 py-2',
        lg: 'px-10 py-4',
        /*
          py-3.5 keeps the 52px height of default; the horizontal padding is
          doubled. On the narrowest phones that still leaves the pill inside the
          hero's px-5 gutter — the label is about 130px, so the box lands near
          258px against a 320px content width.
        */
        wide: 'px-16 py-3.5',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

type GlassButtonOwnProps = VariantProps<typeof glassButtonVariants> & {
  className?: string
  /** Classes for the inner label, which is what actually carries the padding. */
  contentClassName?: string
  children?: React.ReactNode
}

/*
  Renders an <a> when given an href and a <button> otherwise. The upstream
  component is button-only, and both hero CTAs are links to anchors on the page
  — wrapping this in an <a> instead is not an option, since a <button> inside a
  link is invalid HTML and browsers disagree on which of the two gets the click.
*/
export type GlassButtonProps = GlassButtonOwnProps &
  (
    | ({ href: string } & Omit<
        React.AnchorHTMLAttributes<HTMLAnchorElement>,
        keyof GlassButtonOwnProps
      >)
    | ({ href?: never } & Omit<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        keyof GlassButtonOwnProps
      >)
  )

const GlassButton = React.forwardRef<
  HTMLAnchorElement | HTMLButtonElement,
  GlassButtonProps
>(({ className, children, size, contentClassName, ...props }, ref) => {
  const surfaceClassName = cn('glass-button', glassButtonVariants({ size }))
  const label = (
    <span className={cn(glassButtonTextVariants({ size }), contentClassName)}>
      {children}
    </span>
  )

  return (
    <div className={cn('glass-button-wrap rounded-full', className)}>
      {props.href !== undefined ? (
        <a
          className={surfaceClassName}
          ref={ref as React.Ref<HTMLAnchorElement>}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {label}
        </a>
      ) : (
        <button
          className={surfaceClassName}
          ref={ref as React.Ref<HTMLButtonElement>}
          {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {label}
        </button>
      )}
      {/*
        The cast shadow, a sibling behind the surface rather than a box-shadow
        on it, so it can be blurred and offset independently on hover without
        touching the specular edges that make the surface read as glass.
      */}
      <div className="glass-button-shadow rounded-full" aria-hidden="true" />
    </div>
  )
})
GlassButton.displayName = 'GlassButton'

export { GlassButton, glassButtonVariants }
