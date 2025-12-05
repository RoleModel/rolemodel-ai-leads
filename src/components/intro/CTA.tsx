'use client'
import { useState } from 'react'
import { ArrowRight02Icon } from 'hugeicons-react'
import ButtonPill from '@/components/ui/button-animated'
import { PrivacyTermsLinks } from '@/components/ui/PrivacyTermsLinks'
import styles from './cta.module.css'
import { HalftoneSwirl } from '../effects/HalftoneSwirl'

interface CTAProps {
  onSubmit?: (data: { name: string; email: string }) => Promise<void> | void
  hasExistingSession?: boolean
  onContinue?: () => void
}

export function CTA({ onSubmit, hasExistingSession, onContinue }: CTAProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()

    if (onSubmit) {
      setIsLoading(true)
      try {
        await onSubmit({ name, email })
      } catch (error) {
        console.error('Form submission error:', error)
        setIsLoading(false)
        return
      }
    }
  }

  return (
    <section id="get-started" className={styles.cta}>

      <div className={`container ${styles.container}`}>
        <h2 className={styles.title}>
          {hasExistingSession ? (
            <>Welcome back!</>
          ) : (
            <>Ready to find out if <br /> <span className={styles['title-highlight']}>custom software </span>{' '}
              is right for you?</>
          )}
        </h2>
        <p className={styles.subtitle}>
          {hasExistingSession
            ? "You have an active conversation. Pick up where you left off."
            : "Start your assessment now."}
        </p>
        <p className={styles.subtitle}>
          {hasExistingSession ? null : "We'll email you a personalized summary with insights and next steps."}
        </p>

        {hasExistingSession ? (
          <div className={styles.form}>
            <div className={styles['form-card']}>
              <ButtonPill
                label="Continue Conversation"
                iconRight={<ArrowRight02Icon size={20} />}
                variant="brightblue"
                onClick={onContinue}
              />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles['form-card']}>
              <div className={styles['form-fields']}>
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className={styles.input}
                />
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={styles.input}
                />
                <ButtonPill
                  className={styles['form-button']}
                  label={isLoading ? 'Starting...' : 'Start'}
                  iconRight={<ArrowRight02Icon strokeWidth={2} size={20} />}
                  variant="brightblue"
                  onClick={(e) => { void handleSubmit(e) }}
                  disabled={isLoading}
                />
              </div>
            </div>
          </form>
        )}
        {!hasExistingSession ? (
          <div className={styles.footer}>
            <p className={styles['footer-text']}>
              <span className={styles['footer-text-highlight']}>No pressure.</span> This tool is
              designed to help you make the right decision for your business.
            </p>
          </div>
        ) : (
          null
        )}
      </div>
      <div className={styles.halftone}>
        <HalftoneSwirl
          fit="contain"
          alignX="end"
          effectRadius={60}
          effectStrength={0.8}
          smoothing={0.09}
        />
      </div>
      <PrivacyTermsLinks style={{ position: 'absolute', bottom: 'var(--op-space-medium)', right: 'var(--op-space-medium)', display: 'flex', justifyContent: 'flex-end' }} variant="light" className="intro-page__footer-links" />
    </section>
  )
}
