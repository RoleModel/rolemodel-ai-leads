'use client'

import { Calendar03Icon, Mail01Icon, SlackIcon } from '@hugeicons-pro/core-stroke-standard'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion } from 'motion/react'

import { Button } from '@/components/ui/button'

import { Plan, PlanHeader, PlanContent, PlanFooter } from '@/components/ai-elements/plan'

export interface LeadSummaryData {
  // BANT Framework
  budget?: {
    range?: string
    timeline?: string
    approved?: boolean
  }
  authority?: {
    role?: string
    decisionMaker?: boolean
    stakeholders?: string[]
  }
  need?: {
    problem?: string
    currentSolution?: string
    painPoints?: string[]
  }
  timeline?: {
    urgency?: string
    implementationDate?: string
  }

  // Additional context
  companyInfo?: {
    name?: string
    size?: string
    industry?: string
  }
  contactInfo?: {
    name?: string
    email?: string
    phone?: string
  }
  qualificationScore?: number // 0-100
  nextSteps?: string[]
}

interface LeadSummaryProps {
  data: LeadSummaryData
  visitorName?: string
  visitorDate?: string
  onEmailShare?: () => void
  onSlackShare?: () => void
  onScheduleConversation?: () => void
  variant?: 'full' | 'compact'
  animated?: boolean
}

const styles = {
  container: {
    width: '100%',
    backgroundColor: 'var(--op-color-background)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--op-space-medium)',
  },
  title: {
    fontSize: 'var(--op-font-small)',
    fontWeight: 600,
    margin: 0,
    textAlign: 'left' as const,
  },
  subtitle: {
    fontSize: 'var(--op-font-small)',
    color: 'var(--op-color-neutral-on-plus-max)',
    marginBottom: 'var(--op-space-large)',
    textAlign: 'left' as const,
    lineHeight: 1.6,
    margin: '0 0 var(--op-space-x-large) 0',
  },
  actions: {
    display: 'flex',
    gap: 'var(--op-space-small)',
  },
  section: {
    marginBottom: 'var(--op-space-medium)',
  },
  sectionTitle: {
    fontSize: 'var(--op-font-small)',
    fontWeight: 600,
    marginBottom: 'var(--op-space-small)',
    textAlign: 'left' as const,
  },
  field: {
    marginBottom: 'var(--op-space-small)',
  },
  label: {
    fontSize: 'var(--op-font-small)',
    fontWeight: 500,
    color: 'var(--op-color-on-background)',
    opacity: 0.7,
    textAlign: 'left' as const,
  },
  value: {
    fontSize: 'var(--op-font-small)',
    color: 'var(--op-color-on-background)',
    margin: 0,
    textAlign: 'left' as const,
    lineHeight: 1.6,
  },
  list: {
    fontSize: 'var(--op-font-small)',
    margin: 0,
    paddingLeft: 'var(--op-space-large)',
    textAlign: 'left' as const,
    lineHeight: 2,
  },
  listItem: {
    fontSize: 'var(--op-font-small)',
    textAlign: 'left' as const,
  },
  scoreContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--op-space-small)',
  },
  scoreBar: {
    flex: 1,
    height: '8px',
    backgroundColor: 'var(--op-color-neutral-plus-six)',
    borderRadius: 'var(--op-radius-pill)',
    overflow: 'hidden',
  },
  scoreLabel: {
    fontSize: 'var(--op-font-small)',
    fontWeight: 600,
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--op-space-large)',
  },
  shareActionsContainer: {
    marginTop: 'var(--op-space-x-large)',
    paddingTop: 'var(--op-space-x-large)',
    borderTop: '1px solid var(--op-color-border)',
  },
  shareButtonsGroup: {
    display: 'flex',
    gap: 'var(--op-space-small)',
  },
  emailButton: {
    flex: 1,
  },
}

export function LeadSummary({
  data,
  visitorName,
  visitorDate,
  onEmailShare,
  onSlackShare,
  onScheduleConversation,
  animated = false,
}: LeadSummaryProps) {
  const containerVariants = animated
    ? {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, staggerChildren: 0.1 },
      },
    }
    : undefined

  const itemVariants = animated
    ? {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0 },
    }
    : undefined

  const Container = animated ? motion.div : 'div'
  const Item = animated ? motion.div : 'div'

  return (
    <Container
      style={styles.container}
      variants={containerVariants}
      initial={animated ? 'hidden' : undefined}
      animate={animated ? 'visible' : undefined}
    >
      <Plan>
        <PlanHeader>
          <div>
            <h3 style={{ fontSize: 'var(--op-font-large)', fontWeight: 600, margin: 0 }}>
              {visitorName && visitorName !== 'null' ? visitorName : 'Conversation Summary'}
              {visitorName && visitorName !== 'null' && visitorDate && (
                <span style={{ fontWeight: 400, fontSize: 'var(--op-font-medium)', color: 'var(--op-color-neutral-on-plus-max)', marginLeft: 'var(--op-space-small)' }}>
                  · {visitorDate}
                </span>
              )}
            </h3>
            <p style={{ fontSize: 'var(--op-font-medium)', color: 'var(--op-color-neutral-on-plus-max)', margin: 'var(--op-space-x-small) 0 0 0', lineHeight: 1.6 }}>
              Based on our discussion, here&apos;s what we covered and the recommended next steps.
            </p>
          </div>
        </PlanHeader>

        <PlanContent>
          {/* Qualification Score */}
          {data.qualificationScore !== undefined && (
            <Item variants={itemVariants}>
              <h4 style={styles.sectionTitle}>Qualification Score</h4>
              <div style={styles.scoreContainer}>
                <div style={styles.scoreBar}>
                  <motion.div
                    initial={animated ? { width: 0 } : undefined}
                    animate={animated ? { width: `${data.qualificationScore}%` } : undefined}
                    transition={animated ? { duration: 0.8, delay: 0.2 } : undefined}
                    style={{
                      width: animated ? undefined : `${data.qualificationScore}%`,
                      height: '100%',
                      backgroundColor:
                        data.qualificationScore >= 75
                          ? 'var(--op-color-alerts-notice-base)'
                          : data.qualificationScore >= 50
                            ? 'var(--op-color-alerts-warning-base)'
                            : 'var(--op-color-alerts-danger-base)',
                      borderRadius: 'var(--op-radius-pill)',
                    }}
                  />
                </div>
                <span style={styles.scoreLabel}>{data.qualificationScore}%</span>
              </div>
            </Item>
          )}

          {/* Timeline */}
          {(data.timeline?.urgency || data.timeline?.implementationDate) && (
            <Item variants={itemVariants}>
              <h4 style={styles.sectionTitle}>Timeline</h4>
              <p style={styles.value}>
                {data.timeline.implementationDate
                  ? `Looking to have a solution in place ${data.timeline.implementationDate}.`
                  : data.timeline.urgency}
              </p>
            </Item>
          )}

          {/* Next Steps */}
          {data.nextSteps && data.nextSteps.length > 0 && (
            <Item variants={itemVariants}>
              <h4 style={styles.sectionTitle}>Next Steps</h4>
              <ul style={styles.list}>
                {data.nextSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </Item>
          )}
        </PlanContent>

        {/* Share Actions */}
        <PlanFooter>
          {(onEmailShare || onSlackShare || onScheduleConversation) && (
            <div style={styles.shareButtonsGroup}>
              {onEmailShare && (
                <Button variant="secondary" onClick={onEmailShare} style={styles.emailButton}>
                  <HugeiconsIcon icon={Mail01Icon} size={18} />
                  <span>Email me this summary</span>
                </Button>
              )}
              {onScheduleConversation && (
                <Button
                  variant="secondary"
                  onClick={onScheduleConversation}
                  style={styles.emailButton}
                >
                  <HugeiconsIcon icon={Calendar03Icon} size={18} />
                  <span>Schedule a conversation</span>
                </Button>
              )}
              {onSlackShare && (
                <Button variant="secondary" onClick={onSlackShare}>
                  <HugeiconsIcon icon={SlackIcon} size={20} />
                  <span>Share to Slack</span>
                </Button>
              )}
            </div>
          )}
        </PlanFooter>
      </Plan>
    </Container >
  )
}
