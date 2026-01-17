'use client'

import {
  Add01Icon,
  Alert02Icon,
  AppStoreIcon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  Delete02Icon,
  Edit02Icon,
  RefreshIcon,
  Tick01Icon,
} from 'hugeicons-react'
import { Suspense, useEffect, useState } from 'react'

import { NavigationSidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'

import type { Webhook, WebhookEvent } from '@/lib/webhooks/types'

const AVAILABLE_EVENTS: { id: WebhookEvent; label: string; description: string }[] = [
  {
    id: 'lead.created',
    label: 'Lead Created',
    description: 'When a new qualified lead is captured',
  },
  {
    id: 'lead.updated',
    label: 'Lead Updated',
    description: 'When lead information is updated',
  },
  {
    id: 'conversation.started',
    label: 'Conversation Started',
    description: 'When a visitor starts a new conversation',
  },
  {
    id: 'conversation.completed',
    label: 'Conversation Completed',
    description: 'When a conversation ends',
  },
]

interface WebhookFormData {
  name: string
  url: string
  secret: string
  events: WebhookEvent[]
  is_active: boolean
}

const initialFormData: WebhookFormData = {
  name: '',
  url: '',
  secret: '',
  events: ['lead.created'],
  is_active: true,
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<WebhookFormData>(initialFormData)
  const [isSaving, setIsSaving] = useState(false)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<{
    id: string
    success: boolean
    message: string
  } | null>(null)
  const [copiedSecret, setCopiedSecret] = useState(false)

  useEffect(() => {
    loadWebhooks()
  }, [])

  async function loadWebhooks() {
    try {
      const res = await fetch('/api/webhooks')
      const data = await res.json()
      setWebhooks(data.webhooks || [])
    } catch (error) {
      console.error('Error loading webhooks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function generateSecret() {
    try {
      const res = await fetch('/api/webhooks', { method: 'PUT' })
      const data = await res.json()
      setFormData((prev) => ({ ...prev, secret: data.secret }))
    } catch (error) {
      console.error('Error generating secret:', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)

    try {
      const url = editingId ? `/api/webhooks/${editingId}` : '/api/webhooks'
      const method = editingId ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save webhook')
      }

      await loadWebhooks()
      resetForm()
    } catch (error) {
      console.error('Error saving webhook:', error)
      alert(error instanceof Error ? error.message : 'Failed to save webhook')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this webhook?')) return

    try {
      await fetch(`/api/webhooks/${id}`, { method: 'DELETE' })
      await loadWebhooks()
    } catch (error) {
      console.error('Error deleting webhook:', error)
    }
  }

  async function handleTest(webhook: Webhook) {
    setTestingId(webhook.id)
    setTestResult(null)

    try {
      const res = await fetch(`/api/webhooks/${webhook.id}?action=test`, {
        method: 'POST',
      })
      const data = await res.json()

      setTestResult({
        id: webhook.id,
        success: data.success,
        message: data.success ? 'Test successful!' : data.error || 'Test failed',
      })
    } catch (error) {
      setTestResult({
        id: webhook.id,
        success: false,
        message: error instanceof Error ? error.message : 'Test failed',
      })
    } finally {
      setTestingId(null)
    }
  }

  async function handleToggle(webhook: Webhook) {
    try {
      await fetch(`/api/webhooks/${webhook.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !webhook.is_active }),
      })
      await loadWebhooks()
    } catch (error) {
      console.error('Error toggling webhook:', error)
    }
  }

  function handleEdit(webhook: Webhook) {
    setFormData({
      name: webhook.name,
      url: webhook.url,
      secret: webhook.secret || '',
      events: webhook.events,
      is_active: webhook.is_active,
    })
    setEditingId(webhook.id)
    setShowForm(true)
  }

  function resetForm() {
    setFormData(initialFormData)
    setEditingId(null)
    setShowForm(false)
  }

  function toggleEvent(event: WebhookEvent) {
    setFormData((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }))
  }

  function copySecret() {
    navigator.clipboard.writeText(formData.secret)
    setCopiedSecret(true)
    setTimeout(() => setCopiedSecret(false), 2000)
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
            overflow: 'auto',
            padding: 'var(--op-space-large)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--op-space-large)',
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
                Webhooks
              </h1>
              <p
                style={{
                  fontSize: 'var(--op-font-small)',
                  color: 'var(--op-color-neutral-on-plus-max)',
                  margin: 'var(--op-space-2x-small) 0 0 0',
                }}
              >
                Send lead data to a CRM, automation tools, or custom endpoints
              </p>
            </div>
            {!showForm && webhooks.length > 0 && (
              <Button onClick={() => setShowForm(true)}>
                <Add01Icon className="icon-sm" />
                <span>Add Webhook</span>
              </Button>
            )}
          </div>

          {/* Webhook Form */}
          {showForm && (
            <div className="card" style={{ marginBottom: 'var(--op-space-large)' }}>
              <div className="card__header">
                <h2 style={{ fontSize: 'var(--op-font-large)', margin: 0 }}>
                  {editingId ? 'Edit Webhook' : 'New Webhook'}
                </h2>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 'var(--op-space-medium)',
                      marginBottom: 'var(--op-space-medium)',
                    }}
                  >
                    {/* Name */}
                    <div className="form-group">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control form-control--large"
                        placeholder="My CRM Integration"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, name: e.target.value }))
                        }
                        required
                      />
                    </div>

                    {/* URL */}
                    <div className="form-group">
                      <label className="form-label">Endpoint URL</label>
                      <input
                        type="url"
                        className="form-control form-control--large"
                        placeholder="https://your-crm.com/webhook"
                        value={formData.url}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, url: e.target.value }))
                        }
                        required
                      />
                    </div>
                  </div>

                  {/* Secret */}
                  <div
                    className="form-group"
                    style={{ marginBottom: 'var(--op-space-medium)' }}
                  >
                    <label className="form-label">
                      Webhook Secret{' '}
                      <span
                        style={{
                          color: 'var(--op-color-neutral-on-plus-max)',
                          fontWeight: 'normal',
                        }}
                      >
                        (optional, for signature verification)
                      </span>
                    </label>
                    <div style={{ display: 'flex', gap: 'var(--op-space-small)' }}>
                      <input
                        type="text"
                        className="form-control form-control--large"
                        placeholder="Leave empty or generate a secret"
                        value={formData.secret}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, secret: e.target.value }))
                        }
                        style={{ flex: 1, fontFamily: 'monospace' }}
                      />
                      <Button type="button" variant="secondary" onClick={generateSecret}>
                        <RefreshIcon className="icon-sm" />
                        <span>Generate</span>
                      </Button>
                      {formData.secret && (
                        <Button type="button" variant="ghost" onClick={copySecret}>
                          {copiedSecret ? (
                            <Tick01Icon
                              className="icon-sm"
                              style={{ color: 'var(--op-color-alerts-positive-base)' }}
                            />
                          ) : (
                            <Copy01Icon className="icon-sm" />
                          )}
                        </Button>
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: 'var(--op-font-x-small)',
                        color: 'var(--op-color-neutral-on-plus-max)',
                        margin: 'var(--op-space-2x-small) 0 0 0',
                      }}
                    >
                      If set, webhooks will include an X-Webhook-Signature header for
                      verification
                    </p>
                  </div>

                  {/* Events */}
                  <div
                    className="form-group"
                    style={{ marginBottom: 'var(--op-space-medium)' }}
                  >
                    <label className="form-label">Events to trigger webhook</label>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: 'var(--op-space-small)',
                      }}
                    >
                      {AVAILABLE_EVENTS.map((event) => (
                        <label
                          key={event.id}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 'var(--op-space-small)',
                            padding: 'var(--op-space-small)',
                            borderRadius: 'var(--op-radius-medium)',
                            border: '1px solid var(--op-color-border)',
                            backgroundColor: formData.events.includes(event.id)
                              ? 'var(--op-color-primary-plus-seven)'
                              : 'transparent',
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            className="form-control"
                            checked={formData.events.includes(event.id)}
                            onChange={() => toggleEvent(event.id)}
                            style={{ marginTop: '2px' }}
                          />
                          <div>
                            <div
                              style={{
                                fontSize: 'var(--op-font-small)',
                                fontWeight: 500,
                              }}
                            >
                              {event.label}
                            </div>
                            <div
                              style={{
                                fontSize: 'var(--op-font-x-small)',
                                color: 'var(--op-color-neutral-on-plus-max)',
                              }}
                            >
                              {event.description}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Active toggle */}
                  <div
                    className="form-group"
                    style={{ marginBottom: 'var(--op-space-large)' }}
                  >
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--op-space-small)',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        className="form-control"
                        checked={formData.is_active}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            is_active: e.target.checked,
                          }))
                        }
                      />
                      <span style={{ fontSize: 'var(--op-font-small)' }}>Active</span>
                    </label>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 'var(--op-space-small)' }}>
                    <Button
                      type="submit"
                      disabled={isSaving || formData.events.length === 0}
                    >
                      {isSaving
                        ? 'Saving...'
                        : editingId
                          ? 'Update Webhook'
                          : 'Create Webhook'}
                    </Button>
                    <Button type="button" variant="ghost" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Webhooks List */}
          {isLoading ? (
            <p style={{ color: 'var(--op-color-neutral-on-plus-max)' }}>
              Loading webhooks...
            </p>
          ) : webhooks.length === 0 && !showForm ? (
            <div
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--op-space-3x-large)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: 'var(--op-radius-large)',
                  backgroundColor: 'var(--op-color-primary-plus-six)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--op-space-medium)',
                }}
              >
                <AppStoreIcon
                  style={{
                    width: '32px',
                    height: '32px',
                    color: 'var(--op-color-primary-base)',
                  }}
                />
              </div>
              <h3
                style={{
                  fontSize: 'var(--op-font-large)',
                  fontWeight: 'var(--op-font-weight-bold)',
                  margin: '0 0 var(--op-space-x-small) 0',
                }}
              >
                No webhooks configured
              </h3>
              <p
                style={{
                  fontSize: 'var(--op-font-small)',
                  color: 'var(--op-color-neutral-on-plus-max)',
                  margin: '0 0 var(--op-space-medium) 0',
                  maxWidth: '400px',
                }}
              >
                Create a webhook to automatically send lead data to your CRM, Zapier, or
                any custom endpoint when leads are captured.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Add01Icon className="icon-sm" />
                <span>Add Your First Webhook</span>
              </Button>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--op-space-medium)',
              }}
            >
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="card">
                  <div
                    className="card-body"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--op-space-small)',
                        }}
                      >
                        <h3
                          style={{
                            fontSize: 'var(--op-font-medium)',
                            fontWeight: 'var(--op-font-weight-bold)',
                            margin: 0,
                          }}
                        >
                          {webhook.name}
                        </h3>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 'var(--op-space-2x-small)',
                            padding: '2px var(--op-space-small)',
                            borderRadius: 'var(--op-radius-pill)',
                            fontSize: 'var(--op-font-x-small)',
                            backgroundColor: webhook.is_active
                              ? 'var(--op-color-alerts-positive-plus-four)'
                              : 'var(--op-color-neutral-plus-four)',
                            color: webhook.is_active
                              ? 'var(--op-color-alerts-positive-on-plus-four)'
                              : 'var(--op-color-neutral-on-plus-four)',
                          }}
                        >
                          {webhook.is_active ? (
                            <CheckmarkCircle02Icon size="20" />
                          ) : (
                            <Cancel01Icon size="20" />
                          )}
                          {webhook.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {webhook.failure_count > 0 && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 'var(--op-space-2x-small)',
                              padding: '2px var(--op-space-small)',
                              borderRadius: 'var(--op-radius-pill)',
                              fontSize: 'var(--op-font-x-small)',
                              backgroundColor:
                                'var(--op-color-alerts-negative-plus-four)',
                              color: 'var(--op-color-alerts-negative-on-plus-four)',
                            }}
                          >
                            <Alert02Icon style={{ width: '12px', height: '12px' }} />
                            {webhook.failure_count} failures
                          </span>
                        )}
                      </div>

                      <p
                        style={{
                          fontSize: 'var(--op-font-small)',
                          color: 'var(--op-color-neutral-on-plus-max)',
                          margin: 'var(--op-space-2x-small) 0',
                          fontFamily: 'monospace',
                        }}
                      >
                        {webhook.url}
                      </p>

                      <div
                        style={{
                          display: 'flex',
                          gap: 'var(--op-space-x-small)',
                          flexWrap: 'wrap',
                        }}
                      >
                        {webhook.events.map((event) => (
                          <span
                            key={event}
                            style={{
                              padding: '2px var(--op-space-small)',
                              borderRadius: 'var(--op-radius-small)',
                              fontSize: 'var(--op-font-x-small)',
                              backgroundColor: 'var(--op-color-primary-plus-six)',
                              color: 'var(--op-color-primary-on-plus-six)',
                            }}
                          >
                            {event}
                          </span>
                        ))}
                      </div>

                      {webhook.last_triggered_at && (
                        <p
                          style={{
                            fontSize: 'var(--op-font-x-small)',
                            color: 'var(--op-color-neutral-on-plus-max)',
                            margin: 'var(--op-space-small) 0 0 0',
                          }}
                        >
                          Last triggered:{' '}
                          {new Date(webhook.last_triggered_at).toLocaleString()}
                        </p>
                      )}

                      {testResult && testResult.id === webhook.id && (
                        <div
                          style={{
                            marginTop: 'var(--op-space-small)',
                            padding: 'var(--op-space-small)',
                            borderRadius: 'var(--op-radius-small)',
                            backgroundColor: testResult.success
                              ? 'var(--op-color-alerts-positive-plus-four)'
                              : 'var(--op-color-alerts-negative-plus-four)',
                            color: testResult.success
                              ? 'var(--op-color-alerts-positive-on-plus-four)'
                              : 'var(--op-color-alerts-negative-on-plus-four)',
                            fontSize: 'var(--op-font-small)',
                          }}
                        >
                          {testResult.message}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--op-space-x-small)' }}>
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => handleTest(webhook)}
                        disabled={testingId === webhook.id}
                        title="Send test webhook"
                      >
                        {testingId === webhook.id ? (
                          <RefreshIcon
                            size="20"
                            style={{ animation: 'spin 1s linear infinite' }}
                          />
                        ) : (
                          <RefreshIcon size="20" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => handleToggle(webhook)}
                        title={webhook.is_active ? 'Disable webhook' : 'Enable webhook'}
                      >
                        {webhook.is_active ? (
                          <Cancel01Icon size="20" />
                        ) : (
                          <CheckmarkCircle02Icon size="20" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => handleEdit(webhook)}
                        title="Edit webhook"
                      >
                        <Edit02Icon className="icon-sm" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => handleDelete(webhook.id)}
                        title="Delete webhook"
                      >
                        <Delete02Icon
                          size="20"
                          color="var(--op-color-alerts-danger-base)"
                        />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Webhook Payload Documentation */}
          <div className="card" style={{ marginTop: 'var(--op-space-x-large)' }}>
            <div className="card__header">
              <h2 style={{ fontSize: 'var(--op-font-large)', margin: 0 }}>
                Webhook Payload Format
              </h2>
            </div>
            <div className="card-body">
              <p
                style={{
                  fontSize: 'var(--op-font-small)',
                  color: 'var(--op-color-neutral-on-plus-max)',
                }}
              >
                When triggered, webhooks send a POST request with the following JSON
                payload:
              </p>
              <pre
                style={{
                  backgroundColor: 'var(--op-color-neutral-plus-seven)',
                  padding: 'var(--op-space-medium)',
                  borderRadius: 'var(--op-radius-medium)',
                  overflow: 'auto',
                  fontSize: 'var(--op-font-x-small)',
                  fontFamily: 'monospace',
                }}
              >
                {JSON.stringify(
                  {
                    event: 'lead.created',
                    timestamp: '2024-01-15T10:30:00Z',
                    data: {
                      lead_id: 'uuid',
                      conversation_id: 'uuid',
                      visitor: {
                        name: 'Mark Burns',
                        email: 'john@example.com',
                        ip: '192.168.1.1',
                        location: {
                          city: 'San Francisco',
                          region: 'CA',
                          country: 'United States',
                          timezone: 'America/Los_Angeles',
                        },
                        referrer: 'https://google.com',
                        user_agent: 'Mozilla/5.0...',
                      },
                      summary: {
                        interest_level: 'high',
                        budget: '$10,000-$50,000',
                        timeline: '1-3 months',
                        needs: ['Custom software', 'Mobile app'],
                        pain_points: ['Manual processes'],
                        next_steps: ['Schedule demo call'],
                      },
                      message_count: 12,
                      created_at: '2024-01-15T10:30:00Z',
                    },
                  },
                  null,
                  2
                )}
              </pre>

              <h4
                style={{
                  marginTop: 'var(--op-space-medium)',
                  marginBottom: 'var(--op-space-small)',
                }}
              >
                Request Headers
              </h4>
              <ul
                style={{
                  fontSize: 'var(--op-font-small)',
                  color: 'var(--op-color-neutral-on-plus-max)',
                  paddingLeft: 'var(--op-space-large)',
                }}
              >
                <li>
                  <code>Content-Type: application/json</code>
                </li>
                <li>
                  <code>X-Webhook-Event: lead.created</code>
                </li>
                <li>
                  <code>X-Webhook-Timestamp: 2024-01-15T10:30:00Z</code>
                </li>
                <li>
                  <code>X-Webhook-Signature: sha256=...</code> (if secret is configured)
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
