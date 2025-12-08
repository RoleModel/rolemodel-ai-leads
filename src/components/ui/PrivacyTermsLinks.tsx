'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

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

  const dialogWidth = compact ? 'calc(100vw - 32px)' : '600px'
  const dialogBodyStyle = compact
    ? { ...styles.dialogBody, ...styles.compactDialogBody }
    : styles.dialogBody

  return (
    <div className={className} style={{ ...styles.container, ...style }}>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            style={buttonStyle}
            className="privacy-terms-links__button"
          >
            Privacy
          </Button>
        </DialogTrigger>
        <DialogContent
          style={{ '--_op-confirm-dialog-width': dialogWidth } as React.CSSProperties}
        >
          <DialogHeader>
            <DialogTitle>Privacy Policy</DialogTitle>
            <DialogDescription>How we handle your information</DialogDescription>
          </DialogHeader>
          <div className="confirm-dialog__body" style={dialogBodyStyle}>
            <p style={styles.section}>
              <strong>Information We Collect</strong>
              <br />
              When you use our chat service, we collect:
            </p>
            <ul style={styles.list}>
              <li>Messages you send during conversations</li>
              <li>Contact information you voluntarily provide (name, email)</li>
              <li>Technical data (IP address, approximate location, browser type)</li>
            </ul>
            <p style={styles.section}>
              <strong>How We Use Your Information</strong>
              <br />
              We use this information to:
            </p>
            <ul style={styles.list}>
              <li>Provide and improve our chat service</li>
              <li>Respond to your inquiries</li>
              <li>Analyze usage patterns to enhance user experience</li>
            </ul>
            <p>
              <strong>Data Retention</strong>
              <br />
              We retain conversation data to provide you with better service and may
              delete it upon request.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            style={buttonStyle}
            className="privacy-terms-links__button"
          >
            Terms
          </Button>
        </DialogTrigger>
        <DialogContent
          style={{ '--_op-confirm-dialog-width': dialogWidth } as React.CSSProperties}
        >
          <DialogHeader>
            <DialogTitle>Terms of Service</DialogTitle>
            <DialogDescription>Guidelines for using our service</DialogDescription>
          </DialogHeader>

          <div className="confirm-dialog__body" style={dialogBodyStyle}>
            <p style={styles.section}>
              <strong>Acceptable Use</strong>
              <br />
              By using this chat service, you agree to:
            </p>
            <ul style={styles.list}>
              <li>Provide accurate information when requested</li>
              <li>Use the service for legitimate business inquiries</li>
              <li>Not attempt to misuse or abuse the service</li>
            </ul>
            <p style={styles.section}>
              <strong>AI-Powered Responses</strong>
              <br />
              This chat service uses artificial intelligence. While we strive for
              accuracy, responses may not always be complete or error-free. For critical
              decisions, please verify information with our team.
            </p>
            <p>
              <strong>Limitation of Liability</strong>
              <br />
              We provide this service &quot;as is&quot; without warranties. We are not
              liable for any damages arising from use of this service.
            </p>
          </div>
        </DialogContent>
      </Dialog>
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
  dialogBody: {
    fontSize: 'var(--op-font-small)',
    lineHeight: 1.6,
  },
  section: {
    marginBottom: 'var(--op-space-medium)',
  },
  list: {
    paddingLeft: 'var(--op-space-large)',
    marginBottom: 'var(--op-space-medium)',
  },
  compactDialogBody: {
    maxHeight: '50vh',
    overflowY: 'auto' as const,
    fontSize: 'var(--op-font-x-small)',
  },
}
