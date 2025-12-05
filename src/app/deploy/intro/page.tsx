'use client'

import { useEffect, useState } from 'react'
import { Suspense } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowLeft02Icon,
  ArrowRight02Icon,
  CodeIcon,
  Link01Icon,
  Maximize01Icon,
  RefreshIcon,
} from '@hugeicons-pro/core-stroke-standard'
import { HugeiconsIcon } from '@hugeicons/react'

import { NavigationSidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import {
  WebPreview,
  WebPreviewBody,
  WebPreviewNavigation,
  WebPreviewNavigationButton,
  WebPreviewUrl,
  useWebPreview,
} from '@/components/ai-elements/web-preview'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface VariantStats {
  views: number
  conversions: number
  engagements: number
  bounces: number
  conversionRate: number
  engagementRate: number
  bounceRate: number
  dailyStats?: { date: string; views: number; conversions: number }[]
}

interface Variant {
  id: string
  name: string
  path: string
  weight: number
  is_control: boolean
  created_at: string
  stats: VariantStats
}

interface ABTest {
  id: string
  name: string
  description: string | null
  status: 'active' | 'paused' | 'notice' | 'info' | 'warning' | 'completed'
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
  ab_test_variants: Variant[]
}

// Navigation controls that use the WebPreview context
function PreviewNavControls() {
  const { url, setUrl } = useWebPreview()

  const handleReload = () => {
    // Trigger reload by setting URL to itself with a cache-busting param
    const newUrl = new URL(url, window.location.origin)
    newUrl.searchParams.set('_t', Date.now().toString())
    setUrl(newUrl.toString())
  }

  return (
    <WebPreviewNavigation>
      <WebPreviewNavigationButton>
        <HugeiconsIcon icon={ArrowLeft02Icon} size={16} />
      </WebPreviewNavigationButton>
      <WebPreviewNavigationButton>
        <HugeiconsIcon icon={ArrowRight02Icon} size={16} />
      </WebPreviewNavigationButton>
      <WebPreviewNavigationButton onClick={handleReload}>
        <HugeiconsIcon icon={RefreshIcon} size={16} />
      </WebPreviewNavigationButton>
      <WebPreviewUrl />
      <WebPreviewNavigationButton onClick={() => window.open(url, '_blank')}>
        <HugeiconsIcon icon={Link01Icon} size={16} />
      </WebPreviewNavigationButton>
      <WebPreviewNavigationButton>
        <HugeiconsIcon icon={Maximize01Icon} size={16} />
      </WebPreviewNavigationButton>
    </WebPreviewNavigation>
  )
}


function ComparisonChart({ variants }: { variants: Variant[] }) {
  const chartData = variants.map(v => ({
    name: v.name,
    views: v.stats.views,
    conversions: v.stats.conversions,
    engagements: v.stats.engagements,
  }))

  return (
    <div className="card">
      <div className="card-header">
        <h3 style={{ margin: 0, fontSize: 'var(--op-font-large)' }}>Variant Comparison</h3>
      </div>
      <div className="card-body">
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--op-color-border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--op-color-on-background)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--op-color-on-background)' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--op-color-background)',
                  border: '1px solid var(--op-color-border)',
                  borderRadius: 'var(--op-radius-medium)',
                }}
              />
              <Bar dataKey="views" fill="var(--op-color-primary-base)" name="Views" radius={[4, 4, 0, 0]} />
              <Bar dataKey="conversions" fill="var(--light-green, #86c774)" name="Conversions" radius={[4, 4, 0, 0]} />
              <Bar dataKey="engagements" fill="var(--orange, #ffcd74)" name="Engagements" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function ConversionRateComparison({ variants }: { variants: Variant[] }) {
  const chartData = variants.map(v => ({
    name: v.name,
    conversionRate: v.stats.conversionRate,
    engagementRate: v.stats.engagementRate,
    bounceRate: v.stats.bounceRate,
  }))

  return (
    <div className="card">
      <div className="card-header">
        <h3 style={{ margin: 0, fontSize: 'var(--op-font-large)' }}>Rate Comparison (%)</h3>
      </div>
      <div className="card-body">
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--op-color-border)" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: 'var(--op-color-on-background)' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: 'var(--op-color-on-background)' }} width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--op-color-background)',
                  border: '1px solid var(--op-color-border)',
                  borderRadius: 'var(--op-radius-medium)',
                }}
                formatter={(value: number) => `${value.toFixed(1)}%`}
              />
              <Bar dataKey="conversionRate" fill="var(--light-green, #86c774)" name="Conversion Rate" radius={[0, 4, 4, 0]} />
              <Bar dataKey="engagementRate" fill="var(--light-blue, #87d4e9)" name="Engagement Rate" radius={[0, 4, 4, 0]} />
              <Bar dataKey="bounceRate" fill="var(--purple, #9b7bb8)" name="Bounce Rate" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

// Available intro pages (using embed paths for iframe preview)
const INTRO_PAGES = [
  { path: '/embed/intro/a', name: 'Intro A' },
  { path: '/embed/intro/b', name: 'Intro B' },
  { path: '/embed/intro/c', name: 'Intro C' },
]

interface VariantPreviewWithSelectProps {
  label: string
  defaultPath: string
  baseUrl: string
}

function VariantPreviewWithSelect({ label, defaultPath, baseUrl }: VariantPreviewWithSelectProps) {
  const [selectedPath, setSelectedPath] = useState(defaultPath)
  const fullUrl = `${baseUrl}${selectedPath}`

  const iframeEmbedCode = `<iframe
  src="${fullUrl}"
  width="100%"
  height="100vh"
  frameborder="0"
></iframe>`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--op-space-medium)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--op-space-medium)' }}>
        <span style={{ fontSize: 'var(--op-font-small)', fontWeight: 'var(--op-font-weight-semibold)' }}>
          {label}:
        </span>
        <select
          value={selectedPath}
          onChange={(e) => setSelectedPath(e.target.value)}
          className="form-control"
          style={{ width: '240px' }}
        >
          {INTRO_PAGES.map((page) => (
            <option key={page.path} value={page.path}>
              {page.name}
            </option>
          ))}
        </select>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="secondary" size="lg">
              <HugeiconsIcon icon={CodeIcon} size={16} />
              Embed
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" style={{ width: '400px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--op-space-small)' }}>
              <div style={{ position: 'relative' }}>
                <pre
                  style={{
                    padding: 'var(--op-space-small)',
                    backgroundColor: 'var(--op-color-neutral-minus-eight)',
                    color: 'var(--op-color-neutral-on-minus-eight)',
                    borderRadius: 'var(--op-radius-medium)',
                    fontSize: 'var(--op-font-x-small)',
                    fontFamily: 'monospace',
                    overflow: 'auto',
                    maxHeight: '120px',
                    margin: 0,
                    border: '1px solid var(--op-color-border)',
                  }}
                >
                  {iframeEmbedCode}
                </pre>
                <Button
                  size="sm"
                  variant="secondary"
                  style={{ position: 'absolute', top: 'var(--op-space-x-small)', right: 'var(--op-space-x-small)' }}
                  onClick={() => navigator.clipboard.writeText(iframeEmbedCode)}
                >
                  Copy
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <WebPreview defaultUrl={fullUrl} key={selectedPath}>
        <PreviewNavControls />
        <WebPreviewBody />
      </WebPreview>
    </div>
  )
}

export default function IntroABTestingPage() {
  const [tests, setTests] = useState<ABTest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [baseUrl, setBaseUrl] = useState<string | null>(null)

  useEffect(() => {
    // Set base URL from window location
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin)
    }
    loadTests()
  }, [])

  async function loadTests() {
    try {
      const res = await fetch('/api/ab-tests')
      const data = await res.json()
      // Ensure we always set an array
      if (Array.isArray(data)) {
        setTests(data)
      } else {
        console.error('API returned non-array:', data)
        setTests([])
      }
    } catch (error) {
      console.error('Error loading A/B tests:', error)
      setTests([])
    } finally {
      setIsLoading(false)
    }
  }

  async function updateTestStatus(testId: string, status: 'active' | 'paused' | 'notice' | 'warning' | 'completed') {
    try {
      await fetch(`/api/ab-tests/${testId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      loadTests()
    } catch (error) {
      console.error('Error updating test status:', error)
    }
  }

  if (isLoading || baseUrl === null) {
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

  const activeTest = tests.length > 0 ? (tests.find(t => t.status === 'active') || tests[0]) : null

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
          <div
            style={{
              marginBottom: 'var(--op-space-large)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
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
                Intro Page A/B Testing
              </h1>
              <p
                style={{
                  fontSize: 'var(--op-font-small)',
                  color: 'var(--op-color-on-background)',
                  margin: 'var(--op-space-2x-small) 0 0 0',
                }}
              >
                Compare intro page variants and track conversion rates
              </p>
            </div>

            {activeTest && (
              <div style={{ display: 'flex', gap: 'var(--op-space-medium)', alignItems: 'center' }}>
                <span
                  className={`badge badge--${activeTest.status === 'active' ? 'notice' : activeTest.status}`}
                >
                  {activeTest.status === 'active' ? 'ACTIVE' : activeTest.status.toUpperCase()}
                </span>
                {activeTest.status === 'active' ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => updateTestStatus(activeTest.id, 'paused')}
                  >
                    Pause Test
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => updateTestStatus(activeTest.id, 'active')}
                  >
                    Activate Test
                  </Button>
                )}
              </div>
            )}
          </div>

          {!activeTest ? (
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: 'var(--op-space-3x-large)' }}>
                <p style={{ color: 'var(--op-color-on-background)' }}>
                  No A/B tests found. Run the database migration to create the default intro page test.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Two Variant Previews with Selects */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 'var(--op-space-large)',
                  marginBottom: 'var(--op-space-x-large)',
                }}
              >
                <VariantPreviewWithSelect
                  label="Variant A"
                  defaultPath="/embed/intro/a"
                  baseUrl={baseUrl}
                />
                <VariantPreviewWithSelect
                  label="Variant B"
                  defaultPath="/embed/intro/b"
                  baseUrl={baseUrl}
                />
              </div>

              {/* Comparison Charts */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                  gap: 'var(--op-space-large)',
                  marginBottom: 'var(--op-space-large)',
                }}
              >
                <ComparisonChart variants={activeTest.ab_test_variants} />
                <ConversionRateComparison variants={activeTest.ab_test_variants} />
              </div>

              {/* Test Info */}
              <div className="card">
                <div className="card-header">
                  <h3 style={{ margin: 0, fontSize: 'var(--op-font-large)' }}>Test Details</h3>
                </div>
                <div className="card-body">
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: 'var(--op-space-large)',
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontSize: 'var(--op-font-small)', color: 'var(--op-color-on-background)' }}>
                        Test Name
                      </p>
                      <p style={{ margin: 'var(--op-space-2x-small) 0 0 0', fontWeight: 'var(--op-font-weight-semibold)' }}>
                        {activeTest.name}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 'var(--op-font-small)', color: 'var(--op-color-on-background)' }}>
                        Created
                      </p>
                      <p style={{ margin: 'var(--op-space-2x-small) 0 0 0', fontWeight: 'var(--op-font-weight-semibold)' }}>
                        {new Date(activeTest.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 'var(--op-font-small)', color: 'var(--op-color-on-background)' }}>
                        Total Views
                      </p>
                      <p style={{ margin: 'var(--op-space-2x-small) 0 0 0', fontWeight: 'var(--op-font-weight-semibold)' }}>
                        {activeTest.ab_test_variants.reduce((sum, v) => sum + v.stats.views, 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 'var(--op-font-small)', color: 'var(--op-color-on-background)' }}>
                        Total Conversions
                      </p>
                      <p style={{ margin: 'var(--op-space-2x-small) 0 0 0', fontWeight: 'var(--op-font-weight-semibold)' }}>
                        {activeTest.ab_test_variants.reduce((sum, v) => sum + v.stats.conversions, 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
