"use client"

import { useState, useEffect } from "react"
import { TopBar } from "@/components/layout/TopBar"
import { NavigationSidebar } from "@/components/layout/NavigationSidebar"
import { Message01Icon, UserGroupIcon, Database01Icon } from "hugeicons-react"

interface Analytics {
  totalConversations: number
  totalMessages: number
  totalSources: number
  activityByDay: Record<string, { conversations: number; messages: number }>
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  async function loadAnalytics() {
    try {
      const res = await fetch('/api/analytics')
      const data = await res.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}>
        Loading...
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <NavigationSidebar />

        <main style={{
          flex: 1,
          overflow: 'auto',
          padding: 'var(--op-space-large)',
        }}>
          <div style={{ marginBottom: 'var(--op-space-large)' }}>
            <h1 style={{
              fontSize: 'var(--op-font-x-large)',
              fontWeight: 'var(--op-font-weight-bold)',
              margin: 0,
            }}>
              Analytics
            </h1>
            <p style={{
              fontSize: 'var(--op-font-small)',
              color: 'var(--op-color-neutral-on-plus-max)',
              margin: 'var(--op-space-2x-small) 0 0 0',
            }}>
              Track your chatbot&apos;s performance and engagement
            </p>
          </div>

          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--op-space-large)',
            marginBottom: 'var(--op-space-large)',
          }}>
            <div className="card">
              <div className="card-body" style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--op-space-medium)',
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--op-radius-medium)',
                  backgroundColor: 'var(--op-color-primary-base)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <UserGroupIcon className="icon-sm" style={{ color: 'var(--op-color-primary-on-base)' }} />
                </div>
                <div>
                  <div style={{
                    fontSize: 'var(--op-font-2x-large)',
                    fontWeight: 'var(--op-font-weight-bold)',
                  }}>
                    {analytics?.totalConversations || 0}
                  </div>
                  <div style={{
                    fontSize: 'var(--op-font-small)',
                    color: 'var(--op-color-neutral-on-plus-max)',
                  }}>
                    Total Conversations
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body" style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--op-space-medium)',
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--op-radius-medium)',
                  backgroundColor: 'var(--op-color-primary-base)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Message01Icon className="icon-sm" style={{ color: 'var(--op-color-primary-on-base)' }} />
                </div>
                <div>
                  <div style={{
                    fontSize: 'var(--op-font-2x-large)',
                    fontWeight: 'var(--op-font-weight-bold)',
                  }}>
                    {analytics?.totalMessages || 0}
                  </div>
                  <div style={{
                    fontSize: 'var(--op-font-small)',
                    color: 'var(--op-color-neutral-on-plus-max)',
                  }}>
                    Total Messages
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body" style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--op-space-medium)',
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--op-radius-medium)',
                  backgroundColor: 'var(--op-color-primary-base)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Database01Icon className="icon-sm" style={{ color: 'var(--op-color-primary-on-base)' }} />
                </div>
                <div>
                  <div style={{
                    fontSize: 'var(--op-font-2x-large)',
                    fontWeight: 'var(--op-font-weight-bold)',
                  }}>
                    {analytics?.totalSources || 0}
                  </div>
                  <div style={{
                    fontSize: 'var(--op-font-small)',
                    color: 'var(--op-color-neutral-on-plus-max)',
                  }}>
                    Knowledge Sources
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="card-header">
              <h2 style={{ fontSize: 'var(--op-font-large)', margin: 0 }}>
                Activity (Last 7 Days)
              </h2>
            </div>
            <div className="card-body">
              {analytics && Object.keys(analytics.activityByDay).length === 0 ? (
                <p style={{ color: 'var(--op-color-neutral-on-plus-max)', margin: 0 }}>
                  No activity in the last 7 days
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--op-space-small)' }}>
                  {analytics && Object.entries(analytics.activityByDay).map(([date, data]) => (
                    <div
                      key={date}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: 'var(--op-space-small)',
                        borderRadius: 'var(--op-radius-small)',
                        backgroundColor: 'var(--op-color-neutral-plus-eight)',
                      }}
                    >
                      <span style={{ fontSize: 'var(--op-font-small)', fontWeight: 'var(--op-font-weight-bold)' }}>
                        {date}
                      </span>
                      <div style={{ display: 'flex', gap: 'var(--op-space-large)' }}>
                        <span style={{ fontSize: 'var(--op-font-small)', color: 'var(--op-color-neutral-on-plus-max)' }}>
                          {data.conversations} conversations
                        </span>
                        <span style={{ fontSize: 'var(--op-font-small)', color: 'var(--op-color-neutral-on-plus-max)' }}>
                          {data.messages} messages
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
