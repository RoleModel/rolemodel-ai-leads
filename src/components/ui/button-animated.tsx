// Button component with label transition animation on hover
import { motion } from "motion/react"
import type { Transition } from "motion/react"
import type { CSSProperties, MouseEventHandler } from "react"
import '@/components/ui/button.css'
import { cn } from "@/lib/utils"


interface ButtonPillProps {
  label: string
  useVariant?: boolean
  variant?:
  | "dark"
  | "light"
  | "blue"
  | "darkblue"
  | "rmbrightblue"
  | "brightblue"
  | "green"
  | "purple"
  | "lightpurple"
  | "bluegreen"
  | "yellow"
  | "ghost"
  backgroundColor?: string
  hoverBackground?: boolean
  hoverbackgroundColor?: string
  hoverColo?: string
  boxShadow?: string
  textColor?: string
  hoverTextColor?: string
  font?: CSSProperties
  // Icon slots
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
  iconGap?: number
  style?: CSSProperties
  disabled?: boolean
  className?: string
  onClick?: MouseEventHandler<HTMLButtonElement>
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */

export default function ButtonPill(props: ButtonPillProps) {
  const {
    label,
    useVariant,
    variant,
    backgroundColor,
    textColor,
    hoverTextColor,
    font,
    hoverbackgroundColor,
    iconLeft,
    iconRight,
    hoverBackground = false,
    iconGap = 10,
    style,
    disabled,
    onClick,
    className,
  } = props

  const variants: Record<
    string,
    {
      bg: string
      textColor: string
      hoverTextColor: string
      boxShadow?: string
    }
  > = {
    dark: {
      bg: "var(--blue-green-900)",
      textColor: "var(--op-color-white)",
      hoverTextColor: "var(--op-color-white)",
    },
    light: {
      bg: "var(--op-color-white)",
      textColor: "var(--op-color-on-background)",
      hoverTextColor: "var(--op-color-on-background)",
    },
    blue: {
      bg: "var(--blue-500)",
      textColor: "var(--op-color-white)",
      hoverTextColor: "var(--op-color-white)",
    },
    rmbrightblue: {
      bg: "var(--blue-400)",
      textColor: "var(--op-color-white)",
      hoverTextColor: "var(--op-color-white)",
    },
    brightblue: {
      bg: "var(--blue-100)",
      textColor: "var(--blue-green-900)",
      hoverTextColor: "var(--blue-green-900)",
    },
    darkblue: {
      bg: "var(--blue-900)",
      textColor: "var(--op-color-white)",
      hoverTextColor: "var(--op-color-white)",
    },
    green: {
      bg: "var(--green-800)",
      textColor: "var(--op-color-white)",
      hoverTextColor: "var(--op-color-white)",
    },
    purple: {
      bg: "var(--purple-900)",
      textColor: "var(--op-color-white)",
      hoverTextColor: "var(--op-color-white)",
    },
    lightpurple: {
      bg: "var(--purple-100)",
      textColor: "var(--op-color-on-background)",
      hoverTextColor: "var(--op-color-on-background)",
    },
    bluegreen: {
      bg: "var(--blue-green-400)",
      textColor: "var(--op-color-white)",
      hoverTextColor: "var(--op-color-white)",
    },
    yellow: {
      bg: "var(--brand-Bright-Yellow)",
      textColor: "var(--blue-green-900)",
      hoverTextColor: "var(--blue-green-900)",
    },
    ghost: {
      bg: "transparent",
      textColor: "var(--op-color-white)",
      hoverTextColor: "var(--op-color-white)",
      boxShadow: "inset 0 0 0 1px var(--op-color-white)",
    },
  }

  // Use variant if provided and exists, otherwise fall back to custom colors
  const shouldUseVariant = useVariant || (variant && variant in variants)

  const colors = shouldUseVariant && variant && variants[variant]
    ? variants[variant]
    : {
      bg: backgroundColor ?? 'transparent',
      textColor: textColor ?? 'inherit',
      hoverTextColor: hoverTextColor ?? textColor ?? 'inherit',
      hoverbackgroundColor: hoverbackgroundColor,
    }

  const MotionButton = motion.button

  const buttonVariants = {
    rest: {
      filter: "brightness(100%) saturate(100%)",
      transition: { duration: 0.35, ease: "easeInOut" as const },
    },
    hover: {
      backgroundColor: hoverBackground ? hoverbackgroundColor : undefined,
      filter: hoverBackground
        ? "brightness(100%) saturate(100%)"
        : "brightness(110%) saturate(134%)",
      transition: { duration: 0.25, ease: "easeInOut" as const },
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.15, ease: "easeInOut" as const },
    },
  }

  const textMotion: Transition = {
    duration: 0.25,
    ease: "easeInOut",
    type: "tween",
  }

  const topVariant = {
    rest: {
      y: "0%",
      opacity: 1,
      transition: textMotion,
    },
    hover: {
      y: "-100%",
      opacity: 0,
      transition: textMotion,
    },
  }

  const bottomVariant = {
    rest: {
      y: "100%",
      opacity: 0,
      transition: textMotion,
    },
    hover: {
      y: "0%",
      opacity: 1,
      transition: textMotion,
    },
  }


  const computedLineHeight =
    typeof font?.lineHeight === "number"
      ? `${font.lineHeight}px`
      : font?.lineHeight || "1em"

  const commonIconStyle: CSSProperties = {
    width: `calc(${computedLineHeight} + 4px)`,
    height: `calc(${computedLineHeight} + 4px)`,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  }

  const content = (
    <div
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "space-between",
        flex: '1 1 auto',
        gap: iconGap,
        minHeight: computedLineHeight,
        lineHeight: computedLineHeight,
      }}
    >
      {/* Start Icon */}
      {iconLeft && (
        <div
          style={{
            ...commonIconStyle,
            color: "inherit",
          }}
          aria-hidden="true"
        >
          {iconLeft}
        </div>
      )}
      {/* Label pair */}
      <div style={{ position: "relative", display: "grid" }}>
        <motion.span
          variants={topVariant}
          style={{
            color: colors.textColor,
            gridArea: "1 / 1 / 2 / 2",
            display: "inline-flex",
            alignItems: "center",
            whiteSpace: "nowrap",
            willChange: "transform, opacity",
          }}
        >
          {label}
        </motion.span>
        <motion.span
          variants={bottomVariant}
          style={{
            color: colors.hoverTextColor,
            gridArea: "1 / 1 / 2 / 2",
            display: "inline-flex",
            alignItems: "center",
            whiteSpace: "nowrap",
            willChange: "transform, opacity",
          }}
        >
          {label}
        </motion.span>
      </div>
      {/* End Icon */}
      {iconRight && (
        <div
          style={{
            ...commonIconStyle,
            color: "inherit",
          }}
          aria-hidden="true"
        >
          {iconRight}
        </div>
      )}
    </div>
  )



  return (
    <>
      <MotionButton
        className={cn("btn", className)}
        variants={buttonVariants}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        style={{
          borderRadius: "var(--op-radius-medium)",
          backgroundColor: colors.bg,
          color: colors.textColor,
          position: "relative",
          overflow: "hidden",
          padding: 'var(--_op-btn-padding-large)',
          border: "none",
          cursor: "pointer",
          display: "inline-flex",
          boxShadow: 'none',
          alignItems: "center",
          height: 44,
          justifyContent: "center",
          willChange: "border-radius, filter  ",
          fontFamily: "DM Sans",
          fontSize: 18,
          fontWeight: 500,
          lineHeight: 1,
          whiteSpace: "nowrap",
          ...style,
        }}

        disabled={disabled}
        onClick={onClick}
        type="button"
      >
        {content}
      </MotionButton>
    </>
  )
}
