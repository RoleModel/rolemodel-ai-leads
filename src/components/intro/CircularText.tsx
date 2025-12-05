// CircularText.tsx
import * as React from "react"
import { motion, useAnimation } from "motion/react"

type HoverMode = "none" | "speedUp" | "slowDown" | "pause" | "goBonkers"
type Orientation = "outward" | "inward"
type Align = "start" | "center" | "end"

type FontLike = {
  fontSize?: number | string
  lineHeight?: number | string
  fontWeight?: number | string
  fontFamily?: string
  fontStyle?: string
  letterSpacing?: number | string
}

const styleFromFont = (f?: FontLike): React.CSSProperties => ({
  fontSize: f?.fontSize,
  lineHeight: f?.lineHeight,
  fontWeight: f?.fontWeight,
  fontFamily: f?.fontFamily,
  fontStyle: f?.fontStyle,
  letterSpacing: f?.letterSpacing,
})

/** 0° at top; increases clockwise (SVG-friendly for circular headings) */
function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg - 90) * (Math.PI / 180)
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}
const norm = (a: number) => ((a % 360) + 360) % 360

/**
 * Predictable arc builder:
 * - Honors `clockwise`
 * - If start==end → draws ~full circle (359.999°) in chosen direction
 * - Clamps flags correctly
 */
function arcPathFromStartEnd(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
  clockwise: boolean
) {
  const s = norm(startDeg)
  const e = norm(endDeg)

  // clockwise delta in [0,360)
  let cwDelta = e - s
  if (cwDelta < 0) cwDelta += 360

  // choose delta by direction
  let delta = clockwise ? cwDelta : cwDelta - 360

  // full circle case → use ~360 to avoid SVG-arc full-circle limitation
  if (cwDelta === 0) delta = clockwise ? 359.999 : -359.999

  const sweep = clockwise ? 1 : 0
  const large = Math.abs(delta) > 180 ? 1 : 0
  const endFinal = s + delta

  const start = polarToCartesian(cx, cy, r, s)
  const end = polarToCartesian(cx, cy, r, endFinal)

  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} ${sweep} ${end.x} ${end.y}`
}

export default function CircularText(props: {
  text?: string
  size?: number
  radius?: number
  startAngle?: number
  endAngle?: number
  clockwise?: boolean
  orientation?: Orientation
  align?: Align
  backgroundColor?: string
  border?: string

  /** Framer Font control (same object you pass to TextHighlight) */
  font?: FontLike

  /** Optional per-prop overrides (win over font.*) */
  fontWeight?: number | string
  fontSize?: number | string
  letterSpacing?: number | string

  fill?: string

  /** Spin */
  spinDuration?: number // seconds; 0 disables spin
  hover?: HoverMode
  speedSlow?: number
  speedFast?: number
  speedBonkers?: number

  className?: string
  style?: React.CSSProperties
}) {
  const {
    text = "Explore • Craft • Ship",
    size = 320,
    radius = 130,
    startAngle = -90,
    endAngle = 20,
    clockwise = true,
    orientation = "outward",
    align = "start",

    font = {
      fontSize: 56,
      lineHeight: "1.1em",
      fontWeight: 700,
      fontFamily: "DM Sans, system-ui, sans-serif",
    },
    fontWeight,
    fontSize,
    letterSpacing,
    backgroundColor,
    border = "solid 1px transparent",

    fill = "#2E66AF",

    spinDuration = 0,
    hover = "none",
    speedSlow = 40,
    speedFast = 5,
    speedBonkers = 1,

    className,
    style,
    ...rest
  } = props

  const id = React.useId()
  const pathId = `arc-${id}`

  const cx = size / 2
  const cy = size / 2
  const r = Math.max(4, Math.min(Number(radius) || 0, size / 2 - 2))

  const d = React.useMemo(
    () => arcPathFromStartEnd(cx, cy, r, startAngle, endAngle, clockwise),
    [cx, cy, r, startAngle, endAngle, clockwise]
  )

  // Align mapping
  const textAnchor: "start" | "middle" | "end" =
    align === "center" ? "middle" : (align as "start" | "end")
  const startOffset =
    align === "start" ? "0%" : align === "center" ? "50%" : "100%"

  // Spin controls
  const controls = useAnimation()
  React.useEffect(() => {
    if (!spinDuration || spinDuration <= 0) {
      controls.stop()
      return
    }
    controls.start({
      rotate: [0, 360],
      transition: {
        duration: spinDuration,
        ease: "linear",
        repeat: Infinity,
      },
    })
  }, [spinDuration, controls, text, d])

  const speedMap: Record<HoverMode, number> = {
    none: spinDuration || 1,
    slowDown: speedSlow,
    speedUp: speedFast,
    pause: spinDuration || 1,
    goBonkers: speedBonkers,
  }

  const onEnter = () => {
    if (!spinDuration || hover === "none") return
    if (hover === "pause") {
      controls.stop()
      return
    }
    controls.start({
      rotate: [0, 360],
      transition: {
        duration: speedMap[hover],
        ease: "linear",
        repeat: Infinity,
      },
    })
  }
  const onLeave = () => {
    if (!spinDuration) return
    controls.start({
      rotate: [0, 360],
      transition: {
        duration: spinDuration,
        ease: "linear",
        repeat: Infinity,
      },
    })
  }

  // Flip glyphs inward if needed (doesn't affect arc math)
  const inwardFlip =
    orientation === "inward"
      ? { transform: `scale(1,-1)`, transformOrigin: `${cx}px ${cy}px` }
      : {}
  const isSet = (v: string | number | undefined | null) => v !== undefined && v !== null && v !== ""
  const mergedFontStyle: React.CSSProperties = {
    ...styleFromFont(font),
    ...(isSet(fontSize) ? { fontSize } : null),
    ...(isSet(fontWeight) ? { fontWeight } : null),
    ...(isSet(letterSpacing) ? { letterSpacing } : null),
  }

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={{
        display: "block",
        ...style,
        backgroundColor: backgroundColor,
        border: border,
        borderRadius: 9999,
      }}
      animate={controls}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      {...rest}
    >
      <defs>
        <path id={pathId} d={d} fill="none" />
      </defs>

      <g style={inwardFlip as React.CSSProperties}>
        <text
          style={mergedFontStyle}
          fill={fill}
          textAnchor={textAnchor}
          dominantBaseline="alphabetic"
        >
          <textPath
            href={`#${pathId}`}
            startOffset={startOffset}
            method="align"
            spacing="auto"
          >
            {text}
          </textPath>
        </text>
      </g>
    </motion.svg>
  )
}
