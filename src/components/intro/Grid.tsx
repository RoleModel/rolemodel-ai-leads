'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface GridProps {
  rowSize?: number
  dotMin?: number
  dotMax?: number
  mouseRadius?: number
  hoverColor?: string
  baseColor?: string
  accentColor?: string
  className?: string
  style?: React.CSSProperties
}

// Helper to check if we're in dark mode
function isDarkMode(): boolean {
  // Check data-theme-mode attribute first
  const themeMode = document.documentElement.getAttribute('data-theme-mode')
  if (themeMode === 'dark') return true
  if (themeMode === 'light') return false
  // Fall back to system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

// Parse light-dark() with balanced parentheses support
function parseLightDark(value: string): { light: string; dark: string } | null {
  if (!value.startsWith('light-dark(')) return null

  // Find the comma that separates light and dark values (accounting for nested parens)
  const inner = value.slice(11, -1) // Remove "light-dark(" and final ")"
  let depth = 0
  let commaIndex = -1

  for (let i = 0; i < inner.length; i++) {
    const char = inner[i]
    if (char === '(') depth++
    else if (char === ')') depth--
    else if (char === ',' && depth === 0) {
      commaIndex = i
      break
    }
  }

  if (commaIndex === -1) return null

  return {
    light: inner.slice(0, commaIndex).trim(),
    dark: inner.slice(commaIndex + 1).trim(),
  }
}

// Helper to parse any color (hex, rgb, CSS variable, or light-dark) to RGB
function parseColor(color: string, element?: HTMLElement | null): { r: number; g: number; b: number } {
  let resolvedColor = color

  // Handle light-dark() syntax
  if (color.startsWith('light-dark(')) {
    const parsed = parseLightDark(color)
    if (parsed) {
      resolvedColor = isDarkMode() ? parsed.dark : parsed.light
      // Recursively parse the chosen color (it might be a var() or hex)
      return parseColor(resolvedColor, element)
    }
  }

  // Resolve CSS variables
  if (resolvedColor.startsWith('var(')) {
    if (element) {
      const varName = resolvedColor.slice(4, -1).trim()
      resolvedColor = getComputedStyle(element).getPropertyValue(varName).trim()
      // The resolved value might be light-dark(), so recurse
      if (resolvedColor.startsWith('light-dark(')) {
        return parseColor(resolvedColor, element)
      }
    } else {
      return { r: 22, g: 51, b: 60 }
    }
  }

  // Parse hex color (3 or 6 digit)
  const hex6Result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i.exec(resolvedColor)
  if (hex6Result) {
    return {
      r: parseInt(hex6Result[1], 16),
      g: parseInt(hex6Result[2], 16),
      b: parseInt(hex6Result[3], 16),
    }
  }

  const hex3Result = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(resolvedColor)
  if (hex3Result) {
    return {
      r: parseInt(hex3Result[1] + hex3Result[1], 16),
      g: parseInt(hex3Result[2] + hex3Result[2], 16),
      b: parseInt(hex3Result[3] + hex3Result[3], 16),
    }
  }

  // Parse rgb/rgba color
  const rgbResult = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(resolvedColor)
  if (rgbResult) {
    return {
      r: parseInt(rgbResult[1], 10),
      g: parseInt(rgbResult[2], 10),
      b: parseInt(rgbResult[3], 10),
    }
  }

  // Default fallback
  return { r: 22, g: 51, b: 60 }
}

// Helper to interpolate between two colors
function lerpColor(
  color1: { r: number; g: number; b: number },
  color2: { r: number; g: number; b: number },
  t: number
): string {
  const r = Math.round(color1.r + (color2.r - color1.r) * t)
  const g = Math.round(color1.g + (color2.g - color1.g) * t)
  const b = Math.round(color1.b + (color2.b - color1.b) * t)
  return `rgb(${r}, ${g}, ${b})`
}

export function Grid({
  rowSize = 12,
  dotMin = 1,
  dotMax = 2,
  mouseRadius = 200,
  hoverColor = '#CCCCCC',
  baseColor = '#CCCCCC',
  accentColor = '#CCCCCC',
  style,
  className,
}: GridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mousePos = useRef({ x: -1000, y: -1000 })
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [themeKey, setThemeKey] = useState(0) // Force re-resolve on theme change

  // Watch for container size changes
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setDimensions({ width, height })
      }
    })

    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [])

  // Watch for theme changes (system preference and data-theme-mode attribute)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => setThemeKey((k) => k + 1)

    mediaQuery.addEventListener('change', handleChange)

    // Also watch for data-theme-mode attribute changes
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'data-theme-mode') {
          handleChange()
        }
      }
    })
    observer.observe(document.documentElement, { attributes: true })

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
      observer.disconnect()
    }
  }, [])

  // Pre-resolve colors (recalculate when colors or theme change)
  const [resolvedColors, setResolvedColors] = useState<{
    hover: { r: number; g: number; b: number }
    accent: { r: number; g: number; b: number }
    base: { r: number; g: number; b: number }
    baseStr: string
  } | null>(null)

  useEffect(() => {
    // Resolve colors when they change, container mounts, or theme changes
    if (containerRef.current && dimensions.width > 0) {
      const container = containerRef.current
      const baseRgb = parseColor(baseColor, container)
      const resolved = {
        hover: parseColor(hoverColor, container),
        accent: parseColor(accentColor, container),
        base: baseRgb,
        baseStr: `rgb(${baseRgb.r}, ${baseRgb.g}, ${baseRgb.b})`,
      }
      setResolvedColors(resolved)
    }
  }, [hoverColor, accentColor, baseColor, dimensions.width, themeKey])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) return
    if (!resolvedColors) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const { width, height } = dimensions
    const { hover: hoverRgb, accent: accentRgb, base: baseRgb, baseStr } = resolvedColors

    // Scale for crisp rendering on high-DPI displays
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    ctx.clearRect(0, 0, width, height)

    const { x: mouseX, y: mouseY } = mousePos.current

    // Calculate how many dots fit
    const countX = Math.ceil(width / rowSize) + 1
    const countY = Math.ceil(height / rowSize) + 1

    const accentStart = 0.85

    for (let ix = 0; ix <= countX; ix++) {
      for (let iy = 0; iy <= countY; iy++) {
        const dotX = rowSize * ix
        const dotY = rowSize * iy

        // Calculate distance from mouse to this dot
        const distance = Math.hypot(mouseX - dotX, mouseY - dotY)

        // Dots grow larger near mouse, smaller far away
        let dotSize: number
        if (distance >= mouseRadius) {
          dotSize = dotMin
        } else {
          const t = 1 - distance / mouseRadius
          dotSize = dotMin + (dotMax - dotMin) * t
        }

        ctx.beginPath()
        ctx.arc(dotX, dotY, dotSize, 0, 2 * Math.PI)

        // Three-stage color gradient based on distance
        if (distance < mouseRadius) {
          const t = distance / mouseRadius
          if (t < accentStart) {
            const innerT = t / accentStart
            ctx.fillStyle = lerpColor(hoverRgb, accentRgb, innerT)
          } else {
            const outerT = (t - accentStart) / (1 - accentStart)
            ctx.fillStyle = lerpColor(accentRgb, baseRgb, outerT)
          }
        } else {
          ctx.fillStyle = baseStr
        }

        ctx.fill()
      }
    }
  }, [dimensions, rowSize, dotMin, dotMax, mouseRadius, resolvedColors])

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      mousePos.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }

      draw()
    },
    [draw]
  )

  const handleMouseLeave = useCallback(() => {
    mousePos.current = { x: -1000, y: -1000 }
    draw()
  }, [draw])

  useEffect(() => {
    draw()
  }, [draw])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          display: 'block',
          opacity: 0.7,
          width: dimensions.width,
          height: dimensions.height,
        }}
      />
    </div>
  )
}
