'use client'
import * as React from "react"
import { motion, useScroll } from "motion/react"
import type { UseScrollOptions } from "motion/react"
import { cn } from "@/lib/utils"

type TriggerMode = "load" | "in-view" | "scroll"

type Props = {
  d?: string
  d2?: string
  hasd2?: boolean
  stroke?: string
  strokeWidth?: number
  speed?: number
  delay?: number
  trigger?: TriggerMode
  inViewAmount?: number
  replay?: boolean
  viewBox?: string
  unit?: string
  wunit?: string
  height?: number | string
  width?: number | string
  preserveAspectRatio?: string
  style?: React.CSSProperties
  className?: string
  vectorEffect?: boolean
  useClipPath?: boolean
  clipPath?: React.ReactNode
  // Scroll-specific
  scrollTarget?: "page" | "element"
  scrollOffset?: UseScrollOptions["offset"]
  /** External progress value (0-1) for scroll trigger. If provided, overrides internal scroll tracking. */
  scrollProgress?: number
  /** Progress value (0-1) at which d2 starts animating. Default is 1 (d2 waits until d is complete). Set to 0.8 for d2 to start when d is 80% done. */
  d2StartAt?: number
}

export default function PathScrollRunner({
  d = "M25.6353 8.77485C25.0294 8.73504 20.5092 9.38103 14.7866 11.6085C10.5316 13.2648 7.73577 15.8767 6.10381 17.5565C3.9658 19.7572 2.73311 22.4891 1.90035 24.478C1.20516 26.1383 1.06637 29.0114 1.00313 33.6479C0.652068 59.3896 29.8773 67.4405 52.4223 65.9081C56.0053 65.6646 59.432 65.1577 62.7731 64.4047C117.729 52.0195 96.9952 -2.57437 45.4481 1.18517C34.7148 1.968 24.3117 4.55654 15.9355 11.6887C14.0104 13.328 11.2693 16.2316 9.56264 18.0065C8.39745 19.2183 7.6626 20.8066 6.66228 22.2319",
  d2 = "M25.6353 8.77485C25.0294 8.73504 20.5092 9.38103 14.7866 11.6085C10.5316 13.2648 7.73577 15.8767 6.10381 17.5565C3.9658 19.7572 2.73311 22.4891 1.90035 24.478C1.20516 26.1383 1.06637 29.0114 1.00313 33.6479C0.652068 59.3896 29.8773 67.4405 52.4223 65.9081C56.0053 65.6646 59.432 65.1577 62.7731 64.4047C117.729 52.0195 96.9952 -2.57437 45.4481 1.18517C34.7148 1.968 24.3117 4.55654 15.9355 11.6887C14.0104 13.328 11.2693 16.2316 9.56264 18.0065C8.39745 19.2183 7.6626 20.8066 6.66228 22.2319",
  stroke = "#87D4E9",
  strokeWidth = 8,
  speed = 2,
  delay = 0,
  trigger = "load",
  inViewAmount = 0.3,
  replay = false,
  height = 100,
  width = 100,
  preserveAspectRatio = "xMinYMin slice",
  style,
  className,
  hasd2 = false,
  clipPath,
  viewBox,
  scrollTarget = "element",
  scrollOffset = ["start end", "end start"],
  d2StartAt = 1,
  unit = "px",
  wunit = "px",
  scrollProgress,
  useClipPath = false,
  vectorEffect = true
}: Props) {
  const pathRef1 = React.useRef<SVGPathElement>(null)
  const pathRef2 = React.useRef<SVGPathElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [autoViewBox, setAutoViewBox] = React.useState<string | null>(null)
  const [totalLength1, setTotalLength1] = React.useState<number>(0)
  const [totalLength2, setTotalLength2] = React.useState<number>(0)
  const [dashOffset1, setDashOffset1] = React.useState<number>(0)
  const [dashOffset2, setDashOffset2] = React.useState<number>(0)

  // Element-based scroll progress (only used when scrollTarget="element")
  const scrollOptions: UseScrollOptions | undefined =
    trigger === "scroll" && scrollTarget === "element"
      ? { target: containerRef, offset: scrollOffset }
      : undefined
  const { scrollYProgress } = useScroll(scrollOptions)

  // Subscribe to scroll progress and update dash offsets directly
  React.useEffect(() => {
    if (trigger !== "scroll") return

    const updateFromProgress = (p: number) => {
      // d1 animates from 0 to d2StartAt
      // d2 animates from d2StartAt to 1
      if (totalLength1 > 0) {
        // Map progress [0, d2StartAt] to [0, 1] for d1
        const d1Progress = d2StartAt > 0 ? Math.min(1, p / d2StartAt) : 1
        setDashOffset1((1 - d1Progress) * totalLength1)
      }
      if (totalLength2 > 0) {
        // Map progress [d2StartAt, 1] to [0, 1] for d2
        const d2Range = 1 - d2StartAt
        let d2Progress = 0
        if (d2Range > 0) {
          d2Progress = Math.max(0, Math.min(1, (p - d2StartAt) / d2Range))
        } else if (p >= d2StartAt) {
          d2Progress = 1
        }
        setDashOffset2((1 - d2Progress) * totalLength2)
      }
    }

    // If external scrollProgress is provided, use it directly
    if (scrollProgress !== undefined) {
      updateFromProgress(scrollProgress)
      return
    }

    if (scrollTarget === "element") {
      // Use Motion's scrollYProgress
      const unsubscribe = scrollYProgress.on("change", updateFromProgress)
      // Initial value
      updateFromProgress(scrollYProgress.get())
      return unsubscribe
    } else {
      // Page scroll - manual listener
      const handleScroll = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop || 0
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
        const p = scrollHeight > 0 ? Math.min(1, Math.max(0, scrollTop / scrollHeight)) : 0
        updateFromProgress(p)
      }
      handleScroll()
      window.addEventListener("scroll", handleScroll, { passive: true })
      return () => window.removeEventListener("scroll", handleScroll)
    }
  }, [trigger, scrollTarget, scrollYProgress, totalLength1, totalLength2, scrollProgress, d2StartAt])

  const variants = {
    hidden: { pathLength: 0 },
    visible: {
      pathLength: 1,
      transition: {
        duration: Math.max(0.05, speed),
        delay: Math.max(0, delay),
      },
    },
  }

  const baseProps =
    trigger === "load"
      ? { initial: "hidden", animate: "visible" as const }
      : trigger === "in-view"
        ? { initial: "hidden", whileInView: "visible" as const }
        : {}

  const viewportProps =
    trigger === "in-view"
      ? { viewport: { amount: inViewAmount, once: !replay } }
      : {}

  // --- auto-fit viewBox if none provided ---
  React.useLayoutEffect(() => {
    const el = pathRef1.current
    if (!el) return
    if (viewBox && viewBox.trim().length > 0) return // user override

    try {
      const b = el.getBBox()
      const pad = 16
      const x = Math.floor(b.x - pad)
      const y = Math.floor(b.y - pad)
      const w = Math.max(1, Math.ceil(b.width + pad * 2))
      const h = Math.max(1, Math.ceil(b.height + pad * 2))
      setAutoViewBox(`${x} ${y} ${w} ${h}`)
    } catch {
      // fallback
      setAutoViewBox("0 0 100 100")
    }
  }, [d, viewBox])

  // --- measure path lengths for stroke-dash animation ---
  React.useLayoutEffect(() => {
    const el1 = pathRef1.current
    if (el1) {
      try {
        const len1 = el1.getTotalLength()
        setTotalLength1(len1)
        // Initialize dash offset to full length (hidden)
        if (trigger === "scroll") {
          setDashOffset1(len1)
        }
      } catch {
        setTotalLength1(0)
      }
    }
  }, [d, trigger])

  React.useLayoutEffect(() => {
    if (!hasd2) return
    const el2 = pathRef2.current
    if (el2) {
      try {
        const len2 = el2.getTotalLength()
        setTotalLength2(len2)
        if (trigger === "scroll") {
          setDashOffset2(len2)
        }
      } catch {
        setTotalLength2(0)
      }
    }
  }, [hasd2, d2, trigger])

  const resolvedViewBox =
    (viewBox && viewBox.trim().length > 0 ? viewBox : autoViewBox) ??
    "0 0 100 100"



  const resolvedWidth = typeof width === "number" ? `${width}${wunit}` : width
  const resolvedHeight = typeof height === "number" ? `${height}${unit}` : height

  return (
    <div
      ref={containerRef}
      className={cn("animated-path", className)}
      style={{
        ...style,
        width: resolvedWidth,
        height: resolvedHeight,
        display: "grid",
      }}
    >
      <motion.svg
        {...baseProps}
        {...viewportProps}
        viewBox={resolvedViewBox}
        preserveAspectRatio={preserveAspectRatio}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      >
        {useClipPath && (
          <defs>
            {clipPath}
          </defs>
        )}
        <motion.path
          ref={pathRef1}
          d={d}
          variants={trigger !== "scroll" ? variants : undefined}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
          strokeLinejoin="miter"
          fill="none"
          strokeDasharray={trigger === "scroll" ? totalLength1 : undefined}
          strokeDashoffset={trigger === "scroll" ? dashOffset1 : undefined}
          pathLength={trigger === "scroll" ? undefined : 1}
          vectorEffect={vectorEffect ? "non-scaling-stroke" : undefined}
        />
        {hasd2 && (
          <motion.path
            ref={pathRef2}
            d={d2}
            variants={trigger !== "scroll" ? variants : undefined}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
            strokeLinejoin="miter"
            fill="none"
            strokeDasharray={trigger === "scroll" ? totalLength2 : undefined}
            strokeDashoffset={trigger === "scroll" ? dashOffset2 : undefined}
            pathLength={trigger === "scroll" ? undefined : 1}
            vectorEffect={vectorEffect ? "non-scaling-stroke" : undefined}
          />
        )}
      </motion.svg>
    </div>
  )
}
