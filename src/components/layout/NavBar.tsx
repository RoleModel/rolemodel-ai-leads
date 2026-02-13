'use client'

// NavBar.tsx
// NavBar variant with internal scroll-based color changing using IntersectionObserver

import * as React from 'react'
import { motion, useAnimate, useMotionValue, useTransform } from 'motion/react'
import { usePathname } from 'next/navigation'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import * as HugeIconsStroke from '@hugeicons-pro/core-stroke-standard'
import * as HugeIconsDuotone from '@hugeicons-pro/core-duotone-rounded'

import RMLogoDrawOn from '@/components/ui/RMLogoDrawOn'
import { ButtonPill } from '@/components/ui/ButtonPill'
import { CaseStudyCard } from '@/components/ui/case-study-card'

const { useState, useEffect, useRef } = React

// ============================================================================
// DYNAMIC ICON HELPER
// ============================================================================

function getIconComponent(
    iconName: string,
    variant: 'stroke' | 'duotone' = 'stroke'
) {
    const pascalCase = iconName
        .split('-')
        .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('')
    const iconKey = `${pascalCase}Icon`
    const iconSet =
        variant === 'duotone' ? HugeIconsDuotone : HugeIconsStroke
    return (iconSet as Record<string, IconSvgElement>)[iconKey] || null
}

function DynamicIcon({
    name,
    color = 'currentColor',
    size = 20,
    variant = 'stroke',
}: {
    name: string
    color?: string
    size?: number
    variant?: 'stroke' | 'duotone'
}) {
    const IconComponent = getIconComponent(name, variant)
    if (!IconComponent) return null
    return <HugeiconsIcon icon={IconComponent} color={color} size={size} />
}

// ============================================================================
// TYPES
// ============================================================================

type Props = {
    boxShadow?: React.CSSProperties
    border?: React.CSSProperties
    openBorder?: React.CSSProperties
    borderRadius?: number
    showLinks?: boolean
    showIcons?: boolean
    showCTA?: boolean
    showAI?: boolean
    previewOpen?: boolean
    previewMode?: "auto" | "desktop" | "tablet" | "mobile"
    [key: string]: any // Allow other props for flexibility
}

// ============================================================================
// STYLES FACTORY
// ============================================================================

const createStyles = ({
    isPhone,
    isTablet,
    isOpen,
    textColor,
    rowColor,
    CTABackgroundColor,
    AiBackgroundColor,
    finalTextColor,
    gap,
    outterPadding,
    border,
    openBorder,
    menuPaddingInline,
    menuPaddingBlock,
    ctaCardHeightTablet,
}: {
    isPhone: boolean
    isTablet: boolean
    isOpen: boolean
    textColor: string
    rowColor: string
    CTABackgroundColor: string
    AiBackgroundColor: string
    finalTextColor: string
    gap: number
    outterPadding: number
    border: any
    openBorder: any
    menuPaddingInline: number
    menuPaddingBlock: number
    ctaCardHeightTablet?: number
}) => ({
    // Root container
    root: {
        width: "100%",
        height: "fit-content",
        pointerEvents: "auto" as const,
        paddingInline: isPhone ? 0 : outterPadding,
        display: "grid",
        placeContent: "center stretch",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
    } as React.CSSProperties,

    // Shell (main menu container)
    shell: {
        position: "relative",
        width: "100%",
        maxHeight: "98vh",
        height: "fit-content",
        overflow: isPhone ? "auto" : "visible",
        ...(isOpen ? openBorder || {} : border || {}),
        margin: "0 auto",
        display: "grid",
        placeContent: "start stretch",
        gap: isOpen ? 40 : 0, // Animations handle open state
        transitionProperty: "max-width",
        transitionDuration: "300ms",
        transitionTimingFunction: "cubic-bezier(0.76, 0, 0.24, 1)",
        borderBottomLeftRadius: isOpen ? 8 : 0,
        borderBottomRightRadius: isOpen ? 8 : 0,
    } as React.CSSProperties,

    // Header
    header: {
        color: finalTextColor,
        display: "grid",
        placeItems: "center start",
        gridTemplateColumns: isPhone ? "1fr auto" : "auto 1fr auto",
        placeContent: "center",
        boxSizing: "border-box",
        width: "100%",
        paddingInlineEnd: 0,
        borderBlockEnd: `1px solid color-mix(in srgb, ${textColor} 20%, transparent)`,
        maxHeight: "calc(100vh - 12px)",
        overflow: "visible",
       
    } as React.CSSProperties,

    // Logo container
    logoContainer: {
        width: "auto",
        height: 80,
        flexShrink: 0,
        color: finalTextColor,
        paddingInline: isPhone ? 30 : 24,
        display: "grid",
        placeItems: "center",
        placeContent: "center",
        transition: "color 0.2s ease-in-out, background-color 0.2s ease-in-out",
        cursor: isPhone ? "initial" : "pointer",
    } as React.CSSProperties,

    // Desktop nav buttons container
    navButtonsContainer: {
        display: "grid",
        placeContent: "center",
        gridTemplateColumns: "repeat(4, min-content)",
        justifyContent: "center",
        borderInline: `1px solid color-mix(in srgb, ${textColor} 20%, transparent)`,
        paddingInline: 20,
        height: 80,
        width: "100%",
        gap: 8,
    } as React.CSSProperties,

    menu: {
        width: "100%",
        boxSizing: "border-box",
        color: textColor,
        // important: outer wrapper should hide collapsed inner content
        overflow: "hidden",
        paddingInline: menuPaddingInline,
        paddingBlock: menuPaddingBlock,
        display: "grid",

        gridTemplateRows: "1fr",
    } as React.CSSProperties,

    // Menu inner wrapper (we'll animate maxHeight on this)
    menuInner: {
        minHeight: 0,
        // overflow: "hidden",
        transformOrigin: "top",
    } as React.CSSProperties,

    // Menu grid
    menuGrid: {
        display: "grid",
        height: "100%",
        overflow: "auto",
        gridTemplateColumns: isPhone
            ? "1fr"
            : isTablet
              ? "1fr 1fr"
              : ".85fr 1.1fr 1.15fr",
        gap: gap,
        rowGap: isPhone ? 0 : isTablet ? 12 : gap,
        placeContent: "start stretch",
        paddingBlockEnd: 40,
    } as React.CSSProperties,

    // ListItem
    listItem: {
        minWidth: 0,
        display: "grid",
        gap: isPhone ? 0 : 12,
        placeContent: "start stretch",
    } as React.CSSProperties,

    // Link list title
    linkListTitle: {
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        marginBottom: 0,
        color: rowColor,
        display: isPhone ? "none" : "block",
    } as React.CSSProperties,

    // Nav link
    navLink: {
        fontFamily: "DM Sans",
        lineHeight: 1.1,
        display: "grid",
        gap: 2,
        padding: isPhone ? "14px 0 14px" : "12px 0 10px",
        fontSize: "clamp(16px, 2.8vw, 18px)",
        fontWeight: 500,
        letterSpacing: "-0.03em",
        cursor: "pointer",
        textDecoration: "none",
        position: "relative",
        minHeight: 40,
    } as React.CSSProperties,

    // Nav link label container
    navLinkLabelContainer: {
        display: "flex",
        alignItems: "start",
        marginBottom: "0.16em",
        position: "relative",
        gap: 8,
        width: "100%",
        minWidth: 0,
    } as React.CSSProperties,

    // Label text
    labelText: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        marginBlockEnd: 4,
        display: "block",
        minWidth: 0,
    } as React.CSSProperties,

    // Project number badge
    projectNumberBadge: (isPhone: boolean, rowColor: string) =>
        ({
            fontSize: isPhone ? 10 : 12,
            display: "grid",
            placeContent: "center",
            borderRadius: 999,
            height: isPhone ? 18 : 20,
            width: isPhone ? 18 : 20,
            lineHeight: 0.9,
            fontWeight: 700,
            textAlign: "center",
            color: rowColor,
            boxShadow: `0px 0px 3px 1px ${rowColor}`,
        }) as React.CSSProperties,

    // Description text
    descText: {
        opacity: 0.85,
        display: isPhone ? "none" : "block",
        fontSize: "clamp(11px, 11px + 0.5vw, 14px)",
        color: textColor,
        letterSpacing: 0,
        fontWeight: 400,
    } as React.CSSProperties,

    // CTA card
    cta: (isPhone: boolean, isTablet: boolean) =>
        ({
            minWidth: 0,
            display: "grid",
            placeItems: isPhone ? "center start" : "end start",
            placeContent: isPhone ? undefined : "end stretch",
            gridTemplateColumns: isPhone ? "auto 1fr auto" : undefined,
            gap: 8,
            padding: isPhone ? 12 : "24px 16px",
            borderRadius: isPhone ? 6 : 8,
            textDecoration: "none",
            cursor: "pointer",
            overflow: "hidden",
            transition: "all 0.2s ease",
            height: isPhone ? "auto" : 200,
            width: "100%",
            position: "relative",
            alignSelf: isPhone ? undefined : "end",
        }) as React.CSSProperties,

    // CTA arrow icon container
    ctaArrow: {
        position: "absolute",
        top: 0,
        right: 0,
        padding: 12,
        zIndex: 4,
    } as React.CSSProperties,

    ctaBgIcon: {
        position: "absolute",
        color: CTABackgroundColor || AiBackgroundColor,
        zIndex: 0,
        inset: -30,
        opacity: 0.5,
        transform: "rotate(-5deg)",
        filter: "hue-rotate(90deg)",
        mixBlendMode: "luminosity",
    } as React.CSSProperties,

    ctaText: {
        zIndex: 2,
        fontSize: isPhone ? 16 : 20,
        fontWeight: isPhone ? 500 : 600,
        fontFamily: "DM Sans",
        letterSpacing: "-0.02em",
        lineHeight: 1,
        display: "block",
        justifySelf: "stretch",
        minWidth: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: isPhone ? "nowrap" : "normal",
    } as React.CSSProperties,

    ctaDescrption: {
        zIndex: 2,
        fontSize: 14,
        fontWeight: 600,
        fontFamily: "DM Sans",
        letterSpacing: "0.0em",
        lineHeight: 1.2,
        display: "block",
        justifySelf: "stretch",
    } as React.CSSProperties,

    // Hamburger button
    hamburgerButton: (textColor: string) =>
        ({
            display: "grid",
            placeItems: "center",
            gap: 8,
            background: "transparent",
            border: "none",
            color: textColor,
            cursor: "pointer",
            fontFamily: "DM Sans, sans-serif",
            fontSize: 18,
            fontWeight: 500,
            height: 80,
            borderInlineStart: isOpen
                ? "none"
                : `1px solid color-mix(in srgb, ${textColor} 20%, transparent)`,
            width: 80,
            padding: 0,
        }) as React.CSSProperties,

    // Hamburger lines container
    hamburgerLines: {
        display: "inline-flex",
        flexDirection: "column",
        gap: 4,
    } as React.CSSProperties,

    // Hamburger line
    hamburgerLine: (textColor: string, hidden = false) =>
        ({
            width: 20,
            height: 2,
            background: textColor,
            display: hidden ? "none" : "block",
        }) as React.CSSProperties,

    // Spotlight container
    spotlightContainer: (isPhone: boolean, isTablet: boolean) =>
        ({
            position: "relative",
            isolation: "isolate",
            height: 200,
            width: "100%",
            marginBlock: isPhone ? 16 : 0,
            cursor: "pointer",
            pointerEvents: "auto",
        }) as React.CSSProperties,
})

// ============================================================================
// HOOKS
// ============================================================================

// Hook to detect which section is currently at the nav position using scroll events
function useScrollColorChange(
    sectionIds: string[],
    navHeight: number = 80,
    enabled: boolean = true
): boolean {
    const [isInLightSection, setIsInLightSection] = useState(false)
    const rafRef = useRef<number | null>(null)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    useEffect(() => {
        if (
            !enabled ||
            typeof window === "undefined" ||
            sectionIds.length === 0
        ) {
            setIsInLightSection(false)
            return
        }

        // Check if nav is currently over any of the specified sections
        const checkSections = () => {
            // The nav occupies the area from 0 to navHeight pixels from viewport top
            const navBottom = navHeight

            for (const sectionId of sectionIds) {
                // Try standard getElementById first
                let element = document.getElementById(sectionId)

                // Fallback: try querySelector with data-framer-name or other attributes
                if (!element) {
                    element = document.querySelector(
                        `[data-framer-name="${sectionId}"]`
                    ) as HTMLElement
                }
                if (!element) {
                    element = document.querySelector(
                        `[id*="${sectionId}"]`
                    ) as HTMLElement
                }

                if (!element) continue

                const rect = element.getBoundingClientRect()

                // Section overlaps nav if: section top is above nav bottom AND section bottom is below viewport top
                if (rect.top < navBottom && rect.bottom > 0) {
                    setIsInLightSection(true)
                    return
                }
            }

            setIsInLightSection(false)
        }

        // Throttled scroll handler using requestAnimationFrame
        const handleScroll = () => {
            if (rafRef.current) return
            rafRef.current = requestAnimationFrame(() => {
                checkSections()
                rafRef.current = null
            })
        }

        // Initial check
        checkSections()

        // In Framer, scroll might be on window OR on a parent container
        // Listen to both window scroll and use a scroll capture on document
        window.addEventListener("scroll", handleScroll, { passive: true })
        document.addEventListener("scroll", handleScroll, {
            passive: true,
            capture: true,
        })

        // Fallback: poll every 250ms for Framer environments where scroll events don't bubble
        intervalRef.current = setInterval(checkSections, 250)

        return () => {
            window.removeEventListener("scroll", handleScroll)
            document.removeEventListener("scroll", handleScroll, {
                capture: true,
            })
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current)
            }
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [sectionIds, navHeight, enabled])

    return isInLightSection
}

// ============================================================================
// UTILITIES
// ============================================================================


function normalizePath(href: string) {
    if (!href || href === "#") return null
    if (typeof window === "undefined") return href
    try {
        const u = new URL(href, window.location.origin)
        return (u.pathname.replace(/\/+$/, "") || "/") + u.search
    } catch {
        return href
    }
}

function isCurrentLink(currentPath: string, href: string) {
    const a = (currentPath || "/").replace(/\/+$/, "") || "/"
    const b = normalizePath(href)
    if (!b) return false
    return a === b
}

function resolveLink(v: any): string | null {
    if (!v) return null
    if (typeof v === "string") return v
    if (typeof v === "object") {
        return v.url || v.href || v.pathname || v.path || null
    }
    return null
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface NavLinkItem {
    id?: string
    label?: string
    href?: string
    icon?: string
    description?: string
    projectNumber?: number
    highlight?: boolean
}

function LinkList({
    items = [],
    title,
    listId = "list",
    textColor = "#fff",
    rowColor,
    currentPath,
    onItemClick,
    highlightColor = "#FCF496",
    isPhone,
    showIcons = false,
    styles,
}: {
    items?: NavLinkItem[]
    title: string
    listId?: string
    textColor?: string
    rowColor: string
    currentPath: string
    onItemClick: () => void
    highlightColor?: string
    isPhone: boolean
    showIcons?: boolean
    styles: Record<string, any>
    gridArea?: string
    [key: string]: any
}) {
    const safeItems = Array.isArray(items) ? items : []

    return (
        <div className="nav-links">
            <div className="nav-links-title" style={styles.linkListTitle}>
                {title}
            </div>

            {safeItems.map((item, i) => {
                const href = resolveLink(item?.href) || "#"
                const current = isCurrentLink(currentPath, href)
                const stableId =
                    typeof item?.id === "string" ? item.id.trim() : ""
                const key = stableId
                    ? `link:${listId}:${stableId}`
                    : `link:${listId}:${href}:${item?.label ?? ""}:${i}`
                const projectNumber =
                    typeof item?.projectNumber === "number" &&
                    item.projectNumber > 0
                        ? item.projectNumber
                        : null

                const linkColor = current
                    ? rowColor
                    : item.highlight
                      ? highlightColor
                      : textColor

                return (
                    <motion.a
                        className="nav-link"
                        key={key}
                        href={href}
                        aria-current={current ? "page" : undefined}
                        onClick={() => {
                            // Defer close so the click event bubbles to Framer's
                            // SPA router before DOM mutations from menu close
                            requestAnimationFrame(() => onItemClick?.())
                        }}
                        initial={{ color: linkColor, x: 0 }}
                        animate={{ color: linkColor, x: 0 }}
                        whileHover={{
                            color: rowColor,
                            x: 3,
                            transition: { duration: 0.3 },
                        }}
                        style={{
                            ...styles.navLink,
                            borderBottom: isPhone
                                ? "none"
                                : i !== safeItems.length - 1
                                  ? `1px solid color-mix(in srgb, ${textColor} 20%, transparent)`
                                  : "none",
                        }}
                    >
                        <div style={styles.navLinkLabelContainer}>
                            {showIcons && item.icon && (
                                <DynamicIcon
                                    name={item.icon}
                                    color={
                                        item.highlight
                                            ? highlightColor
                                            : rowColor
                                    }
                                    size={isPhone ? 16 : 28}
                                    variant="duotone"
                                />
                            )}
                            <div>
                                <span
                                    key="label"
                                    style={{
                                        ...styles.labelText,
                                        lineHeight: item.description
                                            ? 1
                                            : "28px",
                                    }}
                                >
                                    {item.label || "Link"}
                                </span>
                                {item.description && (
                                    <motion.span
                                        key="desc"
                                        className="nav-desc"
                                        style={styles.descText}
                                    >
                                        {item.description}
                                    </motion.span>
                                )}
                            </div>

                            {projectNumber !== null && (
                                <span
                                    key="project-number"
                                    style={styles.projectNumberBadge(
                                        isPhone,
                                        rowColor
                                    )}
                                >
                                    {projectNumber}
                                </span>
                            )}
                        </div>
                    </motion.a>
                )
            })}
        </div>
    )
}

function ListItem({ gridArea, children, styles, style, ...props }: {
    gridArea: string
    children: React.ReactNode
    styles: Record<string, any>
    style?: React.CSSProperties
    [key: string]: any
}) {
    return (
        <div
            className="list-item"
            {...props}
            style={{ ...styles.listItem, gridArea, ...style }}
        >
            {children}
        </div>
    )
}

function CTA({
    text = "Schedule A Conversation",
    description = "",
    icon = "calendar-01",
    backgroundColor = "#fcf496",
    borderColor = "#a998c9",
    textColor = "#04242B",
    href = "#",
    isPhone,
    isTablet,
    styles,
    onItemClick,
    ...props
}: {
    text?: string
    description?: string
    icon?: string
    backgroundColor?: string
    borderColor?: string
    textColor?: string
    href?: string
    isPhone: boolean
    isTablet: boolean
    styles: Record<string, any>
    onItemClick?: () => void
    [key: string]: any
}) {
    const [isHovered, setIsHovered] = React.useState(false)

    return (
        <motion.a
            {...props}
            href={href}
            style={{
                ...styles.cta(isPhone, isTablet),
                backgroundColor,
                color: textColor,
                borderBottom: isPhone ? "none" : `8px solid ${borderColor}`,
                marginBlock: isPhone ? 4 : 0,
                ...(props.style || {}),
            }}
            onClick={() => {
                requestAnimationFrame(() => onItemClick?.())
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileTap={{ scale: 0.98 }}
        >
            {/* Grow overlay — circle clip-path reveal on hover */}
            <motion.div
                initial={false}
                animate={{
                    clipPath: isHovered
                        ? "circle(150% at 0% 100%)"
                        : "circle(0% at 0% 100%)",
                }}
                transition={{
                    duration: 0.25,
                    ease: isHovered ? [0.4, 0, 0.2, 1] : "easeInOut",
                }}
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor,
                    filter: "brightness(120%)",
                    zIndex: 0,
                    pointerEvents: "none",
                    borderRadius: "inherit",
                    clipPath: "circle(0% at 0% 100%)",
                }}
            />

            {!isPhone && (
                <>
                    <span style={styles.ctaArrow}>
                        <DynamicIcon
                            name="arrow-up-right-01"
                            color={textColor}
                            size={32}
                        />
                    </span>

                    <span style={styles.ctaBgIcon}>
                        <DynamicIcon
                            name={icon}
                            color={backgroundColor}
                            size={300}
                        />
                    </span>
                    <span style={{ position: "relative", zIndex: 2 }}>
                        <DynamicIcon
                            name={icon}
                            color={textColor}
                            size={40}
                            variant="duotone"
                        />
                    </span>
                </>
            )}
            {isPhone && (
                <span style={{ position: "relative", zIndex: 2 }}>
                    <DynamicIcon
                        name={icon}
                        color={textColor}
                        size={24}
                        variant="duotone"
                    />
                </span>
            )}
            <span style={styles.ctaText}>{text}</span>
            {description && !isPhone && (
                <span style={styles.ctaDescrption}>{description}</span>
            )}
            {isPhone && (
                <span style={{ position: "relative", zIndex: 2 }}>
                    <DynamicIcon
                        name="arrow-up-right-01"
                        color={textColor}
                        size={20}
                    />
                </span>
            )}
        </motion.a>
    )
}

function TriggerMenu({ textColor, iconOpen, toggleMenu, styles }: {
    textColor: string
    iconOpen: boolean
    toggleMenu: (source: string) => void
    styles: Record<string, any>
}) {
    return (
        <button
            onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleMenu("hamburger")
            }}
            style={styles.hamburgerButton(textColor)}
        >
            <motion.span style={styles.hamburgerLines}>
                <motion.span
                    key="line1"
                    animate={
                        iconOpen ? { rotate: 45, y: 3 } : { rotate: 0, y: 0 }
                    }
                    style={styles.hamburgerLine(textColor)}
                />
                <motion.span
                    key="line2"
                    style={styles.hamburgerLine(textColor, iconOpen)}
                />
                <motion.span
                    key="line3"
                    animate={
                        iconOpen ? { rotate: -45, y: -3 } : { rotate: 0, y: 0 }
                    }
                    style={styles.hamburgerLine(textColor)}
                />
            </motion.span>
        </button>
    )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function NavBar(props: Props) {
    const {
        homeLink = "https://rolemodelsoftware.com",
        link1 = "https://rolemodelsoftware.com/services",
        link2 = "https://rolemodelsoftware.com/portfolio",
        link3 = "https://rolemodelsoftware.com/consultation",
        link4 = "https://consult.rolemodelsoftware.com",
        contactLabel = "Let's Talk",
        logoTheme = "light",
        openLogoTheme = "light",
        bgColor = "var(--blue-green-900)",
        openBgColor = "var(--blue-green-900)",
        textColor = "#FFFFFF",
        openTextColor = "#FFFFFF",
        accentColor = "#2a84f8",
        rowColor = "#87D4E9",
        contactHoverColor = "#2C83F8",
        ghostColor = "#CCCCCC",
        border,
        openBorder,
        boxShadow,
        showLinks = true,
        showIcons = true,
        showCTA = true,
        showAi = false,
        showSpotlight = true,
        CTABackgroundColor = "#3B70B3",
        CTABorderColor = "#87D4EA",
        AiBackgroundColor = "#29464F",
        AiBorderColor = "#FFFFFF",
        AiTextColor = "#FFFFFF",
        AiText = "A.I. Analysis",
        AiDescription = "Find out if custom software is right for you.",
        CTAText = "Schedule A Conversation",
        CTADescription = "",
        CTATextColor = "#FFFFFF",
        CTAIcon = "calendar-01",
        ctaCardHeightTablet = 200,
        spotlightImageUrl = "https://framerusercontent.com/images/8nGc7fE31a5LiyhesQXL0kAAh48.webp?width=2400&height=1792",
        logoImage = "https://framerusercontent.com/images/fq0QpZJihXpp1TCLYctWjKapX8.svg?width=189&height=88",
        spotlightContent = "Branded Mobile PWA and Desktop Web application for business forum and executive coaching firm",
        spotlightLink ="https://rolemodelsoftware.com/case-studies/c12-business-forums",
        highlightColor = "#2A83F7",
        gap = 32,
        outterPadding = 0,
        col1Title = "About Us",
        col2Title = "Our Approach",
        col3Title = "People",
        col4Title = "Solutions",
        col1Links = [
            { id: "services", label: "Services", href: "https://rolemodelsoftware.com/services", description: "We craft custom software tailored to your business", icon: "wrench-01" },
            { id: "about", label: "About", href: "https://rolemodelsoftware.com/about", description: "We're a world class software development team", icon: "target-01" },
            { id: "work", label: "Our Work", href: "https://rolemodelsoftware.com/portfolio", description: "Case studies and results from our work.", icon: "briefcase-01" },
            { id: "way", label: "The RoleModel Way", href: "https://rolemodelsoftware.com/rolemodel-way", description: "The principles and practices of how we work", icon: "puzzle" },
        ],
        col2Links = [
            { id: "approach", label: "Our Approach", href: "https://rolemodelsoftware.com/focuses/expertise-amplification", description: "Our unique process that ensures project success.", icon: "car-01" },
            { id: "expertise", label: "Expertise Amplification", href: "https://rolemodelsoftware.com/focuses/expertise-amplification", description: "Your domain expertise + our software craft.", icon: "brain-01" },
            { id: "iterative", label: "Iterative Value", href: "https://rolemodelsoftware.com/focuses/iterative-value", description: "Ship value fast, then build on a solid foundation.", icon: "reload" },
            { id: "process", label: "Process Scaling", href: "https://rolemodelsoftware.com/focuses/process-scaling", description: "Process first, software second\u2014scale your advantage.", icon: "arrow-up-right-02" },
        ],
        col3Links = [
            { id: "careers", label: "Careers", href: "https://rolemodelsoftware.com/careers", description: "We're always looking for talent.", icon: "laptop-programming" },
            { id: "academy", label: "Craftsmanship Academy", href: "https://rolemodelsoftware.com/academy", description: "Building future leaders in software development.", icon: "mortarboard-01" },
        ],
        col4Links = [
            { id: "optics", label: "Optics", href: "https://rolemodelsoftware.com/optics", description: "Our design system for consistent, scalable UI.", icon: "circle" },
            { id: "lightning", label: "LightningCAD", href: "https://rolemodelsoftware.com/lightningcad", description: "Rules-driven design tools.", icon: "zap" },
        ],
        previewOpen,
        previewMode = "auto",
        // Scroll-based color change props
        enableScrollColorChange = false,
        colorChangeSections = [],
        altBgColor = "#FFFFFF",
        altTextColor = "#000000",
        altLogoTheme = "dark",
        altAccentColor = "#2a84f8",
        altBorder,
        navHeight = 80,
        menuPaddingInline: menuPaddingInlineProp = 40,
        menuPaddingBlock: menuPaddingBlockProp = 0,
    } = props

    const isCanvas = false
    const [isLogoHovered, setIsLogoHovered] = React.useState(false)
    const [isSpotlightHovered, setIsSpotlightHovered] = React.useState(false)

    // Parse section IDs from string or array
    const sectionIdList = React.useMemo(() => {
        if (!colorChangeSections) return []
        if (Array.isArray(colorChangeSections)) {
            return colorChangeSections.filter(Boolean)
        }
        // Support comma-separated string
        if (typeof colorChangeSections === "string") {
            return colorChangeSections
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
        }
        return []
    }, [colorChangeSections])

    // Use scroll color change hook
    const isInAltSection = useScrollColorChange(
        sectionIdList,
        navHeight,
        enableScrollColorChange && !isCanvas
    )

    // Breakpoint detection - direct width check (most reliable)
    const MOBILE_MAX = 760
    const TABLET_MAX = 1324

    // Always initialize with server-safe defaults to prevent hydration mismatch.
    // The useEffect below will immediately update to the real values on the client.
    const [breakpointState, setBreakpointState] = React.useState({
        isMobile: false,
        isTablet: false,
    })

    React.useEffect(() => {
        if (typeof window === "undefined") return

        const updateBreakpoints = () => {
            const w = window.innerWidth
            const newMobile = w <= MOBILE_MAX
            const newTablet = w > MOBILE_MAX && w <= TABLET_MAX

            setBreakpointState((prev) => {
                if (
                    prev.isMobile !== newMobile ||
                    prev.isTablet !== newTablet
                ) {
                    return { isMobile: newMobile, isTablet: newTablet }
                }
                return prev
            })
        }

        // Check immediately
        updateBreakpoints()

        // Listen to resize
        window.addEventListener("resize", updateBreakpoints)

        return () => {
            window.removeEventListener("resize", updateBreakpoints)
        }
    }, [])

    const { isMobile: isMobileViewport, isTablet: isTabletViewport } =
        breakpointState

    const isPhone = React.useMemo(() => {
        if (previewMode === "mobile") return true
        if (previewMode === "tablet") return false
        if (previewMode === "desktop") return false
        return isMobileViewport
    }, [previewMode, isMobileViewport])

    const isTablet = React.useMemo(() => {
        if (previewMode === "tablet") return true
        if (previewMode === "mobile") return false
        if (previewMode === "desktop") return false
        return isTabletViewport
    }, [previewMode, isTabletViewport])

    const [isOpen, setIsOpen] = useState(previewOpen || false)
    const [iconOpen, setIconOpen] = useState(previewOpen || false)
    const [activeMenuButton, setActiveMenuButton] = useState<string | null>(
        null
    )
    const [isClickLocked, setIsClickLocked] = useState(false)
    const [suppressHover, setSuppressHover] = useState(false)
    const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const openedViaClickAtRef = useRef<number | null>(null)

    // Determine current colors based on scroll position and open state
    const currentBgColor = isOpen
        ? openBgColor
        : isInAltSection
          ? altBgColor
          : bgColor

    const currentTextColor = isOpen
        ? openTextColor
        : isInAltSection
          ? altTextColor
          : textColor

    const currentLogoTheme = isOpen
        ? openLogoTheme
        : isInAltSection
          ? altLogoTheme
          : logoTheme

    const currentAccentColor = isInAltSection ? altAccentColor : accentColor

    const currentBorder = isOpen
        ? openBorder
        : isInAltSection && altBorder
          ? altBorder
          : border

    const finalTextColor = currentTextColor
    const finalLogoTheme = currentLogoTheme

    const pathname = usePathname()
    const currentPath = pathname || "/"

    // Menu padding from props (with mobile cap)
    const menuPaddingInline = isPhone
        ? Math.min(menuPaddingInlineProp, 24)
        : menuPaddingInlineProp
    const menuPaddingBlock = isPhone ? 0 : menuPaddingBlockProp

    // Generate styles
    const styles = React.useMemo(
        () =>
            createStyles({
                isPhone,
                isTablet,
                isOpen,
                textColor: currentTextColor,
                rowColor,
                CTABackgroundColor,
                AiBackgroundColor,
                finalTextColor,
                gap,
                outterPadding,
                border,
                openBorder,
                menuPaddingInline,
                menuPaddingBlock,
                ctaCardHeightTablet,
            }),
        [
            isPhone,
            isTablet,
            isOpen,
            currentTextColor,
            rowColor,
            CTABackgroundColor,
            AiBackgroundColor,
            finalTextColor,
            gap,
            outterPadding,
            border,
            openBorder,
            menuPaddingInline,
            menuPaddingBlock,
            ctaCardHeightTablet,
        ]
    )

    const gridTemplateColumns = React.useMemo(() => {
        if (isPhone) return "1fr"
        // tablet + desktop: 6 equal columns
        return "repeat(6, 1fr)"
    }, [isPhone])

    // Grid template areas based on showCTA, showAi, showSpotlight
    const gridTemplateAreas = React.useMemo(() => {
        // PHONE – single column stack
        if (isPhone) {
            const rows: string[] = ['"c1"', '"c2"', '"c3"']
            if (showCTA) rows.push('"c5"')
            if (showAi) rows.push('"c6"')
            return rows.join("\n")
        }

        // TABLET + DESKTOP (6 columns layout)
        const topRow = `"c1 c1 c2 c2 c3 c3"`

        // Collect bottom-row items
        const bottomItems: string[] = []
        if (showSpotlight) bottomItems.push("c4")
        if (showCTA) bottomItems.push("c5")
        if (showAi) bottomItems.push("c6")

        // No bottom items – top row only
        if (bottomItems.length === 0) {
            return topRow
        }

        // 1 item – full width bottom row
        if (bottomItems.length === 1) {
            const item = bottomItems[0]
            return `${topRow}
                "${item} ${item} ${item} ${item} ${item} ${item}"`
        }

        // 2 items – each spans 3 cols
        if (bottomItems.length === 2) {
            const [a, b] = bottomItems
            return `${topRow}
                "${a} ${a} ${a} ${b} ${b} ${b}"`
        }

        // 3 items – each spans 2 cols
        const [a, b, c] = bottomItems
        return `${topRow}
            "${a} ${a} ${b} ${b} ${c} ${c}"`
    }, [isPhone, showCTA, showAi, showSpotlight])

    // Animations
    const [scope, animate] = useAnimate()

    // 0 = closed, 1 = open
    const menuProgress = useMotionValue(isOpen ? 1 : 0)

    // Translate progress (0–1) into a maxHeight for the inner menu
    // Adjust 500 to the approximate max dropdown height you need
    const menuMaxHeight = useTransform(menuProgress, (p) => `${p * 1500}px`)

    // Ensure MV stays in sync with state (e.g. after navigation)
    useEffect(() => {
        menuProgress.set(isOpen ? 1 : 0)
    }, [isOpen, menuProgress])

    const easing: [number, number, number, number] = [0.76, 0, 0.24, 1]

    // Instant close for link clicks (no animation, navigation wins)
    const instantCloseMenu = () => {
        const root = scope.current
        if (root) {
            const shell = root.querySelector(".shell") as HTMLElement | null
            if (shell) {
                shell.style.gap = "0px"
            }
        }
        setIconOpen(false)
        setActiveMenuButton(null)
        setIsClickLocked(false)
        setIsOpen(false)
        menuProgress.set(0)
    }

    const openMenu = async (buttonId?: string) => {
        const root = scope.current
        if (!root) return

        const shell = root.querySelector(".shell") as HTMLElement | null

        setIsOpen(true)
        setIconOpen(true)
        if (buttonId) setActiveMenuButton(buttonId)

        const openGap = isTablet ? 24 : isPhone ? 16 : gap
        const duration = 0.3

        if (shell) {
            animate(shell, { gap: `${openGap}px` } as any, { duration, ease: easing as any })
        }

        // expand dropdown
        await animate(menuProgress as any, 1, { duration, ease: easing as any })
    }

    const closeMenu = async () => {
        if (!isOpen) return

        const root = scope.current
        if (!root) {
            setIconOpen(false)
            setIsOpen(false)
            setActiveMenuButton(null)
            setIsClickLocked(false)
            menuProgress.set(0)
            return
        }

        const shell = root.querySelector(".shell") as HTMLElement | null

        setIconOpen(false)
        setActiveMenuButton(null)
        setIsClickLocked(false)

        const duration = 0.25

        if (shell) {
            animate(shell, { gap: "0px" } as any, { duration, ease: easing as any })
        }

        // collapse dropdown
        await animate(menuProgress as any, 0, { duration, ease: easing as any })

        setIsOpen(false)

        if (shell) {
            shell.style.gap = ""
        }
    }

    useEffect(() => {
        if (isCanvas && previewOpen) {
            const openGap = isTablet ? 20 : isPhone ? 0 : gap
            const root = scope.current
            if (root) {
                const shell = root.querySelector(".shell") as HTMLElement | null
                if (shell) {
                    shell.style.gap = `${openGap}px`
                }
            }
            menuProgress.set(1)
            setIsOpen(true)
            setIconOpen(true)
        }
    }, [isCanvas, previewOpen, isPhone, isTablet, gap, menuProgress])

    // Keep shell gap in sync with open state
    React.useEffect(() => {
        if (!isOpen) {
            const root = scope.current
            if (root) {
                const shell = root.querySelector(".shell") as HTMLElement | null
                if (shell) {
                    shell.style.gap = "0px"
                }
            }
        }
    }, [isOpen, scope])

    React.useEffect(() => {
        // Save original overflow style on mount
        const originalStyle = window.getComputedStyle(document.body).overflow

        if (isOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = originalStyle
        }

        // Cleanup: restore original style on unmount or when isOpen changes
        return () => {
            document.body.style.overflow = originalStyle
        }
    }, [isOpen]) // Include isOpen in dependency array

    const toggleMenu = (buttonId?: string) => {
        if (isOpen && activeMenuButton === buttonId) {
            // Clicking the same button again closes and unlocks
            setIsClickLocked(false)
            closeMenu()
        } else if (isOpen && buttonId) {
            // Switching to a different button, lock it
            setActiveMenuButton(buttonId)
            setIsClickLocked(true)
        } else {
            // Opening via click - lock it open
            setIsClickLocked(true)
            openedViaClickAtRef.current = Date.now()
            openMenu(buttonId)
        }
    }

    // Desktop hover handlers
    const handleMenuButtonHover = (buttonId: string) => {
        if (isPhone || isCanvas || isClickLocked) return
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current)
            hoverTimeoutRef.current = null
        }
        if (!isOpen) {
            openMenu(buttonId)
        }
    }

    const handleShellMouseEnter = () => {
        if (isPhone || isCanvas || isClickLocked) return
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current)
            hoverTimeoutRef.current = null
        }
    }

    const handleShellMouseLeave = () => {
        if (isPhone || isCanvas || !isOpen || isClickLocked) return
        // Simple delayed close - gives time to reach dropdown
        hoverTimeoutRef.current = setTimeout(() => {
            setSuppressHover(true)
            closeMenu()
        }, 300)
    }

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current)
            }
        }
    }, [])

    // Event listeners
    React.useEffect(() => {
        if (!isOpen || isCanvas) return

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeMenu()
        }
        const handleClickOutside = (e: MouseEvent) => {
            // Ignore delayed synthetic click from mobile tap (fires ~300ms later with stale target)
            const openedAt = openedViaClickAtRef.current
            if (openedAt && Date.now() - openedAt < 400) {
                openedViaClickAtRef.current = null
                return
            }

            const shell = scope.current?.querySelector(".shell")
            if (shell && !shell.contains(e.target as Node)) closeMenu()
        }

        document.addEventListener("keydown", handleEscape)
        const clickTimer = setTimeout(() => {
            document.addEventListener("click", handleClickOutside)
        }, 100)

        return () => {
            clearTimeout(clickTimer)
            document.removeEventListener("keydown", handleEscape)
            document.removeEventListener("click", handleClickOutside)
        }
    }, [isOpen, isCanvas])

    // ============================================================================
    // RENDER
    // ============================================================================

    return (
        <div ref={scope} style={styles.root}>
            <style>{`
        .nav-link:visited,
        .nav-link:visited span {
          color: inherit;
        }
      `}</style>

            <motion.div
                className="shell"
                initial={false}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                style={{
                    ...styles.shell,
                    ...(currentBorder || {}),
                    backgroundColor: currentBgColor,
                    transition: "background-color 0.3s ease-in-out",
                }}
                onMouseEnter={handleShellMouseEnter}
                onMouseLeave={handleShellMouseLeave}
            >
                {/* Header */}
                <motion.header
                    className="header"
                    style={styles.header}
                    animate={{ color: finalTextColor }}
                    transition={{ duration: 0.3 }}
                >
                    <ButtonPill
                        href={homeLink}
                        useVariant={false}
                        backgroundColor="transparent"
                        hoverbackgroundColor={
                            isOpen
                                ? "rgba(255, 255, 255, 0.1)"
                                : isInAltSection
                                  ? "rgba(0, 0, 0, 0.02)"
                                  : "rgba(255, 255, 255, 0.1)"
                        }
                        shapeMode="grow"
                        borderRadius={0}
                        style={{ ...styles.logoContainer, height: 80 }}
                        onMouseEnter={() => setIsLogoHovered(true)}
                        onMouseLeave={() => setIsLogoHovered(false)}
                    >
                        <RMLogoDrawOn
                            width={110}
                            height={44}
                            autoPlay={!isCanvas}
                            oncePerSession={true}
                            textColor={currentTextColor}
                            sessionKey="navbar"
                            ghost={true}
                            ghostColor={ghostColor}
                            theme={finalLogoTheme}
                            isHovered={isLogoHovered}
                        />
                    </ButtonPill>

                    {!isPhone && showLinks && (
                        <>
                            <div style={styles.navButtonsContainer}>
                                <ButtonPill
                                    href={link1}
                                    useVariant={false}
                                    backgroundColor="transparent"
                                    textColor={finalTextColor}
                                    hoverTextColor={currentAccentColor}
                                    label="Services"
                                    paddingX={4}
                                    showStartIcon={false}
                                    showEndIcon={false}
                                    disableHoverAnimation={true}
                                />
                                <div
                                    onMouseEnter={() => {
                                        if (!isClickLocked)
                                            handleMenuButtonHover("company")
                                    }}
                                    onMouseLeave={() => {
                                        if (!isClickLocked)
                                            setSuppressHover(false)
                                    }}
                                    style={{ display: "inline-flex" }}
                                >
                                    <ButtonPill
                                        useVariant={false}
                                        backgroundColor="transparent"
                                        textColor={
                                            activeMenuButton === "company"
                                                ? rowColor
                                                : finalTextColor
                                        }
                                        hoverTextColor={
                                            isClickLocked
                                                ? activeMenuButton === "company"
                                                    ? rowColor
                                                    : finalTextColor
                                                : suppressHover
                                                  ? finalTextColor
                                                  : currentAccentColor
                                        }
                                        paddingX={4}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            toggleMenu("company")
                                        }}
                                        showEndIcon
                                        endIconName="arrow-down-01"
                                        isActive={
                                            activeMenuButton === "company"
                                        }
                                        label="Company & Approach"
                                        disableHoverAnimation={true}
                                    />
                                </div>
                                <ButtonPill
                                    href={link2}
                                    useVariant={false}
                                    backgroundColor="transparent"
                                    textColor={finalTextColor}
                                    hoverTextColor={currentAccentColor}
                                    label="Our Work"
                                    paddingX={4}
                                    disableHoverAnimation={true}
                                />
                                <ButtonPill
                                    href="https://rolemodelsoftware.com/blog"
                                    useVariant={false}
                                    backgroundColor="transparent"
                                    textColor={finalTextColor}
                                    hoverTextColor={currentAccentColor}
                                    label="Blog"
                                    paddingX={4}
                                    showStartIcon={false}
                                    showEndIcon={false}
                                    disableHoverAnimation={true}
                                />
                            </div>

                            <ButtonPill
                                href={link3}
                                useVariant={false}
                                backgroundColor="transparent"
                                hoverbackgroundColor={
                                    isOpen
                                        ? "rgba(255, 255, 255, 0.1)"
                                        : isInAltSection
                                          ? "rgba(0, 0, 0, 0.02)"
                                          : "rgba(255, 255, 255, 0.1)"
                                }
                                showStartIcon={true}
                                textColor={finalTextColor}
                                hoverTextColor={
                                    isOpen ? rowColor : contactHoverColor
                                }
                                grow={true}
                                startIconName="chat-01"
                                label={contactLabel}
                                paddingX={32}
                                borderRadius={0}
                                iconGap={4}
                                style={{ height: 80 }}
                                shapeMode="grow"
                            />
                        </>
                    )}

                    {isPhone && (
                        <TriggerMenu
                            textColor={finalTextColor}
                            iconOpen={iconOpen}
                            toggleMenu={toggleMenu}
                            styles={styles}
                        />
                    )}
                </motion.header>

                {/* Menu Dropdown */}
                <motion.div className="menu" style={styles.menu}>
                    <motion.div
                        style={{
                            ...styles.menuInner,
                            maxHeight: menuMaxHeight,
                        }}
                    >
                        <div
                            style={{
                                ...styles.menuGrid,
                                gridTemplateAreas,
                                gridTemplateColumns,
                            }}
                        >
                            <ListItem key="col1" gridArea="c1" styles={styles}>
                                <LinkList
                                    gridArea="c1"
                                    isPhone={isPhone}
                                    listId="col1"
                                    onItemClick={instantCloseMenu}
                                    title={col1Title}
                                    items={col1Links}
                                    textColor={finalTextColor}
                                    rowColor={rowColor}
                                    currentPath={currentPath}
                                    showIcons={showIcons}
                                    highlightColor={highlightColor}
                                    styles={styles}
                                />
                            </ListItem>

                            <ListItem key="col2" gridArea="c2" styles={styles}>
                                <LinkList
                                    isPhone={isPhone}
                                    listId="col2"
                                    onItemClick={instantCloseMenu}
                                    title={col2Title}
                                    items={col2Links}
                                    textColor={finalTextColor}
                                    rowColor={rowColor}
                                    currentPath={currentPath}
                                    showIcons={showIcons}
                                    highlightColor={highlightColor}
                                    styles={styles}
                                />
                            </ListItem>
                            <ListItem key="col3" gridArea="c3" styles={styles}>
                                <LinkList
                                    isPhone={isPhone}
                                    listId="col4"
                                    onItemClick={instantCloseMenu}
                                    title={col4Title}
                                    items={col4Links}
                                    textColor={finalTextColor}
                                    rowColor={rowColor}
                                    currentPath={currentPath}
                                    showIcons={showIcons}
                                    highlightColor={highlightColor}
                                    styles={styles}
                                />
                                <LinkList
                                    isPhone={isPhone}
                                    listId="col3"
                                    onItemClick={instantCloseMenu}
                                    title={col3Title}
                                    items={col3Links}
                                    textColor={finalTextColor}
                                    rowColor={rowColor}
                                    currentPath={currentPath}
                                    showIcons={showIcons}
                                    highlightColor={highlightColor}
                                    styles={styles}
                                />
                            </ListItem>
                            {!isPhone && showSpotlight && (
                                <ListItem
                                    key="col4"
                                    gridArea="c4"
                                    styles={styles}
                                >
                                    <div
                                        className="nav-links-title"
                                        style={styles.linkListTitle}
                                    >
                                        Partner Spotlight
                                    </div>
                                    <div
                                        style={styles.spotlightContainer(
                                            isPhone,
                                            isTablet
                                        )}
                                        onMouseEnter={() =>
                                            setIsSpotlightHovered(true)
                                        }
                                        onMouseLeave={() =>
                                            setIsSpotlightHovered(false)
                                        }
                                    >
                                        {/* Grow overlay — circle clip-path reveal on hover */}
                                        <motion.div
                                            initial={false}
                                            animate={{
                                                clipPath: isSpotlightHovered
                                                    ? "circle(150% at 0% 100%)"
                                                    : "circle(0% at 0% 100%)",
                                            }}
                                            transition={{
                                                duration: 0.25,
                                                ease: isSpotlightHovered
                                                    ? [0.4, 0, 0.2, 1]
                                                    : "easeInOut" as const,
                                            }}
                                            style={{
                                                position: "absolute",
                                                inset: 0,
                                                backgroundColor:
                                                    "rgba(255, 255, 255, 0.15)",
                                                zIndex: 2,
                                                pointerEvents: "none",
                                                borderRadius: "inherit",
                                                clipPath:
                                                    "circle(0% at 0% 100%)",
                                            }}
                                        />
                                        {spotlightLink ? (
                                            <a
                                                href={spotlightLink}
                                                onClick={() => closeMenu()}
                                                style={{
                                                    position: "absolute",
                                                    inset: 0,
                                                    zIndex: 3,
                                                    cursor: "pointer",
                                                }}
                                                aria-label="View partner spotlight"
                                            />
                                        ) : (
                                            <div
                                                onClick={() => closeMenu()}
                                                style={{
                                                    position: "absolute",
                                                    inset: 0,
                                                    zIndex: 3,
                                                    cursor: "pointer",
                                                }}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => {
                                                    if (
                                                        e.key === "Enter" ||
                                                        e.key === " "
                                                    ) {
                                                        e.preventDefault()
                                                        closeMenu()
                                                    }
                                                }}
                                                aria-label="View partner spotlight"
                                            />
                                        )}
                                        <span style={styles.ctaArrow}>
                                            <DynamicIcon
                                                name="arrow-up-right-01"
                                                color="#ffffff"
                                                size={32}
                                            />
                                        </span>
                                        <CaseStudyCard
                                            backgroundImage={spotlightImageUrl}
                                            logo={logoImage}
                                            cornerRadius={8}
                                            title=""
                                            variant="mobile"
                                            description={spotlightContent}
                                            height="100%"
                                        />
                                    </div>
                                </ListItem>
                            )}

                            {showCTA && (
                                <CTA
                                    style={{ gridArea: "c5" }}
                                    backgroundColor={CTABackgroundColor}
                                    borderColor={CTABorderColor}
                                    textColor={CTATextColor}
                                    text={CTAText || "Schedule A Conversation"}
                                    description={CTADescription || ""}
                                    icon={CTAIcon}
                                    href={link4}
                                    isPhone={isPhone}
                                    isTablet={isTablet}
                                    styles={styles}
                                />
                            )}
                            {showAi && (
                                <CTA
                                    style={{ gridArea: "c6" }}
                                    backgroundColor={AiBackgroundColor}
                                    borderColor={AiBorderColor}
                                    textColor={AiTextColor}
                                    text={AiText || "A.I. Analysis"}
                                    description={
                                        AiDescription || "Find Out More"
                                    }
                                    icon="artificial-intelligence-04"
                                    href={
                                        "https://consult.rolemodelsoftware.com"
                                    }
                                    isPhone={isPhone}
                                    isTablet={isTablet}
                                    styles={styles}
                                />
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    )
}

NavBar.displayName = "NavBar"
