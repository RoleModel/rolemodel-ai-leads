'use client'

import { Button } from '@/components/ui/button'

import './PrivacyTermsLinks.css'

interface PrivacyTermsLinksProps {
  className?: string
  style?: React.CSSProperties
  variant?: 'light' | 'dark'
  /** Use compact mode for widget/iframe contexts with limited space */
  compact?: boolean
}

export function PrivacyTermsLinks({
  className,
  style,
  variant = 'light',
  compact = false,
}: PrivacyTermsLinksProps) {
  const buttonStyle: React.CSSProperties = {
    color:
      variant === 'light'
        ? 'var(--op-color-white)'
        : 'var(--op-color-neutral-on-plus-max)',
  }

  return (
    <div className={className} style={{ ...styles.container, ...style }}>
      <a
        href="https://rolemodelsoftware.com/privacy-policy"
        target="_blank"
        rel="noopener noreferrer"
        style={buttonStyle}
        className="privacy-terms-links__button"
      >
        Privacy
      </a>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'fixed',
    bottom: '0px',
    right: '0px',
    display: 'flex',
    gap: 'var(--op-space-small)',
    zIndex: 50,
  },
}
