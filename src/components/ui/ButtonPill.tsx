'use client'

import { motion } from 'motion/react'
import { useState, type CSSProperties, type ReactNode } from 'react'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import * as HugeIconsStroke from '@hugeicons-pro/core-stroke-standard'
import * as HugeIconsSolid from '@hugeicons-pro/core-solid-standard'
import * as HugeIconsDuotone from '@hugeicons-pro/core-duotone-rounded'

// Helper to get icon component by name
function getIconComponent(
  iconName: string,
  variant: 'stroke' | 'solid' | 'duotone' = 'stroke'
) {
  // Convert kebab-case to PascalCase and add Icon suffix
  const pascalCase = iconName
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
  const iconKey = `${pascalCase}Icon`

  // Select the icon set based on variant
  const iconSet =
    variant === 'solid'
      ? HugeIconsSolid
      : variant === 'duotone'
        ? HugeIconsDuotone
        : HugeIconsStroke

  return (iconSet as Record<string, IconSvgElement>)[iconKey] || null
}

export type ButtonPillVariant =
  | 'dark'
  | 'light'
  | 'blue'
  | 'darkblue'
  | 'rmbrightblue'
  | 'brightblue'
  | 'green'
  | 'secondary'
  | 'purple'
  | 'lightpurple'
  | 'bluegreen'
  | 'yellow'
  | 'ghost'
  | 'default'

export interface ButtonPillProps {
  ariaLabel?: string
  label?: string

  // Color / variant
  useVariant?: boolean
  circle?: boolean
  grow?: boolean
  variant?: ButtonPillVariant
  backgroundColor?: string
  hoverBackground?: boolean
  hoverbackgroundColor?: string
  hoverColor?: string
  boxShadow?: string
  textColor?: string
  hoverTextColor?: string

  // Layout / font
  iconStyle?: string
  borderRadius?: number
  paddingX?: number
  font?: CSSProperties

  // State
  isActive?: boolean
  disableHoverAnimation?: boolean

  // Icons
  showStartIcon?: boolean
  showEndIcon?: boolean
  startIconName?: string
  endIconName?: string
  startIconSvg?: string
  endIconSvg?: string
  iconGap?: number
  iconSize?: number
  circleSize?: number
  iconFontWeight?: number
  iconVariant?: 'stroke' | 'solid' | 'duotone'

  // Shape / behavior
  shapeMode?: 'auto' | 'circle' | 'grow' | 'pill'
  disableGrowOverlay?: boolean
  height?: number

  // Misc
  style?: CSSProperties
  className?: string
  href?: string
  target?: string
  rel?: string
  onClick?: (e: React.MouseEvent) => void
  onTap?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  children?: ReactNode
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

type VariantColors = {
  bg: string
  textColor: string
  hoverTextColor: string
  boxShadow?: string
  hoverBoxShadow?: string
  hoverbackgroundColor?: string
}

export function ButtonPill(props: ButtonPillProps) {
  const {
    ariaLabel = 'Button',
    label = 'Button',

    useVariant = true,
    variant = 'blue',
    backgroundColor,
    textColor,
    hoverTextColor,
    circleSize = 50,
    borderRadius = 8,
    boxShadow,
    paddingX = 20,
    font,
    circle,
    hoverbackgroundColor,
    disableHoverAnimation = false,

    startIconName = '',
    endIconName = '',
    showStartIcon = false,
    showEndIcon = false,
    startIconSvg = '',
    endIconSvg = '',
    iconGap = 8,
    iconSize = 18,
    iconFontWeight = 500,
    iconVariant = 'stroke',
    style,
    className,
    isActive = false,
    href,
    target,
    rel,
    onClick,
    onTap,
    onMouseEnter: onMouseEnterProp,
    onMouseLeave: onMouseLeaveProp,
    shapeMode = 'auto',
    disableGrowOverlay = false,
    children,
    type = 'button',
    disabled = false,
  } = props

  // Single source of truth for modes
  const isCircleMode = shapeMode === 'circle' || (shapeMode === 'auto' && Boolean(circle))

  // Hover state for grow overlay
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = () => {
    if (isActive || disableHoverAnimation) return
    setIsHovered(true)
    onMouseEnterProp?.()
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    onMouseLeaveProp?.()
  }

  // =====================
  // Variant color tokens
  // =====================

  const variants: Record<ButtonPillVariant, VariantColors> = {
    default: {
      bg: 'transparent',
      textColor: '#000000',
      hoverTextColor: '#000000',
    },
    secondary: {
      bg: '#FFFFFF',
      textColor: '#181A18',
      hoverTextColor: '#2A84F8',
      boxShadow: '0 0 0 1px #CCCCCC inset',
      hoverBoxShadow: '0 0 0 1px #CCCCCC inset',
    },
    dark: {
      bg: '#04242B',
      textColor: '#FFFFFF',
      hoverTextColor: '#FFFFFF',
      hoverbackgroundColor: '#000000',
    },
    light: {
      bg: '#FFFFFF',
      textColor: '#181A18',
      hoverTextColor: '#181A18',
    },
    blue: {
      bg: '#3A70B3',
      textColor: '#FFFFFF',
      hoverTextColor: '#FFFFFF',
    },
    darkblue: {
      bg: '#193C64',
      textColor: '#FFFFFF',
      hoverTextColor: '#FFFFFF',
    },
    rmbrightblue: {
      bg: '#2A84F8',
      textColor: '#FFFFFF',
      hoverTextColor: '#FFFFFF',
    },
    brightblue: {
      bg: '#87D4E9',
      textColor: '#000000',
      hoverTextColor: '#000000',
    },
    green: {
      bg: '#538C5E',
      textColor: '#FFFFFF',
      hoverTextColor: '#FFFFFF',
    },
    purple: {
      bg: '#3C194A',
      textColor: '#FFFFFF',
      hoverTextColor: '#FFFFFF',
    },
    lightpurple: {
      bg: '#A998C9',
      textColor: '#181A18',
      hoverTextColor: '#181A18',
    },
    bluegreen: {
      bg: '#27434D',
      textColor: '#FFFFFF',
      hoverTextColor: '#FFFFFF',
    },
    yellow: {
      bg: '#FCF496',
      textColor: '#181A18',
      hoverTextColor: '#181A18',
    },
    ghost: {
      bg: 'transparent',
      textColor: '#FFFFFF',
      hoverTextColor: '#FFFFFF',
      boxShadow: '0 0 0 1px #FFFFFF inset',
    },
  }

  const variantColors = variants[variant] ?? variants.default

  const colors: VariantColors = useVariant
    ? {
        ...variantColors,
        textColor: textColor && textColor !== '' ? textColor : variantColors.textColor,
        hoverTextColor:
          hoverTextColor && hoverTextColor !== ''
            ? hoverTextColor
            : variantColors.hoverTextColor,
        hoverbackgroundColor:
          hoverbackgroundColor && hoverbackgroundColor !== ''
            ? hoverbackgroundColor
            : variantColors.hoverbackgroundColor,
      }
    : {
        bg: backgroundColor || 'transparent',
        textColor: textColor || '#000000',
        hoverTextColor: hoverTextColor || '#000000',
        hoverbackgroundColor: hoverbackgroundColor || backgroundColor || 'transparent',
      }

  // Grow overlay: only when there's a solid background
  const growBgColor = colors.hoverbackgroundColor || colors.bg
  const hasGrowBg = Boolean(growBgColor && growBgColor !== 'transparent')

  // =====================
  // Shadows
  // =====================

  const styleBoxShadow = style?.boxShadow as string | undefined

  const isValidShadow = (shadow: string | undefined): shadow is string =>
    Boolean(shadow && shadow !== 'none' && shadow.trim() !== '')

  const computedShadow = isValidShadow(styleBoxShadow)
    ? styleBoxShadow
    : isValidShadow(boxShadow)
      ? boxShadow
      : useVariant
        ? variants[variant]?.boxShadow || undefined
        : undefined

  const computedHoverShadow = isValidShadow(styleBoxShadow)
    ? styleBoxShadow
    : useVariant && variants[variant]?.hoverBoxShadow
      ? variants[variant].hoverBoxShadow
      : computedShadow

  // =====================
  // Motion variants
  // =====================

  const hasShadow = isValidShadow(computedShadow)
  const hasHoverShadow = isValidShadow(computedHoverShadow)

  const buttonVariants = {
    initial: {
      color: colors.textColor,
      ...(hasShadow && { boxShadow: computedShadow }),
    },
    rest: {
      color: colors.textColor,
      ...(hasShadow && { boxShadow: computedShadow }),
      filter: 'brightness(100%) saturate(100%)',
      transition: { duration: 0.35, ease: 'easeInOut' as const },
    },
    hover: {
      color: colors.hoverTextColor,
      ...(hasHoverShadow && { boxShadow: computedHoverShadow }),
      filter:
        !disableGrowOverlay && hasGrowBg
          ? 'brightness(100%) saturate(100%)'
          : 'brightness(110%) saturate(134%)',
      transition: { duration: 0.25, ease: 'easeInOut' as const },
    },
    tap: { scale: 0.95, transition: { duration: 0.5, ease: 'easeOut' as const } },
    active: {
      color: colors.textColor,
      ...(hasShadow && { boxShadow: computedShadow }),
      filter: 'brightness(110%) saturate(120%)',
      transition: { duration: 0.25, ease: 'easeInOut' as const },
    },
  }

  // =====================
  // Helpers
  // =====================

  const computedLineHeight =
    typeof font?.lineHeight === 'number'
      ? `${font.lineHeight}px`
      : font?.lineHeight || '1.3em'

  const renderSvg = (raw: string) => {
    if (!raw) return null

    const sanitizeSvg = (svg: string): string => {
      // Strip script tags and event handlers for XSS protection
      let cleaned = svg
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<script[^>]*\/>/gi, '')
        .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/\bon\w+\s*=\s*\S+/gi, '')
        .replace(/javascript\s*:/gi, '')
        .replace(/data\s*:/gi, 'data-blocked:')
        .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
        .replace(/<iframe[^>]*\/>/gi, '')
        .replace(/<object[\s\S]*?<\/object>/gi, '')
        .replace(/<embed[^>]*\/?>/gi, '')
        .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '')

      // Replace fill/stroke colors with currentColor
      cleaned = cleaned
        .replace(/fill="(?!none)[^"]*"/gi, 'fill="currentColor"')
        .replace(/stroke="(?!none)[^"]*"/gi, 'stroke="currentColor"')
        .replace(/fill='(?!none)[^']*'/gi, "fill='currentColor'")
        .replace(/stroke='(?!none)[^']*'/gi, "stroke='currentColor'")

      return cleaned
    }

    const cleaned = sanitizeSvg(raw)
    return (
      <span
        aria-hidden="true"
        className="button-icon-sanitize"
        style={{
          display: 'inline-flex',
          width: '100%',
          height: '100%',
          color: 'inherit',
        }}
        dangerouslySetInnerHTML={{ __html: cleaned }}
      />
    )
  }

  const renderIcon = (iconName: string) => {
    const IconComponent = getIconComponent(iconName, iconVariant)
    if (!IconComponent) return null
    return (
      <HugeiconsIcon
        icon={IconComponent}
        color="currentColor"
        size={iconSize}
        strokeWidth={iconFontWeight === 500 ? 1.5 : iconFontWeight > 500 ? 2 : 1}
      />
    )
  }

  const displayLabel = label || 'Button'

  // =====================
  // Content blocks
  // =====================

  const content: ReactNode = (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: iconGap,
        minHeight: computedLineHeight,
        lineHeight: computedLineHeight,
        color: 'inherit',
      }}
    >
      {showStartIcon && (startIconName || startIconSvg) && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: iconSize,
            height: iconSize,
            flexShrink: 0,
            transform: `rotate(${isActive ? 180 : 0}deg)`,
            transition: 'transform 0.3s ease-in-out',
            transformOrigin: 'center',
          }}
          aria-hidden="true"
        >
          {startIconName ? renderIcon(startIconName) : renderSvg(startIconSvg)}
        </div>
      )}

      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          whiteSpace: 'nowrap',
          color: 'inherit',
          lineHeight: 'inherit',
        }}
      >
        {displayLabel}
      </span>

      {showEndIcon && (endIconName || endIconSvg) && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: iconSize,
            height: iconSize,
            flexShrink: 0,
            transform: `rotate(${isActive ? 180 : 0}deg)`,
            transition: 'transform 0.3s ease-in-out',
            transformOrigin: 'center',
          }}
          aria-hidden="true"
        >
          {endIconName ? renderIcon(endIconName) : renderSvg(endIconSvg)}
        </div>
      )}
    </div>
  )

  const circleContent: ReactNode = (
    <div
      aria-label={ariaLabel}
      style={{
        display: 'inline-grid',
        placeContent: 'center',
        placeItems: 'center',
        width: circleSize,
        height: circleSize,
        color: 'inherit',
      }}
    >
      {startIconName
        ? renderIcon(startIconName)
        : startIconSvg
          ? renderSvg(startIconSvg)
          : endIconName
            ? renderIcon(endIconName)
            : endIconSvg
              ? renderSvg(endIconSvg)
              : null}
    </div>
  )

  // Choose inner content - children override default content
  const hasChildren =
    children !== null &&
    children !== undefined &&
    !(Array.isArray(children) && children.length === 0)

  const innerContent: ReactNode = hasChildren
    ? children
    : isCircleMode
      ? circleContent
      : content

  // Only show overlay when there's an actual solid background color
  const useGrowOverlay = !disableGrowOverlay && hasGrowBg && !disableHoverAnimation

  const renderGrowOverlay = () => (
    <motion.div
      initial={false}
      animate={{
        clipPath: isHovered ? 'circle(150% at 0% 100%)' : 'circle(0% at 0% 100%)',
      }}
      transition={{
        duration: 0.25,
        ease: isHovered ? [0.4, 0, 0.2, 1] : 'easeInOut',
      }}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: growBgColor,
        filter: 'brightness(120%)',
        zIndex: 0,
        pointerEvents: 'none',
        borderRadius: 'inherit',
        clipPath: 'circle(0% at 0% 100%)',
      }}
    />
  )

  const wrappedInner = (
    <div
      style={{
        position: 'relative',
        zIndex: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {innerContent}
    </div>
  )

  // =====================
  // Wrapper styles + render
  // =====================

  const { boxShadow: _styleBoxShadow, ...restStyle } = style || {}

  const sharedStyles: CSSProperties = {
    borderRadius: isCircleMode ? '50%' : borderRadius,
    backgroundColor: colors.bg,
    color: colors.textColor,
    position: 'relative',
    overflow: 'hidden',
    paddingInline: isCircleMode ? 0 : paddingX,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    width: isCircleMode ? circleSize : undefined,
    height: isCircleMode ? circleSize : 40,
    justifyContent: 'center',
    alignSelf: 'flex-start',
    willChange: 'border-radius, filter',
    fontFamily: 'var(--font-family-sans, "DM Sans", sans-serif)',
    textDecoration: 'none',
    fontSize: 16,
    fontWeight: 500,
    lineHeight: 1.3,
    aspectRatio: isCircleMode ? '1 / 1' : undefined,
    opacity: disabled ? 0.6 : 1,
    ...restStyle,
    ...(hasShadow && { boxShadow: computedShadow }),
  }

  const currentAnimate = isActive
    ? buttonVariants.active
    : isHovered && !disableHoverAnimation
      ? buttonVariants.hover
      : buttonVariants.rest

  const sharedMotionProps = {
    initial: buttonVariants.initial,
    animate: currentAnimate as any,
    whileHover: !isActive && !disableHoverAnimation ? buttonVariants.hover as any : undefined,
    whileTap: !disabled ? buttonVariants.tap : undefined,
    style: sharedStyles,
    className,
    onClick: onClick || onTap,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  }

  // Resolve href
  const resolvedHref =
    typeof href === 'string'
      ? href
      : href && typeof href === 'object'
        ? (href as { url?: string; href?: string; pathname?: string; path?: string }).url ||
          (href as { url?: string; href?: string; pathname?: string; path?: string }).href ||
          (href as { url?: string; href?: string; pathname?: string; path?: string })
            .pathname ||
          (href as { url?: string; href?: string; pathname?: string; path?: string }).path ||
          null
        : null

  if (resolvedHref) {
    return (
      <motion.a
        {...sharedMotionProps}
        href={resolvedHref}
        target={target}
        rel={rel}
        role="button"
        aria-label={ariaLabel}
      >
        {useGrowOverlay && renderGrowOverlay()}
        {wrappedInner}
      </motion.a>
    )
  }

  return (
    <motion.button
      {...sharedMotionProps}
      type={type}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {useGrowOverlay && renderGrowOverlay()}
      {wrappedInner}
    </motion.button>
  )
}

export default ButtonPill
