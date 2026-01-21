'use client'

import {
  Calendar03Icon,
  Download01Icon,
  FilterIcon,
  RefreshIcon,
} from '@hugeicons-pro/core-stroke-standard'
import { HugeiconsIcon } from '@hugeicons/react'
import { useCallback, useEffect, useState } from 'react'
import { Suspense } from 'react'

import { NavigationSidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { LeadSummary, LeadSummaryData } from '@/components/leads-page/LeadSummary'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Lead {
  id: string
  conversation_id: string
  visitor_name: string | null
  visitor_email: string | null
  created_at: string
  summary: LeadSummaryData
  is_archived: boolean | null
  archived_at: string | null
}

type ArchiveFilter = 'active' | 'archived' | 'all'

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [archiveFilter, setArchiveFilter] = useState<ArchiveFilter>('active')
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  })

  const loadLeads = useCallback(async () => {
    setIsLoading(true)
    try {
      const archiveParam =
        archiveFilter === 'archived' ? 'true' : archiveFilter === 'all' ? 'all' : 'false'
      const res = await fetch(
        `/api/leads?startDate=${dateRange.start}&endDate=${dateRange.end}&archived=${archiveParam}`
      )
      const data = await res.json()
      setLeads(data.leads || [])
    } catch (error) {
      console.error('Error loading leads:', error)
    } finally {
      setIsLoading(false)
    }
  }, [dateRange, archiveFilter])

  useEffect(() => {
    loadLeads()
  }, [loadLeads])

  async function handleExport() {
    try {
      const res = await fetch(
        `/api/leads/export?startDate=${dateRange.start}&endDate=${dateRange.end}`
      )
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `leads-${dateRange.start}-to-${dateRange.end}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting leads:', error)
    }
  }

  async function handleEmailShare(lead: Lead) {
    try {
      await fetch('/api/leads/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          method: 'email',
        }),
      })
      alert('Lead summary sent via email')
    } catch (error) {
      console.error('Error sharing via email:', error)
      alert('Failed to send email')
    }
  }

  async function handleSlackShare(lead: Lead) {
    try {
      await fetch('/api/leads/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          method: 'slack',
        }),
      })
      alert('Lead summary shared to Slack')
    } catch (error) {
      console.error('Error sharing to Slack:', error)
      alert('Failed to share to Slack')
    }
  }

  async function handleArchive(leadId: string, archive: boolean) {
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, is_archived: archive }),
      })
      if (res.ok) {
        loadLeads()
      }
    } catch (error) {
      console.error('Error archiving lead:', error)
    }
  }

  return (
    <div className="admin-page">
      <TopBar />

      <div className="admin-page__body">
        <Suspense fallback={<div>Loading...</div>}>
          <NavigationSidebar />
        </Suspense>

        <main className="admin-page__main">
          <header className="admin-header">
            <div className="admin-header__top">
              <div>
                <h1 className="admin-header__title">Leads</h1>
              </div>
              <div className="admin-header__actions">
                <Button variant="ghosticon" onClick={loadLeads}>
                  <HugeiconsIcon icon={RefreshIcon} size={20} />
                </Button>
                <Button variant="primary" onClick={handleExport}>
                  <HugeiconsIcon icon={Download01Icon} size={20} />
                  Export
                </Button>
              </div>
            </div>

            <div className="admin-filters">
              <div className="admin-filters__group">
                <HugeiconsIcon
                  icon={FilterIcon}
                  size={16}
                  className="admin-list-item__icon"
                />
                <span className="admin-filters__label admin-filters__label--bold">
                  Filters
                </span>
              </div>
              <div className="admin-filters__date-picker">
                <HugeiconsIcon icon={Calendar03Icon} size={16} />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, start: e.target.value }))
                  }
                  className="admin-filters__date-input"
                />
                <span className="admin-filters__separator">to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, end: e.target.value }))
                  }
                  className="admin-filters__date-input"
                />
              </div>

              <div className="admin-filters__group">
                <span className="admin-filters__label">Show:</span>
                <div className="admin-filters__buttons">
                  {(['active', 'archived', 'all'] as const).map((filter) => (
                    <Button
                      key={filter}
                      variant={archiveFilter === filter ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setArchiveFilter(filter)}
                      className="admin-filters__button"
                    >
                      {filter}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </header>

          <ScrollArea style={{ flex: 1, minHeight: 0 }}>
            <div className="admin-content">
              {isLoading ? (
                <p className="admin-loading">Loading leads...</p>
              ) : leads.length === 0 ? (
                <div className="admin-empty">
                  <p className="admin-empty__title">
                    No leads found for the selected date range
                  </p>
                  <p className="admin-empty__description">
                    Try adjusting your date range or check back later
                  </p>
                </div>
              ) : (
                <div className="admin-content__list admin-content__list--large-gap">
                  {leads.map((lead) => (
                    <div
                      key={lead.id}
                      className={`admin-card-wrapper ${
                        lead.is_archived ? 'admin-card-wrapper--archived' : ''
                      }`}
                    >
                      <LeadSummary
                        data={lead.summary}
                        visitorName={
                          lead.visitor_name || lead.visitor_email || 'Anonymous'
                        }
                        visitorDate={new Date(lead.created_at).toLocaleDateString()}
                        onEmailShare={() => handleEmailShare(lead)}
                        onSlackShare={() => handleSlackShare(lead)}
                        onArchive={() => handleArchive(lead.id, !lead.is_archived)}
                        isArchived={lead.is_archived ?? false}
                        variant="full"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  )
}
