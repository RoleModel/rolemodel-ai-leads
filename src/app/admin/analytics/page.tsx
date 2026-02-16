'use client'

import {
  Database01Icon,
  Link01Icon,
  Location01Icon,
  Message01Icon,
  Target01Icon,
  UserGroupIcon,
} from 'hugeicons-react'
import { useEffect, useState } from 'react'
import { Suspense } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { NavigationSidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'

interface VisitorAnalytics {
  visitorsWithMetadata: number
  visitorsWithLocation: number
  topStates: { state: string; count: number }[]
  topCities: { city: string; count: number }[]
  topReferrers: { referrer: string; count: number }[]
}

interface EngagementLevels {
  bounced: number
  low: number
  medium: number
  high: number
}

interface FunnelAnalytics {
  started: number
  engaged: number
  contactCaptured: number
  qualified: number
  engagementRate: string
  contactCaptureRate: string
  qualificationRate: string
}

interface TrendDataPoint {
  date: string
  conversations: number
  messages: number
  leads: number
}

interface RadarDataPoint {
  metric: string
  value: number
  fullMark: number
}

interface Analytics {
  totalConversations: number
  totalMessages: number
  totalSources: number
  totalLeads: number
  trendData: TrendDataPoint[]
  visitorAnalytics?: VisitorAnalytics
  engagementLevels?: EngagementLevels
  funnelAnalytics?: FunnelAnalytics
  engagementRadarData?: RadarDataPoint[]
}

// Stat card with sparkline
function StatCard({
  title,
  value,
  icon: Icon,
  color,
  iconColor,
  sparklineData,
  dataKey,
  change,
}: {
  title: string
  value: number
  icon: typeof UserGroupIcon
  color: string
  iconColor: string
  sparklineData: TrendDataPoint[]
  dataKey: 'conversations' | 'messages' | 'leads'
  change?: number
}) {
  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div
        className="card-body"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          paddingBottom: 0,
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--op-space-small)',
              marginBottom: 'var(--op-space-x-small)',
            }}
          >
            <span
              style={{
                fontSize: 'var(--op-font-small)',
                color: 'var(--op-color-on-background)',
              }}
            >
              {title}
            </span>
          </div>
          <div
            style={{
              fontSize: 'var(--op-font-3x-large)',
              fontWeight: 'var(--op-font-weight-bold)',
            }}
          >
            {value.toLocaleString()}
          </div>
          {change !== undefined && (
            <div
              style={{
                fontSize: 'var(--op-font-x-small)',
                color:
                  change >= 0
                    ? 'var(--op-color-alerts-notice-base)'
                    : 'var(--op-color-alerts-negative-base)',
                marginTop: 'var(--op-space-2x-small)',
              }}
            >
              {change >= 0 ? '+' : ''}
              {change}% from previous
            </div>
          )}
        </div>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--op-radius-medium)',
            backgroundColor: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon className="icon-sm" strokeWidth={2} style={{ color: iconColor }} />
        </div>
      </div>
      {/* Sparkline area chart */}
      <div style={{ height: '80px', marginTop: 'var(--op-space-small)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={sparklineData}
            margin={{ top: 10, right: 0, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${dataKey})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        Loading...
      </div>
    )
  }

  const trendData = analytics?.trendData || []
  const engagementRadarData = analytics?.engagementRadarData || []

  // Prepare funnel data for bar chart
  const funnelChartData = analytics?.funnelAnalytics
    ? [
        {
          stage: 'Started',
          count: analytics.funnelAnalytics.started,
          fill: 'var(--op-color-primary-plus-two)',
        },
        {
          stage: 'Engaged',
          count: analytics.funnelAnalytics.engaged,
          fill: 'var(--op-color-primary-base)',
        },
        {
          stage: 'Contact',
          count: analytics.funnelAnalytics.contactCaptured,
          fill: 'var(--op-color-primary-minus-two)',
        },
        {
          stage: 'Qualified',
          count: analytics.funnelAnalytics.qualified,
          fill: 'var(--op-color-alerts-notice-base)',
        },
      ]
    : []

  // Engagement breakdown for pie/bar chart
  const engagementBreakdownData = analytics?.engagementLevels
    ? [
        {
          name: 'Bounced',
          value: analytics.engagementLevels.bounced,
          fill: 'var(--purple-200, #3c194a)',
        },
        {
          name: 'Low',
          value: analytics.engagementLevels.low,
          fill: 'var(--orange, #ffcd74)',
        },
        {
          name: 'Medium',
          value: analytics.engagementLevels.medium,
          fill: 'var(--light-blue, #87d4e9)',
        },
        {
          name: 'High',
          value: analytics.engagementLevels.high,
          fill: 'var(--light-green, #86c774)',
        },
      ]
    : []

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
            overflow: 'auto',
            padding: 'var(--op-space-large)',
          }}
        >
          <div style={{ marginBottom: 'var(--op-space-large)' }}>
            <h1
              style={{
                fontSize: 'var(--op-font-x-large)',
                fontWeight: 'var(--op-font-weight-bold)',
                margin: 0,
              }}
            >
              Analytics
            </h1>
            <p
              style={{
                fontSize: 'var(--op-font-small)',
                color: 'var(--op-color-on-background)',
                margin: 'var(--op-space-2x-small) 0 0 0',
              }}
            >
              Track your chatbot&apos;s performance and engagement
            </p>
          </div>

          {/* Stat Cards with Sparklines */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'var(--op-space-large)',
              marginBottom: 'var(--op-space-x-large)',
            }}
          >
            <StatCard
              title="Total Conversations"
              value={analytics?.totalConversations || 0}
              icon={UserGroupIcon}
              color="var(--light-blue, #87d4e9)"
              iconColor="var(--op-color-black)"
              sparklineData={trendData}
              dataKey="conversations"
            />
            <StatCard
              title="Qualified Leads"
              value={analytics?.totalLeads || 0}
              icon={Target01Icon}
              color="var(--light-green, #86c774)"
              iconColor="var(--op-color-black)"
              sparklineData={trendData}
              dataKey="leads"
            />
            <StatCard
              title="Total Messages"
              value={analytics?.totalMessages || 0}
              icon={Message01Icon}
              color="var(--orange, #ffcd74)"
              iconColor="var(--op-color-black)"
              sparklineData={trendData}
              dataKey="messages"
            />
            <StatCard
              title="Knowledge Sources"
              value={analytics?.totalSources || 0}
              icon={Database01Icon}
              color="var(--op-color-neutral-base)"
              iconColor="var(--op-color-white)"
              sparklineData={[]}
              dataKey="conversations"
            />
          </div>

          {/* Charts Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: 'var(--op-space-large)',
              marginBottom: 'var(--op-space-x-large)',
            }}
          >
            {/* Radar Chart - Engagement Metrics */}
            <div className="card">
              <div className="card__header">
                <h2 style={{ fontSize: 'var(--op-font-large)', margin: 0 }}>
                  Engagement Metrics Overview
                </h2>
              </div>
              <div className="card-body">
                <div style={{ height: '350px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={engagementRadarData}>
                      <PolarGrid stroke="var(--op-color-border)" />
                      <PolarAngleAxis
                        dataKey="metric"
                        tick={{ fontSize: 12, fill: 'var(--op-color-on-background)' }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fontSize: 10, fill: 'var(--op-color-on-background)' }}
                      />
                      <Radar
                        name="Performance"
                        dataKey="value"
                        stroke="var(--op-color-primary-base)"
                        fill="var(--op-color-primary-base)"
                        fillOpacity={0.4}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Conversion Funnel Bar Chart */}
            <div className="card">
              <div className="card__header">
                <h2 style={{ fontSize: 'var(--op-font-large)', margin: 0 }}>
                  Conversion Funnel
                </h2>
              </div>
              <div className="card-body">
                <div style={{ height: '350px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={funnelChartData} layout="vertical">
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--op-color-border)"
                      />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 12, fill: 'var(--op-color-on-background)' }}
                      />
                      <YAxis
                        dataKey="stage"
                        type="category"
                        tick={{ fontSize: 12, fill: 'var(--op-color-on-background)' }}
                        width={80}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--op-color-background)',
                          border: '1px solid var(--op-color-border)',
                          borderRadius: 'var(--op-radius-medium)',
                        }}
                      />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Trends Line Chart - Full Width */}
          <div className="card" style={{ marginBottom: 'var(--op-space-x-large)' }}>
            <div className="card__header">
              <h2 style={{ fontSize: 'var(--op-font-large)', margin: 0 }}>
                Activity Trends (Last 14 Days)
              </h2>
            </div>
            <div className="card-body">
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--op-color-border)"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: 'var(--op-color-on-background)' }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: 'var(--op-color-on-background)' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--op-color-background)',
                        border: '1px solid var(--op-color-border)',
                        borderRadius: 'var(--op-radius-medium)',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="conversations"
                      stroke="var(--op-color-primary-base)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Conversations"
                    />
                    <Line
                      type="monotone"
                      dataKey="messages"
                      stroke="var(--green-500, #3c194a)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Messages"
                    />
                    <Line
                      type="monotone"
                      dataKey="leads"
                      stroke="var(--op-color-alerts-positive-base)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Leads"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Engagement Breakdown + Locations Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 'var(--op-space-large)',
              marginBottom: 'var(--op-space-large)',
            }}
          >
            {/* Engagement Breakdown Bar Chart */}
            <div className="card">
              <div className="card__header">
                <h2 style={{ fontSize: 'var(--op-font-large)', margin: 0 }}>
                  Engagement Breakdown
                </h2>
              </div>
              <div className="card-body">
                <div style={{ height: '250px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={engagementBreakdownData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--op-color-border)"
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: 'var(--op-color-on-background)' }}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: 'var(--op-color-on-background)' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--op-color-background)',
                          border: '1px solid var(--op-color-border)',
                          borderRadius: 'var(--op-radius-medium)',
                        }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    marginTop: 'var(--op-space-medium)',
                    fontSize: 'var(--op-font-x-small)',
                    color: 'var(--op-color-on-background)',
                  }}
                >
                  <span>Bounced: 1 msg</span>
                  <span>Low: 2-3 msgs</span>
                  <span>Medium: 4-6 msgs</span>
                  <span>High: 7+ msgs</span>
                </div>
              </div>
            </div>

            {/* Top States */}
            <div className="card">
              <div className="card__header">
                <h2
                  style={{
                    fontSize: 'var(--op-font-large)',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--op-space-small)',
                  }}
                >
                  <Location01Icon className="icon-sm" />
                  Top States
                </h2>
              </div>
              <div className="card-body">
                {!analytics?.visitorAnalytics?.topStates?.length ? (
                  <p style={{ color: 'var(--op-color-on-background)', margin: 0 }}>
                    No location data yet
                  </p>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--op-space-small)',
                    }}
                  >
                    {analytics.visitorAnalytics.topStates
                      .slice(0, 5)
                      .map(({ state, count }) => (
                        <div
                          key={state}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 'var(--op-space-small)',
                            borderRadius: 'var(--op-radius-small)',
                            backgroundColor: 'var(--op-color-neutral-plus-eight)',
                          }}
                        >
                          <span style={{ fontSize: 'var(--op-font-small)' }}>
                            {state}
                          </span>
                          <span
                            style={{
                              fontSize: 'var(--op-font-small)',
                              fontWeight: 'var(--op-font-weight-bold)',
                              color: 'var(--op-color-primary-base)',
                            }}
                          >
                            {count}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Top Referrers */}
            <div className="card">
              <div className="card__header">
                <h2
                  style={{
                    fontSize: 'var(--op-font-large)',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--op-space-small)',
                  }}
                >
                  <Link01Icon className="icon-sm" />
                  Top Referrers
                </h2>
              </div>
              <div className="card-body">
                {!analytics?.visitorAnalytics?.topReferrers?.length ? (
                  <p style={{ color: 'var(--op-color-on-background)', margin: 0 }}>
                    No referrer data yet
                  </p>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--op-space-small)',
                    }}
                  >
                    {analytics.visitorAnalytics.topReferrers
                      .slice(0, 5)
                      .map(({ referrer, count }) => (
                        <div
                          key={referrer}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 'var(--op-space-small)',
                            borderRadius: 'var(--op-radius-small)',
                            backgroundColor: 'var(--op-color-neutral-plus-eight)',
                          }}
                        >
                          <span
                            style={{
                              fontSize: 'var(--op-font-small)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '200px',
                            }}
                            title={referrer}
                          >
                            {referrer}
                          </span>
                          <span
                            style={{
                              fontSize: 'var(--op-font-small)',
                              fontWeight: 'var(--op-font-weight-bold)',
                              color: 'var(--op-color-primary-base)',
                            }}
                          >
                            {count}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
