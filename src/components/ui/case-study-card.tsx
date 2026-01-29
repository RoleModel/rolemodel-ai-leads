'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

import { cn } from '@/lib/utils'

export interface CaseStudyCardProps {
  /** URL to navigate to when card is clicked */
  url?: string
  /** Title of the case study */
  title?: string
  /** Description/summary of the case study */
  description?: string
  /** Background image URL */
  backgroundImage?: string
  /** Client logo URL */
  logo?: string
  /** Corner radius in pixels */
  cornerRadius?: number
  /** Mobile breakpoint in pixels */
  mobileBreakpoint?: number
  /** Overlay color as RGB values (e.g., "4,36,43") */
  overlayColor?: string
  /** Force a specific variant instead of auto-detecting. Defaults to 'mobile' so text is always visible */
  variant?: 'auto' | 'idle' | 'hover' | 'mobile'
  /** Additional CSS classes */
  className?: string
  /** Loading state */
  isLoading?: boolean
}

const contentVariants = {
  idle: { opacity: 0, y: 50, height: 0 },
  hover: { opacity: 1, y: 0, height: 'auto' },
  mobile: { opacity: 1, y: 0, height: 'auto' },
}

export const CaseStudyCard = ({
  url,
  title = 'Case Study',
  description = 'Project description goes here.',
  backgroundImage,
  logo,
  cornerRadius = 8,
  mobileBreakpoint = 390,
  overlayColor = '4,36,43',
  variant = 'mobile',
  className,
  isLoading = false,
}: CaseStudyCardProps) => {
  const [isMobile, setIsMobile] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)

  // Don't use defaults - only show images when we have actual data
  const imageSrc = backgroundImage
  const logoSrc = logo

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= mobileBreakpoint)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [mobileBreakpoint])

  const handleClick = () => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick()
    }
  }

  const getVariant = () => {
    if (variant !== 'auto') return variant
    if (isMobile) return 'mobile'
    if (isHovered) return 'hover'
    return 'idle'
  }

  const currentVariant = getVariant()

  const overlayGradient =
    currentVariant === 'hover'
      ? `linear-gradient(to top, rgba(${overlayColor},1) 0%, rgba(${overlayColor},0.9) 50%, rgba(${overlayColor},0.9) 100%)`
      : `linear-gradient(to top, rgba(${overlayColor},1) 0%, rgba(${overlayColor},0.25) 100%)`

  if (isLoading) {
    return (
      <div
        className={cn(className)}
        style={{
          position: 'relative',
          height: 320,
          width: '100%',
          overflow: 'hidden',
          borderRadius: cornerRadius,
          backgroundColor: '#e5e7eb',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, #d1d5db, transparent)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: 24,
            right: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div
            style={{
              height: 24,
              width: 128,
              borderRadius: 4,
              backgroundColor: '#d1d5db',
            }}
          />
          <div
            style={{
              height: 16,
              width: 192,
              borderRadius: 4,
              backgroundColor: '#d1d5db',
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      aria-label={`View case study: ${title}`}
      className={cn(className)}
      initial={false}
      animate={currentVariant}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      style={{
        position: 'relative',
        height: 320,
        width: '100%',
        borderRadius: cornerRadius,
        overflow: 'clip',
        cursor: url ? 'pointer' : 'default',
        backgroundColor: `rgb(${overlayColor})`,
      }}
      tabIndex={url ? 0 : -1}
    >
      {/* Background Image - only render if we have an image */}
      {imageSrc && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${imageSrc})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Dark overlay */}
      <motion.div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: overlayGradient,
          pointerEvents: 'none',
        }}
      />

      {/* Content container - uses flexbox for reliable bottom-left positioning */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
          padding: 24,
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        {/* Logo - only render if we have an actual logo */}
        {logoSrc && (
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            style={{
              marginBottom: 12,
              height: 60,
              width: 200
            }}
          >
            <Image
              src={logoSrc}
              alt="Client Logo"
              width={200}
              height={60}
              objectFit="contain"
              layout="responsive"
            />
          </motion.div>
        )}

        {/* Title */}
        {title && (
          <h3
            style={{
              margin: 0,
              marginBottom: 8,
              fontFamily: 'var(--op-font-family, sans-serif)',
              fontWeight: 600,
              lineHeight: 1.2,
              color: 'white',
              fontSize: currentVariant === 'mobile' ? 20 : 28,
            }}
          >
            {title}
          </h3>
        )}

        {/* Description */}
        <motion.div
          style={{
            maxWidth: 512,
            fontFamily: 'var(--op-font-sans, sans-serif)',
            fontWeight: 500,
            lineHeight: 1.5,
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: currentVariant === 'mobile' ? 14 : 16,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          variants={contentVariants}
        >
          {description}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default CaseStudyCard
