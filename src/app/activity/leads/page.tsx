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

import { NavigationSidebar } from '@/components/layout/NavigationSidebar'
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
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  })

  const loadLeads = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(
        `/api/leads?startDate=${dateRange.start}&endDate=${dateRange.end}`
      )
      const data = await res.json()
      setLeads(data.leads || [])
    } catch (error) {
      console.error('Error loading leads:', error)
    } finally {
      setIsLoading(false)
    }
  }, [dateRange])

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Suspense fallback={<div>Loading...</div>}>
          <NavigationSidebar />
        </Suspense>

        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            height: '100%',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: 'var(--op-space-large)',
              borderBottom: '1px solid var(--op-color-border)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--op-space-medium)',
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: 'var(--op-font-x-large)',
                    fontWeight: 'var(--op-font-weight-bold)',
                    margin: 0,
                  }}
                >
                  Leads
                </h1>
              </div>
              <div style={{ display: 'flex', gap: 'var(--op-space-small)' }}>
                <Button variant="ghosticon" onClick={loadLeads}>
                  <HugeiconsIcon icon={RefreshIcon} size={20} />
                </Button>
                <Button variant="primary" onClick={handleExport}>
                  <HugeiconsIcon icon={Download01Icon} size={20} />
                  Export
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--op-space-medium)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--op-space-x-small)',
                }}
              >
                <HugeiconsIcon
                  icon={FilterIcon}
                  size={16}
                  style={{ color: 'var(--op-color-neutral-on-plus-max)' }}
                />
                <span style={{ fontSize: 'var(--op-font-small)', fontWeight: 600 }}>
                  Filters
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--op-space-small)',
                  padding: 'var(--op-space-x-small) var(--op-space-small)',
                  border: '1px solid var(--op-color-border)',
                  borderRadius: 'var(--op-radius-medium)',
                  backgroundColor: 'var(--op-color-background)',
                }}
              >
                <HugeiconsIcon icon={Calendar03Icon} size={16} />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, start: e.target.value }))
                  }
                  style={{
                    fontSize: 'var(--op-font-small)',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--op-color-on-background)',
                  }}
                />
                <span style={{ fontSize: 'var(--op-font-small)' }}>to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                  style={{
                    fontSize: 'var(--op-font-small)',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--op-color-on-background)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Leads List */}
          <ScrollArea style={{ flex: 1, minHeight: 0 }}>
            <div style={{ padding: 'var(--op-space-large)' }}>
              {isLoading ? (
                <p
                  style={{
                    color: 'var(--op-color-neutral-on-plus-max)',
                    textAlign: 'center',
                    padding: 'var(--op-space-x-large)',
                  }}
                >
                  Loading leads...
                </p>
              ) : leads.length === 0 ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--op-space-x-large)',
                    textAlign: 'center',
                    color: 'var(--op-color-neutral-on-plus-max)',
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: 'var(--op-font-medium)',
                      fontWeight: 600,
                    }}
                  >
                    No leads found for the selected date range
                  </p>
                  <p
                    style={{
                      margin: 'var(--op-space-small) 0 0 0',
                      fontSize: 'var(--op-font-small)',
                    }}
                  >
                    Try adjusting your date range or check back later
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--op-space-large)',
                  }}
                >
                  {leads.map((lead) => (
                    <LeadSummary
                      key={lead.id}
                      data={lead.summary}
                      visitorName={lead.visitor_name || lead.visitor_email || 'Anonymous'}
                      visitorDate={new Date(lead.created_at).toLocaleDateString()}
                      onEmailShare={() => handleEmailShare(lead)}
                      onSlackShare={() => handleSlackShare(lead)}
                      variant="full"
                    />
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
