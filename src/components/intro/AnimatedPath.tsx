'use client'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as React from 'react'

import { cn } from '@/lib/utils'

gsap.registerPlugin(useGSAP, ScrollTrigger)

type TriggerMode = 'load' | 'in-view' | 'scroll'

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
  scrollTarget?: 'page' | 'element'
  /** External progress value (0-1) for scroll trigger. If provided, overrides internal scroll tracking. */
  scrollProgress?: number
  /** Progress value (0-1) at which d2 starts animating. Default is 1 (d2 waits until d is complete). Set to 0.8 for d2 to start when d is 80% done. */
  d2StartAt?: number
}

export default function PathScrollRunner({
  d = 'M25.6353 8.77485C25.0294 8.73504 20.5092 9.38103 14.7866 11.6085C10.5316 13.2648 7.73577 15.8767 6.10381 17.5565C3.9658 19.7572 2.73311 22.4891 1.90035 24.478C1.20516 26.1383 1.06637 29.0114 1.00313 33.6479C0.652068 59.3896 29.8773 67.4405 52.4223 65.9081C56.0053 65.6646 59.432 65.1577 62.7731 64.4047C117.729 52.0195 96.9952 -2.57437 45.4481 1.18517C34.7148 1.968 24.3117 4.55654 15.9355 11.6887C14.0104 13.328 11.2693 16.2316 9.56264 18.0065C8.39745 19.2183 7.6626 20.8066 6.66228 22.2319',
  d2 = 'M25.6353 8.77485C25.0294 8.73504 20.5092 9.38103 14.7866 11.6085C10.5316 13.2648 7.73577 15.8767 6.10381 17.5565C3.9658 19.7572 2.73311 22.4891 1.90035 24.478C1.20516 26.1383 1.06637 29.0114 1.00313 33.6479C0.652068 59.3896 29.8773 67.4405 52.4223 65.9081C56.0053 65.6646 59.432 65.1577 62.7731 64.4047C117.729 52.0195 96.9952 -2.57437 45.4481 1.18517C34.7148 1.968 24.3117 4.55654 15.9355 11.6887C14.0104 13.328 11.2693 16.2316 9.56264 18.0065C8.39745 19.2183 7.6626 20.8066 6.66228 22.2319',
  stroke = '#87D4E9',
  strokeWidth = 8,
  speed = 2,
  delay = 0,
  trigger = 'load',
  inViewAmount = 0.3,
  replay = false,
  height = 100,
  width = 100,
  preserveAspectRatio = 'xMinYMin slice',
  style,
  className,
  hasd2 = false,
  clipPath,
  viewBox,
  scrollTarget = 'element',
  d2StartAt = 1,
  unit = 'px',
  wunit = 'px',
  scrollProgress,
  useClipPath = false,
  vectorEffect = true,
}: Props) {
  const pathRef1 = React.useRef<SVGPathElement>(null)
  const pathRef2 = React.useRef<SVGPathElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [autoViewBox, setAutoViewBox] = React.useState<string | null>(null)
  const [isReady, setIsReady] = React.useState(false)

  // Auto-fit viewBox if none provided
  React.useLayoutEffect(() => {
    const el = pathRef1.current
    if (!el) return
    if (viewBox && viewBox.trim().length > 0) {
      setIsReady(true)
      return
    }

    try {
      const b = el.getBBox()
      const pad = 16
      const x = Math.floor(b.x - pad)
      const y = Math.floor(b.y - pad)
      const w = Math.max(1, Math.ceil(b.width + pad * 2))
      const h = Math.max(1, Math.ceil(b.height + pad * 2))
      setAutoViewBox(`${x} ${y} ${w} ${h}`)
    } catch {
      setAutoViewBox('0 0 100 100')
    }
    setIsReady(true)
  }, [d, viewBox])

  // GSAP animations
  useGSAP(
    () => {
      const path1 = pathRef1.current
      const path2 = pathRef2.current
      if (!path1) return

      // Set initial state - different dash patterns for scroll vs other triggers
      if (trigger === 'scroll') {
        gsap.set(path1, {
          strokeDasharray: '1 1',
          strokeDashoffset: 1,
        })

        if (path2 && hasd2) {
          gsap.set(path2, {
            strokeDasharray: '1 1',
            strokeDashoffset: 1,
          })
        }
      } else {
        gsap.set(path1, {
          strokeDasharray: 1,
          strokeDashoffset: 1,
        })

        if (path2 && hasd2) {
          gsap.set(path2, {
            strokeDasharray: 1,
            strokeDashoffset: 1,
          })
        }
      }

      if (trigger === 'load') {
        // Simple load animation
        gsap.to(path1, {
          strokeDasharray: 1,
          strokeDashoffset: 0,
          duration: speed,
          delay: delay,
          ease: 'none',
        })

        if (path2 && hasd2) {
          gsap.to(path2, {
            strokeDasharray: 1,
            strokeDashoffset: 0,
            duration: speed,
            delay: delay + (d2StartAt < 1 ? speed * d2StartAt : speed),
            ease: 'none',
          })
        }
      } else if (trigger === 'in-view') {
        // In-view animation
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: `top ${100 - inViewAmount * 100}%`,
          once: !replay,
          onEnter: () => {
            gsap.to(path1, {
              strokeDasharray: 1,
              strokeDashoffset: 0,
              duration: speed,
              delay: delay,
              ease: 'none',
            })

            if (path2 && hasd2) {
              gsap.to(path2, {
                strokeDasharray: 1,
                strokeDashoffset: 0,
                duration: speed,
                delay: delay + (d2StartAt < 1 ? speed * d2StartAt : speed),
                ease: 'none',
              })
            }
          },
        })
      } else if (trigger === 'scroll') {
        // Scroll-based animation
        if (scrollProgress !== undefined) {
          // External progress provided - use a ticker to update on every frame
          gsap.ticker.add(() => {
            const p = scrollProgress
            const d1Progress = d2StartAt > 0 ? Math.min(1, p / d2StartAt) : 1
            gsap.set(path1, {
              strokeDashoffset: 1 - d1Progress,
            })

            if (path2 && hasd2) {
              const d2Range = 1 - d2StartAt
              let d2Progress = 0
              if (d2Range > 0) {
                d2Progress = Math.max(0, Math.min(1, (p - d2StartAt) / d2Range))
              } else if (p >= d2StartAt) {
                d2Progress = 1
              }
              gsap.set(path2, {
                strokeDashoffset: 1 - d2Progress,
              })
            }
          })
          return () => {
            gsap.ticker.remove(() => {})
          }
        } else {
          // ScrollTrigger-based
          ScrollTrigger.create({
            trigger: scrollTarget === 'element' ? containerRef.current : 'body',
            start: scrollTarget === 'element' ? 'top bottom' : 'top top',
            end: scrollTarget === 'element' ? 'bottom top' : 'bottom bottom',
            scrub: true,
            onUpdate: (self) => {
              const p = self.progress
              const d1Progress = d2StartAt > 0 ? Math.min(1, p / d2StartAt) : 1
              gsap.set(path1, {
                strokeDashoffset: 1 - d1Progress,
              })

              if (path2 && hasd2) {
                const d2Range = 1 - d2StartAt
                let d2Progress = 0
                if (d2Range > 0) {
                  d2Progress = Math.max(0, Math.min(1, (p - d2StartAt) / d2Range))
                } else if (p >= d2StartAt) {
                  d2Progress = 1
                }
                gsap.set(path2, {
                  strokeDashoffset: 1 - d2Progress,
                })
              }
            },
          })
        }
      }
    },
    {
      dependencies: [
        trigger,
        scrollProgress,
        d2StartAt,
        hasd2,
        speed,
        delay,
        scrollTarget,
        inViewAmount,
        replay,
      ],
      scope: containerRef,
    }
  )
  const resolvedViewBox =
    (viewBox && viewBox.trim().length > 0 ? viewBox : autoViewBox) ?? '0 0 100 100'

  const resolvedWidth = typeof width === 'number' ? `${width}${wunit}` : width
  const resolvedHeight = typeof height === 'number' ? `${height}${unit}` : height

  return (
    <div
      ref={containerRef}
      className={cn('animated-path', className)}
      style={{
        ...style,
        width: resolvedWidth,
        height: resolvedHeight,
        display: 'block',
        overflow: 'visible',
        visibility: isReady ? 'visible' : 'hidden',
      }}
    >
      <svg
        viewBox={resolvedViewBox}
        preserveAspectRatio={preserveAspectRatio}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          overflow: 'visible',
        }}
      >
        {useClipPath && <defs>{clipPath}</defs>}
        <path
          ref={pathRef1}
          d={d}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
          strokeLinejoin="miter"
          fill="none"
          pathLength="1"
          style={{ strokeDasharray: '1 1', strokeDashoffset: '1' }}
          vectorEffect={vectorEffect ? 'non-scaling-stroke' : undefined}
        />
        {hasd2 && (
          <path
            ref={pathRef2}
            d={d2}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
            strokeLinejoin="miter"
            fill="none"
            pathLength="1"
            style={{ strokeDasharray: '1 1', strokeDashoffset: '1' }}
            vectorEffect={vectorEffect ? 'non-scaling-stroke' : undefined}
          />
        )}
      </svg>
    </div>
  )
}
