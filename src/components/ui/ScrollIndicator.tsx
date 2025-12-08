// Animated scroll indicator with mouse-following dot that bounces when idle

'use client'

import { easeInOut, easeOut, motion, useAnimationControls } from 'framer-motion'
import { type CSSProperties, useEffect, useMemo } from 'react'

interface ScrollIndicatorProps {
  borderColor?: string
  borderOpacity?: number
  dotColor: string
  pillWidth?: number
  pillHeight?: number
  dotSize?: number
  borderWidth?: number
  borderRadius?: number
  animationSpeed?: number
  scrollType?: 'section' | 'link'
  sectionName?: string
  customLink?: string
  animationPreset?: 'default' | 'elegant-chevrons' | 'minimalist-scroll'
  chevronColor?: string
  chevronSize?: number
  chevronGap?: number
  minimalistColor?: string
  minimalistFontSize?: number
  minimalistSpeed?: number
  style?: CSSProperties
  onScrollToSection?: (id: string) => void
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function ScrollIndicator(props: ScrollIndicatorProps) {
  const {
    borderColor,
    borderOpacity,
    dotColor,
    pillWidth,
    pillHeight,
    dotSize,
    borderWidth,
    borderRadius,
    animationSpeed,
    scrollType,
    sectionName,
    customLink,
    animationPreset,
    chevronColor,
    chevronSize,
    chevronGap,
    minimalistColor,
    minimalistFontSize,
    minimalistSpeed,
    onScrollToSection,
  } = props

  // Resolve optional props with sensible defaults so visuals always render
  const resolvedBorderColor = borderColor ?? '#ffffff'
  const resolvedBorderOpacity = borderOpacity ?? 0.8
  const resolvedBorderWidth = borderWidth ?? 2
  const resolvedBorderRadius = borderRadius ?? 9999
  const resolvedPillWidth = pillWidth ?? 24
  const resolvedPillHeight = pillHeight ?? 40
  const resolvedDotSize = dotSize ?? 8
  const resolvedAnimationSpeed = animationSpeed ?? 1.8

  const controls = useAnimationControls()
  const elegantChevronControls = useAnimationControls()
  const elegantChevronGlowControls = useAnimationControls()
  const minimalistLabelControls = useAnimationControls()
  const minimalistLineControls = useAnimationControls()

  // Define animation presets (memoized to satisfy exhaustive-deps and avoid new refs each render)
  const animationPresets = useMemo(
    () => ({
      default: {
        y: [
          -(resolvedPillHeight / 2 - resolvedDotSize - 4),
          resolvedPillHeight / 2 - resolvedDotSize - 4,
        ],
        transition: {
          duration: resolvedAnimationSpeed,
          repeat: Infinity,
          repeatType: 'reverse' as const,
          ease: easeInOut,
        },
      },
      'elegant-chevrons': {
        y: [0, 0, 14, 14, 14, 14, 0],
        opacity: [0, 1, 1, 0.6, 0.85, 0, 0],
        transition: {
          duration: 1.8,
          repeat: Infinity,
          repeatType: 'loop' as const,
          ease: easeInOut,
          times: [0, 0.167, 0.5, 0.583, 0.667, 0.833, 1],
        },
      },
      'elegant-chevrons-glow': {
        filter: [
          'drop-shadow(0 0 0px rgba(255,255,255,0))',
          'drop-shadow(0 0 2px rgba(255,255,255,0.35))',
          'drop-shadow(0 0 2px rgba(255,255,255,0.2))',
          'drop-shadow(0 0 4px rgba(255,255,255,0.4))',
          'drop-shadow(0 0 4px rgba(255,255,255,0.4))',
          'drop-shadow(0 0 0px rgba(255,255,255,0))',
          'drop-shadow(0 0 0px rgba(255,255,255,0))',
        ],
        transition: {
          duration: 1.8,
          repeat: Infinity,
          repeatType: 'loop' as const,
          ease: easeInOut,
          times: [0, 0.167, 0.5, 0.583, 0.667, 0.833, 1],
        },
      },
      'minimalist-scroll': {
        label: {
          y: [0, 0, 6, 6, 6],
          opacity: [1, 1, 1, 0, 0],
          transition: {
            duration: 2.5,
            repeat: Infinity,
            repeatType: 'loop' as const,
            ease: easeInOut,
            times: [0, 0.4, 0.6, 0.8, 1],
          },
        },
        line: {
          opacity: [1, 1, 1, 1, 0],
          transition: {
            duration: 2.5,
            repeat: Infinity,
            repeatType: 'loop' as const,
            ease: easeOut,
            times: [0, 0.6, 0.8, 0.8, 1],
          },
        },
      },
    }),
    [resolvedPillHeight, resolvedDotSize, resolvedAnimationSpeed]
  )

  useEffect(() => {
    if (animationPreset === 'default') {
      controls.start(animationPresets.default)
    } else if (animationPreset === 'elegant-chevrons') {
      elegantChevronControls.start(animationPresets['elegant-chevrons'])
      elegantChevronGlowControls.start(animationPresets['elegant-chevrons-glow'])
    } else if (animationPreset === 'minimalist-scroll') {
      minimalistLabelControls.start(animationPresets['minimalist-scroll'].label)
      minimalistLineControls.start(animationPresets['minimalist-scroll'].line)
    }
  }, [
    controls,
    elegantChevronControls,
    elegantChevronGlowControls,
    minimalistLabelControls,
    minimalistLineControls,
    animationPreset,
    animationPresets,
  ])

  const handleClick = () => {
    if (scrollType === 'section' && sectionName) {
      if (onScrollToSection) {
        onScrollToSection(sectionName)
        return
      }
      const element = document.getElementById(sectionName)
      if (!element) return
      element.scrollIntoView({ behavior: 'smooth' })
    } else if (scrollType === 'link' && customLink) {
      window.location.href = customLink
    }
  }

  const renderDoubleChevron = () => {
    // Map size (1-10) to scale values (0.5-1.4)
    const scaleMap = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4]
    const scale = scaleMap[(chevronSize ?? 0) - 1] || 0.8

    // Map gap (1-10) to pixel values
    const gapMap = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12]
    const gap = gapMap[(chevronGap ?? 0) - 1] || 5

    // Scale drift distance proportionally with size
    const driftDistance = 14 * (scale / 0.8)

    return (
      <div
        onClick={handleClick}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          cursor: 'pointer',
        }}
      >
        <motion.div
          animate={{
            ...animationPresets['elegant-chevrons-glow'],
            filter: [
              'drop-shadow(0 0 0px rgba(255,255,255,0))',
              `drop-shadow(0 0 ${2 * scale}px rgba(255,255,255,0.35))`,
              `drop-shadow(0 0 ${2 * scale}px rgba(255,255,255,0.2))`,
              `drop-shadow(0 0 ${4 * scale}px rgba(255,255,255,0.4))`,
              `drop-shadow(0 0 ${4 * scale}px rgba(255,255,255,0.4))`,
              'drop-shadow(0 0 0px rgba(255,255,255,0))',
              'drop-shadow(0 0 0px rgba(255,255,255,0))',
            ],
          }}
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: `${gap}px`,
          }}
        >
          {/* Upper chevron */}
          <motion.svg
            animate={{
              y: [0, 0, driftDistance, driftDistance, driftDistance, driftDistance, 0],
              opacity: [0, 1, 1, 0.6, 0.85, 0, 0],
              transition: {
                duration: 1.8,
                repeat: Infinity,
                repeatType: 'loop' as const,
                ease: easeInOut,
                times: [0, 0.167, 0.5, 0.583, 0.667, 0.833, 1],
              },
            }}
            width={18 * scale}
            height={9 * scale}
            viewBox="0 0 18 9"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              position: 'relative',
            }}
          >
            <path
              d="M1.5 1.5L9 7.5L16.5 1.5"
              stroke={chevronColor}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
          {/* Lower chevron */}
          <motion.svg
            animate={{
              y: [0, 0, driftDistance, driftDistance, driftDistance, driftDistance, 0],
              opacity: [0, 1, 1, 0.6, 0.85, 0, 0],
              transition: {
                duration: 1.8,
                repeat: Infinity,
                repeatType: 'loop' as const,
                ease: easeInOut,
                times: [0, 0.167, 0.5, 0.583, 0.667, 0.833, 1],
              },
            }}
            width={18 * scale}
            height={9 * scale}
            viewBox="0 0 18 9"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              position: 'relative',
            }}
          >
            <path
              d="M1.5 1.5L9 7.5L16.5 1.5"
              stroke={chevronColor}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        </motion.div>
      </div>
    )
  }

  const renderMinimalistScroll = () => {
    // Map font size (1-10) to pixel values
    const fontSizeMap = [8, 9, 10, 11, 12, 13, 14, 16, 18, 20]
    const fontSize = fontSizeMap[(minimalistFontSize ?? 0) - 1] || 10

    // Map speed (1-10) to duration values
    const speedMap = [4, 3.5, 3, 2.5, 2, 1.8, 1.5, 1.2, 1, 0.8]
    const duration = speedMap[(minimalistSpeed ?? 0) - 1] || 2

    return (
      <div
        onClick={handleClick}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          cursor: 'pointer',
        }}
      >
        <motion.div
          animate={{
            y: [0, 0, 6, 6, 6],
            opacity: [1, 1, 1, 0, 0],
            transition: {
              duration: duration,
              repeat: Infinity,
              repeatType: 'loop' as const,
              ease: easeInOut,
              times: [0, 0.4, 0.6, 0.8, 1],
            },
          }}
          style={{
            fontSize: `${fontSize}px`,
            fontWeight: 'bold',
            letterSpacing: '2px',
            color: minimalistColor,
            marginBottom: '8px',
          }}
        >
          SCROLL
        </motion.div>
        <motion.div
          animate={{
            opacity: [1, 1, 1, 1, 0],
            transition: {
              duration: duration,
              repeat: Infinity,
              repeatType: 'loop' as const,
              ease: easeOut,
              times: [0, 0.6, 0.8, 0.8, 1],
            },
          }}
          style={{
            width: '1px',
            height: '20px',
            backgroundColor: minimalistColor,
          }}
        />
      </div>
    )
  }

  const renderDefault = () => (
    <div
      onClick={handleClick}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          width: resolvedPillWidth,
          height: resolvedPillHeight,
          border: `${resolvedBorderWidth}px solid ${resolvedBorderColor}`,
          opacity: resolvedBorderOpacity,
          borderRadius: resolvedBorderRadius,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <motion.div
          animate={controls}
          style={{
            width: resolvedDotSize,
            height: resolvedDotSize,
            borderRadius: '50%',
            backgroundColor: dotColor,
            position: 'absolute',
          }}
        />
      </div>
    </div>
  )

  // Render based on animation preset
  switch (animationPreset) {
    case 'elegant-chevrons':
      return renderDoubleChevron()
    case 'minimalist-scroll':
      return renderMinimalistScroll()
    default:
      return renderDefault()
  }
}
