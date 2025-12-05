'use client'

import { Archive01Icon, ChatIcon, Mail01Icon, RotateClockwiseIcon, SlackIcon } from '@hugeicons-pro/core-stroke-standard'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion } from 'motion/react'

import { Button } from '@/components/ui/button'
import { decodeHtmlEntities } from '@/lib/utils'

import { Plan, PlanHeader, PlanContent, PlanFooter, PlanTrigger } from '@/components/ai-elements/plan'
import './LeadSummary.css'

export interface Recommendation {
  title: string
  description?: string
  url?: string
  type?: 'case-study' | 'guide' | 'article' | 'tool' | 'other'
}

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
  alignmentScore?: number // 0-100
  nextSteps?: string[]
  recommendations?: Recommendation[]
}

interface LeadSummaryProps {
  data: LeadSummaryData
  visitorName?: string
  visitorDate?: string
  onEmailShare?: () => void
  onSlackShare?: () => void
  onScheduleConversation?: () => void
  onArchive?: () => void
  isArchived?: boolean
  variant?: 'full' | 'compact'
  animated?: boolean
}

function getScoreClass(score: number): string {
  if (score >= 75) return 'lead-summary__score-fill--high'
  if (score >= 50) return 'lead-summary__score-fill--medium'
  return 'lead-summary__score-fill--low'
}

function getRecommendationTypeLabel(type: Recommendation['type']): string {
  switch (type) {
    case 'case-study': return 'Case Study'
    case 'guide': return 'Guide'
    case 'article': return 'Article'
    case 'tool': return 'Tool'
    default: return 'Resource'
  }
}

export function LeadSummary({
  data,
  visitorName,
  visitorDate,
  onEmailShare,
  onSlackShare,
  onScheduleConversation,
  onArchive,
  isArchived = false,
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
      className="lead-summary"
      variants={containerVariants}
      initial={animated ? 'hidden' : undefined}
      animate={animated ? 'visible' : undefined}
    >
      <Plan>
        <PlanHeader>
          <div>
            <h3 className="lead-summary__header-title">
              {visitorName && visitorName !== 'null' ? visitorName : 'Conversation Summary'}
              {visitorName && visitorName !== 'null' && visitorDate && (
                <span className="lead-summary__header-date">· {visitorDate}</span>
              )}
            </h3>
            <p className="lead-summary__header-subtitle">
              Conversation summary
            </p>
          </div>
          <PlanTrigger />
        </PlanHeader>
        <PlanContent>
          {/* Alignment Score */}
          {data.alignmentScore !== undefined && (
            <Item className="lead-summary_section lead-summary__alignment" variants={itemVariants} >
              <h4 className="lead-summary__section-title">Alignment</h4>
              <div className="lead-summary__score-container">
                <div className="lead-summary__score-bar">
                  <motion.div
                    className={`lead-summary__score-fill ${getScoreClass(data.alignmentScore)}`}
                    initial={animated ? { width: 0 } : undefined}
                    animate={animated ? { width: `${data.alignmentScore}%` } : undefined}
                    transition={animated ? { duration: 0.8, delay: 0.2 } : undefined}
                    style={animated ? undefined : { width: `${data.alignmentScore}%` }}
                  />
                </div>
                <span className="lead-summary__score-label">{data.alignmentScore}%</span>
              </div>
            </Item>
          )}

          {/* Company Info */}
          {(data.companyInfo?.name || data.companyInfo?.size || data.companyInfo?.industry) && (
            <Item className="lead-summary_section" variants={itemVariants}>
              <h4 className="lead-summary__section-title">Company</h4>
              {data.companyInfo.name && (
                <p className="lead-summary__value">{data.companyInfo.name}</p>
              )}
              {(data.companyInfo.industry || data.companyInfo.size) && (
                <p className="lead-summary__value lead-summary__value--muted">
                  {[data.companyInfo.industry, data.companyInfo.size].filter(Boolean).join(' · ')}
                </p>
              )}
            </Item>
          )}


          {/* Budget */}
          {(data.budget?.range || data.budget?.timeline || data.budget?.approved !== undefined) && (
            <Item className="lead-summary_section" variants={itemVariants}>
              <h4 className="lead-summary__section-title">Budget</h4>
              {data.budget.range && (
                <div className="lead-summary__field">
                  <span className="lead-summary__label">Range</span>
                  <p className="lead-summary__value">{data.budget.range}</p>
                </div>
              )}
              {data.budget.timeline && (
                <div className="lead-summary__field">
                  <span className="lead-summary__label">Budget Timeline</span>
                  <p className="lead-summary__value">{data.budget.timeline}</p>
                </div>
              )}
              {data.budget.approved !== undefined && (
                <div className="lead-summary__field">
                  <span className="lead-summary__label">Approved</span>
                  <p className="lead-summary__value">{data.budget.approved ? 'Yes' : 'No'}</p>
                </div>
              )}
            </Item>
          )}

          {/* Need / Problem */}
          {(data.need?.problem || data.need?.currentSolution || (data.need?.painPoints && data.need.painPoints.length > 0)) && (
            <Item className="lead-summary_section" variants={itemVariants}>
              <h4 className="lead-summary__section-title">Need</h4>
              {data.need.problem && (
                <div className="lead-summary__field">
                  <span className="lead-summary__label">Problem</span>
                  <p className="lead-summary__value">{data.need.problem}</p>
                </div>
              )}
              {data.need.currentSolution && (
                <div className="lead-summary__field">
                  <span className="lead-summary__label">Current Solution</span>
                  <p className="lead-summary__value">{data.need.currentSolution}</p>
                </div>
              )}
              {data.need.painPoints && data.need.painPoints.length > 0 && (
                <div className="lead-summary__field">
                  <span className="lead-summary__label">Pain Points</span>
                  <ul className="lead-summary__list">
                    {data.need.painPoints.map((point, i) => (
                      <li key={i} className="lead-summary__list-item">{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Item>
          )}

          {/* Authority */}
          {(data.authority?.role || data.authority?.decisionMaker !== undefined || (data.authority?.stakeholders && data.authority.stakeholders.length > 0)) && (
            <Item className="lead-summary_section" variants={itemVariants}>
              <h4 className="lead-summary__section-title">Authority</h4>
              {data.authority.role && (
                <div className="lead-summary__field">
                  <span className="lead-summary__label">Role</span>
                  <p className="lead-summary__value">{data.authority.role}</p>
                </div>
              )}
              {data.authority.decisionMaker !== undefined && (
                <div className="lead-summary__field">
                  <span className="lead-summary__label">Decision Maker</span>
                  <p className="lead-summary__value">{data.authority.decisionMaker ? 'Yes' : 'No'}</p>
                </div>
              )}
              {data.authority.stakeholders && data.authority.stakeholders.length > 0 && (
                <div className="lead-summary__field">
                  <span className="lead-summary__label">Other Stakeholders</span>
                  <p className="lead-summary__value">{data.authority.stakeholders.join(', ')}</p>
                </div>
              )}
            </Item>
          )}

          {/* Timeline */}
          {(data.timeline?.urgency || data.timeline?.implementationDate) && (
            <Item className="lead-summary_section" variants={itemVariants}>
              <h4 className="lead-summary__section-title">Timeline</h4>
              {data.timeline.urgency && (
                <div className="lead-summary__field">
                  <span className="lead-summary__label">Urgency</span>
                  <p className="lead-summary__value">{data.timeline.urgency}</p>
                </div>
              )}
              {data.timeline.implementationDate && (
                <div className="lead-summary__field">
                  <span className="lead-summary__label">Target Date</span>
                  <p className="lead-summary__value">{data.timeline.implementationDate}</p>
                </div>
              )}
            </Item>
          )}

          {/* Recommendations */}
          {data.recommendations && data.recommendations.length > 0 && (
            <Item className="lead-summary_section" variants={itemVariants}>
              <h4 className="lead-summary__section-title">Recommended Resources</h4>
              <div className="lead-summary__recommendations">
                {data.recommendations.map((rec, i) => (
                  <div key={i} className="lead-summary__recommendation-card">
                    <div className="lead-summary__recommendation-content">
                      {rec.type && (
                        <span className="lead-summary__recommendation-type">
                          {getRecommendationTypeLabel(rec.type)}
                        </span>
                      )}
                      {rec.url ? (
                        <a
                          href={rec.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="lead-summary__recommendation-title"
                        >
                          {decodeHtmlEntities(rec.title)}
                        </a>
                      ) : (
                        <span className="lead-summary__recommendation-title lead-summary__recommendation-title--static">
                          {decodeHtmlEntities(rec.title)}
                        </span>
                      )}
                      {rec.description && (
                        <p className="lead-summary__recommendation-description">{decodeHtmlEntities(rec.description)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Item>
          )}

          {/* Next Steps */}
          {data.nextSteps && data.nextSteps.length > 0 && (
            <Item className="lead-summary_section" variants={itemVariants}>
              <h4 className="lead-summary__section-title">Next Steps</h4>
              <ul className="lead-summary__list">
                {data.nextSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </Item>
          )}
        </PlanContent>

        {/* Share Actions */}
        <PlanFooter>
          {(onEmailShare || onSlackShare || onScheduleConversation || onArchive) && (
            <div className="lead-summary__share-actions">
              {onEmailShare && (
                <Button variant="secondary" onClick={onEmailShare} className="lead-summary__share-button">
                  <HugeiconsIcon icon={Mail01Icon} size={18} />
                  <span>Email this summary</span>
                </Button>
              )}
              {onScheduleConversation && (
                <Button variant="secondary" onClick={onScheduleConversation} className="lead-summary__share-button">
                  <HugeiconsIcon icon={ChatIcon} size={18} />
                  <span>Schedule a conversation</span>
                </Button>
              )}
              {onSlackShare && (
                <Button variant="secondary" onClick={onSlackShare}>
                  <HugeiconsIcon icon={SlackIcon} size={20} />
                  <span>Share to Slack</span>
                </Button>
              )}
              {onArchive && (
                <Button variant="secondary" onClick={onArchive} title={isArchived ? 'Restore' : 'Archive'}>
                  <HugeiconsIcon icon={isArchived ? RotateClockwiseIcon : Archive01Icon} size={18} />
                </Button>
              )}
            </div>
          )}
        </PlanFooter>
      </Plan>
    </Container>
  )
}
