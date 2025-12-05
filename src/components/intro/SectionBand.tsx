import { useRef, useMemo, useEffect } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

interface Props {
  tint?: string
  minHeight?: number
  maxHeight?: number
  rotate?: boolean
  scrollStart?: number
  scrollEnd?: number
  color?: string[]
  reverse?: boolean
  autoAnimate?: boolean
  speed?: number
  amplitude?: number
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 100
 */
export default function SectionBand(props: Props) {
  const {
    tint = "rgba(1, 29, 33, 1)",
    minHeight = 2,
    maxHeight = 80,
    rotate = false,
    scrollStart = 0,
    scrollEnd = 0.5,
    reverse = false,
    autoAnimate = false,
    speed = 0.1,
    amplitude = 40,
  } = props

  const containerRef = useRef<HTMLDivElement>(null)
  const bandsRef = useRef<HTMLDivElement[]>([])
  const mouseOffsetRef = useRef(0)
  const timeRef = useRef(0)
  const mouseTargetRef = useRef(0)
  const rectRef = useRef<DOMRect | null>(null)
  const containerHeightRef = useRef(0)

  // Create 6 bands with different tint opacities
  const bands = useMemo(
    () => {
      const baseBands = [
        { opacity: 0.9 },
        { opacity: 0.8 },
        { opacity: 0.6 },
        { opacity: 0.4 },
        { opacity: 0.2 },
        { opacity: 0.05 },
      ]
      return reverse ? [...baseBands].reverse() : baseBands
    },
    [reverse]
  )

  const colors = useMemo(
    () =>
      props.color || [
        "#364E5D",
        "#324B59",
        "#475658",
        "#646A60",
        "#8D887D",
        "#9D95A4",
        "#9C97BD",
        "#BDBBFF",
      ],
    [props.color]
  )

  const numStops = colors.length
  const step = useMemo(() => (numStops > 1 ? 100 / (numStops - 1) : 0), [numStops])

  const bandHeightRef = useRef(reverse ? minHeight : maxHeight)

  // Scroll-based height animation using scroll event (no forced reflows)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let rafId: number
    let viewportHeight = window.innerHeight

    // Cache container height on resize only
    const updateCachedValues = () => {
      containerHeightRef.current = container.offsetHeight
      viewportHeight = window.innerHeight
    }
    updateCachedValues()

    const updateHeight = () => {
      // Use scrollY + offsetTop to avoid getBoundingClientRect reflow
      const containerTop = container.offsetTop
      const scrollY = window.scrollY
      const elementTop = containerTop - scrollY

      const totalRange = viewportHeight + containerHeightRef.current
      const distanceScrolled = viewportHeight - elementTop
      const rawProgress = distanceScrolled / totalRange

      // Map to scrollStart/scrollEnd range
      const normalizedProgress = Math.min(1, Math.max(0, (rawProgress - scrollStart) / (scrollEnd - scrollStart)))
      const eased = normalizedProgress * normalizedProgress * (3 - 2 * normalizedProgress)
      const targetHeight = reverse
        ? minHeight + eased * (maxHeight - minHeight)
        : maxHeight - eased * (maxHeight - minHeight)

      // Set height directly for smooth scroll-linked animation
      bandHeightRef.current = targetHeight
      bandsRef.current.forEach((band) => {
        if (band) band.style.height = `${targetHeight}px`
      })
    }

    const onScroll = () => {
      // Debounce with rAF to batch updates
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(updateHeight)
    }

    // Initial update
    updateHeight()

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', updateCachedValues, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', updateCachedValues)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [scrollStart, scrollEnd, minHeight, maxHeight, reverse])

  // Auto-animate ticker for gradient movement - updates DOM directly
  useGSAP(() => {
    if (!autoAnimate) return

    const updateGradient = () => {
      timeRef.current += 1 / 60

      // Smooth mouse offset
      const target = mouseTargetRef.current
      mouseOffsetRef.current += (target - mouseOffsetRef.current) * 0.1

      // Calculate auto offset
      const autoOffset = Math.sin(timeRef.current * speed) * amplitude

      // Update CSS custom properties directly on DOM
      bandsRef.current.forEach((band) => {
        if (!band) return
        colors.forEach((_, i) => {
          const pos = Math.max(0, Math.min(100, i * step + mouseOffsetRef.current + autoOffset))
          band.style.setProperty(`--stop${i}`, `${pos}%`)
        })
      })
    }

    gsap.ticker.add(updateGradient)

    return () => {
      gsap.ticker.remove(updateGradient)
    }
  }, { scope: containerRef, dependencies: [autoAnimate, colors, step, speed, amplitude] })

  // Static stop positions for initial render (auto-animate updates via DOM)
  const stopPositions = useMemo(
    () => colors.map((_, i) => Math.max(0, Math.min(100, i * step))),
    [colors, step]
  )

  const onMouseMove = (e: React.MouseEvent) => {
    if (!rectRef.current) {
      rectRef.current = e.currentTarget.getBoundingClientRect()
    }
    const x = ((e.clientX - rectRef.current.left) / rectRef.current.width) * 100
    mouseTargetRef.current = (x - 50) * 0.5
  }

  const onMouseLeave = () => {
    mouseTargetRef.current = 0
  }

  if (numStops < 2) {
    const gradientBg = numStops === 1 ? colors[0] : "transparent"
    return (
      <div
        ref={containerRef}
        style={{
          width: "100%",
          transform: rotate ? "rotate(180deg)" : undefined,
        }}
      >
        {bands.map((band, index) => (
          <div
            key={index}
            ref={(el) => { if (el) bandsRef.current[index] = el }}
            style={{
              position: "relative",
              width: "100%",
              background: gradientBg,
              height: reverse ? minHeight : maxHeight,
            }}
          >
            <span
              style={{
                position: "absolute",
                inset: 0,
                display: "block",
                background: tint,
                opacity: band.opacity,
              }}
            />
          </div>
        ))}
      </div>
    )
  }

  const customProperties = stopPositions.reduce(
    (acc, pos, i) => {
      acc[`--stop${i}`] = `${pos}%`
      return acc
    },
    {} as Record<string, string>
  )

  const transitionValue = stopPositions
    .map((_, i) => `--stop${i} 1s ease-out`)
    .join(", ")

  const gradientBg = `linear-gradient(90deg, ${colors.map((color, i) => `${color} var(--stop${i})`).join(", ")})`

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        transform: rotate ? "rotate(180deg)" : undefined,
      }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {bands.map((band, index) => (
        <div
          key={index}
          ref={(el) => { if (el) bandsRef.current[index] = el }}
          style={{
            position: "relative",
            width: "100%",
            background: gradientBg,
            height: reverse ? minHeight : maxHeight,
            ...customProperties,
            transition: transitionValue,
          }}
        >
          <span
            style={{
              position: "absolute",
              inset: 0,
              display: "block",
              background: tint,
              opacity: band.opacity,
            }}
          />
        </div>
      ))}
    </div>
  )
}
