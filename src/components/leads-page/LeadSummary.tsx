'use client'

import { motion } from 'motion/react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Mail01Icon, SlackIcon } from '@hugeicons-pro/core-stroke-standard'
import { Button } from '@/components/ui/button'

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
  onEmailShare?: () => void
  onSlackShare?: () => void
  variant?: 'full' | 'compact'
  animated?: boolean
}

const styles = {
  container: {
    border: '1px solid var(--op-color-border)',
    borderRadius: 'var(--op-radius-large)',
    padding: 'var(--op-space-large)',
    backgroundColor: 'var(--op-color-background)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--op-space-large)',
  },
  title: {
    fontSize: 'var(--op-font-large)',
    fontWeight: 600,
    margin: 0,
  },
  actions: {
    display: 'flex',
    gap: 'var(--op-space-small)',
  },
  section: {
    marginBottom: 'var(--op-space-large)',
  },
  sectionTitle: {
    fontSize: 'var(--op-font-medium)',
    fontWeight: 600,
    marginBottom: 'var(--op-space-small)',
    color: 'var(--op-color-primary-base)',
  },
  field: {
    marginBottom: 'var(--op-space-small)',
  },
  label: {
    fontSize: 'var(--op-font-small)',
    fontWeight: 500,
    color: 'var(--op-color-on-background)',
    opacity: 0.7,
  },
  value: {
    fontSize: 'var(--op-font-small)',
    color: 'var(--op-color-on-background)',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  listItem: {
    fontSize: 'var(--op-font-small)',
    padding: 'var(--op-space-2x-small) 0',
    paddingLeft: 'var(--op-space-medium)',
    position: 'relative' as const,
  },
  scoreContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--op-space-medium)',
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
}

export function LeadSummary({
  data,
  onEmailShare,
  onSlackShare,
  variant = 'full',
  animated = false
}: LeadSummaryProps) {
  const containerVariants = animated ? {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, staggerChildren: 0.1 }
    }
  } : {}

  const itemVariants = animated ? {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  } : {}

  const getQualificationColor = (score?: number) => {
    if (!score) return 'var(--op-color-neutral-base)'
    if (score >= 75) return '#22c55e'
    if (score >= 50) return '#eab308'
    return '#ef4444'
  }

  const getQualificationLabel = (score?: number) => {
    if (!score) return 'Not scored'
    if (score >= 75) return 'High Quality Lead'
    if (score >= 50) return 'Medium Quality Lead'
    return 'Low Quality Lead'
  }

  const Container = animated ? motion.div : 'div'
  const Item = animated ? motion.div : 'div'

  return (
    <Container
      style={styles.container}
      variants={containerVariants}
      initial={animated ? "hidden" : undefined}
      animate={animated ? "visible" : undefined}
    >
      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.title}>Lead Summary</h3>
        <div style={styles.actions}>
          {onEmailShare && (
            <Button variant="ghosticon" onClick={onEmailShare}>
              <HugeiconsIcon icon={Mail01Icon} size={20} />
            </Button>
          )}
          {onSlackShare && (
            <Button variant="ghosticon" onClick={onSlackShare}>
              <HugeiconsIcon icon={SlackIcon} size={20} />
            </Button>
          )}
        </div>
      </div>

      {/* Qualification Score */}
      {data.qualificationScore !== undefined && (
        <Item style={styles.section} variants={itemVariants}>
          <div style={styles.sectionTitle}>Qualification Score</div>
          <div style={styles.scoreContainer}>
            <div style={styles.scoreBar}>
              <div style={{
                height: '100%',
                width: `${data.qualificationScore}%`,
                backgroundColor: getQualificationColor(data.qualificationScore),
                transition: 'width 0.5s ease'
              }} />
            </div>
            <div style={{ ...styles.scoreLabel, color: getQualificationColor(data.qualificationScore) }}>
              {data.qualificationScore}%
            </div>
          </div>
          <div style={{ ...styles.value, marginTop: 'var(--op-space-x-small)', fontSize: 'var(--op-font-x-small)' }}>
            {getQualificationLabel(data.qualificationScore)}
          </div>
        </Item>
      )}

      {/* Company Info */}
      {data.companyInfo && (
        <Item style={styles.section} variants={itemVariants}>
          <div style={styles.sectionTitle}>Company</div>
          {data.companyInfo.name && (
            <div style={styles.field}>
              <div style={styles.label}>Name</div>
              <div style={styles.value}>{data.companyInfo.name}</div>
            </div>
          )}
          {data.companyInfo.industry && (
            <div style={styles.field}>
              <div style={styles.label}>Industry</div>
              <div style={styles.value}>{data.companyInfo.industry}</div>
            </div>
          )}
          {data.companyInfo.size && (
            <div style={styles.field}>
              <div style={styles.label}>Size</div>
              <div style={styles.value}>{data.companyInfo.size}</div>
            </div>
          )}
        </Item>
      )}

      {/* Budget */}
      {data.budget && (
        <Item style={styles.section} variants={itemVariants}>
          <div style={styles.sectionTitle}>Budget</div>
          {data.budget.range && (
            <div style={styles.field}>
              <div style={styles.label}>Range</div>
              <div style={styles.value}>{data.budget.range}</div>
            </div>
          )}
          {data.budget.timeline && (
            <div style={styles.field}>
              <div style={styles.label}>Timeline</div>
              <div style={styles.value}>{data.budget.timeline}</div>
            </div>
          )}
          {data.budget.approved !== undefined && (
            <div style={styles.field}>
              <div style={styles.label}>Status</div>
              <div style={styles.value}>{data.budget.approved ? '✓ Approved' : 'Pending approval'}</div>
            </div>
          )}
        </Item>
      )}

      {/* Authority */}
      {data.authority && (
        <Item style={styles.section} variants={itemVariants}>
          <div style={styles.sectionTitle}>Authority</div>
          {data.authority.role && (
            <div style={styles.field}>
              <div style={styles.label}>Role</div>
              <div style={styles.value}>{data.authority.role}</div>
            </div>
          )}
          {data.authority.decisionMaker !== undefined && (
            <div style={styles.field}>
              <div style={styles.label}>Decision Maker</div>
              <div style={styles.value}>{data.authority.decisionMaker ? 'Yes' : 'No'}</div>
            </div>
          )}
          {data.authority.stakeholders && data.authority.stakeholders.length > 0 && (
            <div style={styles.field}>
              <div style={styles.label}>Other Stakeholders</div>
              <ul style={styles.list}>
                {data.authority.stakeholders.map((stakeholder, i) => (
                  <li key={i} style={styles.listItem}>• {stakeholder}</li>
                ))}
              </ul>
            </div>
          )}
        </Item>
      )}

      {/* Need */}
      {data.need && (
        <Item style={styles.section} variants={itemVariants}>
          <div style={styles.sectionTitle}>Need</div>
          {data.need.problem && (
            <div style={styles.field}>
              <div style={styles.label}>Problem</div>
              <div style={styles.value}>{data.need.problem}</div>
            </div>
          )}
          {data.need.currentSolution && (
            <div style={styles.field}>
              <div style={styles.label}>Current Solution</div>
              <div style={styles.value}>{data.need.currentSolution}</div>
            </div>
          )}
          {data.need.painPoints && data.need.painPoints.length > 0 && (
            <div style={styles.field}>
              <div style={styles.label}>Pain Points</div>
              <ul style={styles.list}>
                {data.need.painPoints.map((point, i) => (
                  <li key={i} style={styles.listItem}>• {point}</li>
                ))}
              </ul>
            </div>
          )}
        </Item>
      )}

      {/* Timeline */}
      {data.timeline && (
        <Item style={styles.section} variants={itemVariants}>
          <div style={styles.sectionTitle}>Timeline</div>
          {data.timeline.urgency && (
            <div style={styles.field}>
              <div style={styles.label}>Urgency</div>
              <div style={styles.value}>{data.timeline.urgency}</div>
            </div>
          )}
          {data.timeline.implementationDate && (
            <div style={styles.field}>
              <div style={styles.label}>Target Implementation</div>
              <div style={styles.value}>{data.timeline.implementationDate}</div>
            </div>
          )}
        </Item>
      )}

      {/* Next Steps */}
      {data.nextSteps && data.nextSteps.length > 0 && (
        <Item style={styles.section} variants={itemVariants}>
          <div style={styles.sectionTitle}>Recommended Next Steps</div>
          <ul style={styles.list}>
            {data.nextSteps.map((step, i) => (
              <li key={i} style={styles.listItem}>• {step}</li>
            ))}
          </ul>
        </Item>
      )}

      {/* Contact Info */}
      {data.contactInfo && variant === 'full' && (
        <Item style={{ ...styles.section, marginBottom: 0 }} variants={itemVariants}>
          <div style={styles.sectionTitle}>Contact Information</div>
          {data.contactInfo.name && (
            <div style={styles.field}>
              <div style={styles.label}>Name</div>
              <div style={styles.value}>{data.contactInfo.name}</div>
            </div>
          )}
          {data.contactInfo.email && (
            <div style={styles.field}>
              <div style={styles.label}>Email</div>
              <div style={styles.value}>{data.contactInfo.email}</div>
            </div>
          )}
          {data.contactInfo.phone && (
            <div style={styles.field}>
              <div style={styles.label}>Phone</div>
              <div style={styles.value}>{data.contactInfo.phone}</div>
            </div>
          )}
        </Item>
      )}
    </Container>
  )
}
