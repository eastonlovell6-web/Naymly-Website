'use client'

import * as React from 'react'
/*
  `motion/react`, not `framer-motion`. They are the same library under two
  names — motion is the current release line, framer-motion the legacy one —
  and `motion` is already a dependency here for other components. Importing the
  legacy name would put a second full copy of the animation runtime in the
  bundle to get an identical `motion` and `useInView`.
*/
import { motion, useInView, useReducedMotion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from 'embla-carousel-react'
import { Button } from '@/components/ui/button'

// --- Carousel Context ---
/*
  Derived from the hook's own return type rather than written as
  `EmblaCarouselType | undefined`. embla-carousel-react 8 does not re-export
  `EmblaCarouselType` — that name lives in the `embla-carousel` core package,
  which is only here as a transitive dependency and so is not ours to import.
  UseEmblaCarouselType[1] is the same type by construction and stays correct if
  the library changes it.
*/
type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]
type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: 'horizontal' | 'vertical'
  setApi?: (api: CarouselApi) => void
}
type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)
  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />')
  }
  return context
}

// --- Main Carousel Component ---
const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = 'horizontal',
      opts,
      setApi,
      plugins,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === 'horizontal' ? 'x' : 'y',
      },
      plugins,
    )
    const [canScrollPrev, setCanScrollPrev] = React.useState(false)
    const [canScrollNext, setCanScrollNext] = React.useState(false)

    const onSelect = React.useCallback((api: CarouselApi) => {
      if (!api) return
      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
    }, [])

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev()
    }, [api])

    const scrollNext = React.useCallback(() => {
      api?.scrollNext()
    }, [api])

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          scrollPrev()
        } else if (event.key === 'ArrowRight') {
          event.preventDefault()
          scrollNext()
        }
      },
      [scrollPrev, scrollNext],
    )

    React.useEffect(() => {
      if (!api || !setApi) return
      setApi(api)
    }, [api, setApi])

    React.useEffect(() => {
      if (!api) return
      onSelect(api)
      api.on('reInit', onSelect)
      api.on('select', onSelect)
      return () => {
        api?.off('select', onSelect)
      }
    }, [api, onSelect])

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
          opts,
          orientation,
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn('relative', className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    )
  },
)
Carousel.displayName = 'Carousel'

// --- Carousel Content ---
const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel()
  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div
        ref={ref}
        className={cn(
          'flex',
          orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col',
          className,
        )}
        {...props}
      />
    </div>
  )
})
CarouselContent.displayName = 'CarouselContent'

// --- Carousel Item ---
const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel()
  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        'min-w-0 shrink-0 grow-0 basis-full',
        orientation === 'horizontal' ? 'pl-4' : 'pt-4',
        className,
      )}
      {...props}
    />
  )
})
CarouselItem.displayName = 'CarouselItem'

// --- Carousel Controls ---
const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = 'outline', size = 'icon', ...props }, ref) => {
  const { scrollNext, canScrollNext } = useCarousel()
  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        'absolute h-10 w-10 rounded-full',
        'right-2 top-1/2 -translate-y-1/2',
        className,
      )}
      onClick={scrollNext}
      disabled={!canScrollNext}
      {...props}
    >
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
})
CarouselNext.displayName = 'CarouselNext'

// --- Service Card & Carousel Section ---
export interface Service {
  number: string
  title: string
  description: string
  icon: React.ElementType
  gradient: string
}

// Sub-component for individual cards
const ServiceCard = ({
  service,
  index,
}: {
  service: Service
  index: number
}) => {
  /*
    The page's other entrances are CSS transitions, so the global
    prefers-reduced-motion block in globals.css collapses them for free. This
    one is driven from JavaScript and that block cannot reach it — without
    asking, a reduced-motion visitor still gets four cards flying up the screen.
    Asked here rather than once in the parent because the answer is only needed
    where the variants are defined.
  */
  const reduce = useReducedMotion()

  const cardVariants = {
    hidden: { opacity: reduce ? 1 : 0, y: reduce ? 0 : 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduce ? 0 : 0.5,
        delay: reduce ? 0 : index * 0.1,
      },
    },
  }

  return (
    <motion.div
      variants={cardVariants}
      className={cn(
        /*
          `motion-reveal` carries no styling. It is the hook the <noscript>
          block in app/layout.tsx targets: `hidden` renders as an inline
          opacity:0 on the server, so with scripting off these cards would be
          permanently invisible — the same failure the .reveal class already
          guards against, and the same fix.
        */
        'motion-reveal relative flex h-[450px] w-full flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-r p-8',
        service.gradient,
      )}
    >
      {/* Card Content */}
      <div className="z-10 flex flex-col items-start text-left">
        <span className="mb-8 font-mono text-sm text-foreground/50">
          ( {service.number} )
        </span>
        <service.icon
          aria-hidden="true"
          className="mb-auto h-12 w-12 text-foreground"
        />
      </div>
      <div className="z-10">
        <h3 className="mb-2 text-lg font-semibold uppercase tracking-wider">
          {service.title}
        </h3>
        <p className="text-sm text-foreground/70">{service.description}</p>
      </div>

      {/* Subtle overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent"></div>
    </motion.div>
  )
}

// Main exportable component
export const ServiceCarousel = ({ services }: { services: Service[] }) => {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <Carousel
        ref={ref}
        opts={{
          align: 'start',
          loop: true,
        }}
        className="relative"
      >
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          transition={{ staggerChildren: 0.1 }}
        >
          <CarouselContent>
            {services.map((service, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <ServiceCard service={service} index={index} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </motion.div>
        {/*
          `disabled:hidden` rather than letting the control sit there greyed
          out. Embla turns looping off when every slide already fits, so at a
          width where the whole set is on screen this button can do nothing —
          and a 50%-opacity arrow parked over the last card reads as something
          broken rather than as something unavailable. It comes back on its own
          at narrower widths, and at any number of services that overflow.
        */}
        <CarouselNext className="border-0 bg-foreground/10 text-foreground hover:bg-foreground/20 disabled:hidden" />
      </Carousel>
    </div>
  )
}
