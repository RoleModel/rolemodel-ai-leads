import { File02Icon } from 'hugeicons-react'

import { Button } from '@/components/ui/button'

interface VisitorMetadata {
  ip?: string
  geo?: {
    country?: string
    countryCode?: string
    region?: string
    city?: string
    timezone?: string
  }
  userAgent?: string
  referer?: string
  timestamp?: string
}

interface Conversation {
  id: string
  visitor_id: string | null
  visitor_name: string | null
  visitor_email: string | null
  visitor_metadata: VisitorMetadata | null
  started_at: string
  last_message_at: string
  message_count: number
  lead_captured: boolean
  is_archived: boolean | null
  archived_at: string | null
}

export function getLocationString(metadata: VisitorMetadata | null) {
  if (!metadata?.geo) return null
  return [metadata.geo.city, metadata.geo.region, metadata.geo.country]
    .filter(Boolean)
    .join(', ')
}

export function VisitorDetailsCard({
  conversation,
  onViewLead,
}: {
  conversation: Conversation
  onViewLead: (conversationId: string) => void
}) {
  return (
    <div className="admin-info-card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h3 className="admin-info-card__title" style={{ margin: 0 }}>
          Visitor Details
        </h3>
        {conversation.lead_captured && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onViewLead(conversation.id)}
          >
            <File02Icon className="icon-sm" />
            View Lead
          </Button>
        )}
      </div>
      <div className="admin-info-card__grid">
        {conversation.visitor_name && (
          <div className="admin-info-card__field">
            <span className="admin-info-card__label">Name</span>
            <p className="admin-info-card__value">{conversation.visitor_name}</p>
          </div>
        )}
        {conversation.visitor_email && (
          <div className="admin-info-card__field">
            <span className="admin-info-card__label">Email</span>
            <p className="admin-info-card__value">{conversation.visitor_email}</p>
          </div>
        )}
        {conversation.visitor_metadata?.geo && (
          <div className="admin-info-card__field">
            <span className="admin-info-card__label">Location</span>
            <p className="admin-info-card__value">
              {getLocationString(conversation.visitor_metadata) || 'Unknown'}
            </p>
          </div>
        )}
        {conversation.visitor_metadata?.ip && (
          <div className="admin-info-card__field">
            <span className="admin-info-card__label">IP Address</span>
            <p className="admin-info-card__value admin-info-card__value--mono">
              {conversation.visitor_metadata.ip}
            </p>
          </div>
        )}
        {conversation.visitor_metadata?.geo?.timezone && (
          <div className="admin-info-card__field">
            <span className="admin-info-card__label">Timezone</span>
            <p className="admin-info-card__value">
              {conversation.visitor_metadata.geo.timezone}
            </p>
          </div>
        )}
        {conversation.visitor_metadata?.referer && (
          <div className="admin-info-card__field">
            <span className="admin-info-card__label">Referrer</span>
            <p
              className="admin-info-card__value admin-info-card__value--truncate"
              title={conversation.visitor_metadata.referer}
            >
              {conversation.visitor_metadata.referer}
            </p>
          </div>
        )}
        <div className="admin-info-card__field">
          <span className="admin-info-card__label">Started</span>
          <p className="admin-info-card__value">
            {new Date(conversation.started_at).toLocaleString()}
          </p>
        </div>
        <div className="admin-info-card__field">
          <span className="admin-info-card__label">Status</span>
          <p className="admin-info-card__value">
            {conversation.lead_captured ? (
              <span className="admin-info-card__value--positive">Lead Captured</span>
            ) : (
              <span className="admin-info-card__value--muted">Browsing</span>
            )}
          </p>
        </div>
      </div>
      {conversation.visitor_metadata?.userAgent && (
        <div className="admin-info-card__section">
          <span className="admin-info-card__label">Browser</span>
          <p
            className="admin-info-card__value admin-info-card__value--truncate"
            title={conversation.visitor_metadata.userAgent}
          >
            {conversation.visitor_metadata.userAgent}
          </p>
        </div>
      )}
    </div>
  )
}
