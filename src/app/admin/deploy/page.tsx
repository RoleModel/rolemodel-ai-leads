'use client'

import { useRouter } from 'next/navigation'
import { Suspense } from 'react'

import { NavigationSidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'

export default function DeployPage() {
  const router = useRouter()

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
            overflow: 'auto',
            padding: 'var(--op-space-large)',
            backgroundColor: 'var(--op-color-background)',
          }}
        >
          <div style={{ marginBottom: 'var(--op-space-x-large)' }}>
            <h1
              style={{
                fontSize: 'var(--op-font-x-large)',
                fontWeight: 'var(--op-font-weight-bold)',
                margin: 0,
              }}
            >
              Deploy
            </h1>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--op-space-large)',
            }}
          >
            {/* Chat Widget */}
            <div
              className="card"
              style={{
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  background: 'linear-gradient(135deg, #A998C9 0%, #3C194A 100%)',
                  padding: 'var(--op-space-x-large)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 300,
                  position: 'relative',
                }}
              >
                {/* Widget Preview */}
                <div
                  style={{
                    backgroundColor: 'var(--op-color-background)',
                    borderRadius: 'var(--op-radius-large)',
                    width: '380px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    overflow: 'hidden',
                  }}
                >
                  {/* Widget Header */}
                  <div
                    style={{
                      backgroundColor: 'var(--op-color-primary-base)',
                      color: 'var(--op-color-primary-on-base)',
                      padding: 'var(--op-space-small) var(--op-space-medium)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--op-space-small)',
                    }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: 'var(--op-radius-small)',
                        backgroundColor: 'var(--op-color-primary-plus-four)',
                        color: 'var(--op-color-primary-on-plus-four)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'var(--op-font-weight-bold)',
                        fontSize: 'var(--op-font-small)',
                      }}
                    >
                      R
                    </div>
                    <span
                      style={{
                        fontWeight: 'var(--op-font-weight-medium)',
                        fontSize: 'var(--op-font-small)',
                      }}
                    >
                      RoleModel Software
                    </span>
                  </div>
                  {/* Widget Body */}
                  <div
                    style={{
                      padding: 'var(--op-space-medium)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 'var(--op-space-small)',
                    }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--op-color-primary-base)',
                        color: 'var(--op-color-primary-on-base)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 'var(--op-font-x-small)',
                        fontWeight: 'var(--op-font-weight-bold)',
                        flexShrink: 0,
                      }}
                    >
                      R
                    </div>
                    <div
                      style={{
                        backgroundColor: 'var(--op-color-neutral-plus-four)',
                        padding: 'var(--op-space-small)',
                        borderRadius: 'var(--op-radius-medium)',
                        fontSize: 'var(--op-font-x-small)',
                        color: 'var(--op-color-neutral-on-plus-four)',
                      }}
                    >
                      What problem or opportunity is prompting you to consider custom software?
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-body">
                <div style={{ marginBottom: 'var(--op-space-medium)' }}>
                  <h3
                    style={{
                      fontSize: 'var(--op-font-large)',
                      fontWeight: 'var(--op-font-weight-bold)',
                      margin: '0 0 var(--op-space-2x-small) 0',
                    }}
                  >
                    Chat widget
                  </h3>
                  <p
                    style={{
                      fontSize: 'var(--op-font-small)',
                      color: 'var(--op-color-neutral-on-plus-max)',
                      margin: 0,
                    }}
                  >
                    Add chat bot with a embed code
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 'var(--op-space-small)',
                    alignItems: 'center',
                  }}
                >
                  <Button
                    variant="secondary"
                    onClick={() => router.push('/admin/deploy/chat-widget')}
                  >
                    <span>Manage</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Leads page */}
            <div
              className="card"
              style={{
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  background: 'linear-gradient(135deg, #5CA85F 0%, #B3D99A 100%)',
                  padding: 'var(--op-space-x-large)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 300,
                  position: 'relative',
                }}
              >
                {/* Leads page Preview */}
                <div
                  style={{
                    backgroundColor: 'var(--op-color-background)',
                    borderRadius: 'var(--op-radius-large)',
                    width: '100%',
                    padding: 'var(--op-space-medium)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  }}
                >
                  {/* Browser Chrome */}
                  <div
                    style={{
                      display: 'flex',
                      gap: 'var(--op-space-3x-small)',
                      marginBottom: 'var(--op-space-medium)',
                    }}
                  >
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#ef4444',
                      }}
                    />
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#f59e0b',
                      }}
                    />
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#22c55e',
                      }}
                    />
                  </div>

                  <h2
                    style={{
                      fontSize: 'var(--op-font-large)',
                      fontWeight: 'var(--op-font-weight-bold)',
                      textAlign: 'center',
                      margin: '0 0 var(--op-space-medium) 0',
                    }}
                  >
                    Let&apos;s talk about your project!
                  </h2>

                  <div
                    style={{
                      border: '1px solid var(--op-color-border)',
                      borderRadius: 'var(--op-radius-medium)',
                      padding: 'var(--op-space-small) var(--op-space-medium)',
                      fontSize: 'var(--op-font-small)',
                      color: 'var(--op-color-neutral-on-plus-max)',
                    }}
                  >
                    Tell me about your project...
                  </div>
                </div>
              </div>

              <div className="card-body">
                <div style={{ marginBottom: 'var(--op-space-medium)' }}>
                  <h3
                    style={{
                      fontSize: 'var(--op-font-large)',
                      fontWeight: 'var(--op-font-weight-bold)',
                      margin: '0 0 var(--op-space-2x-small) 0',
                    }}
                  >
                    Leads page
                  </h3>
                  <p
                    style={{
                      fontSize: 'var(--op-font-small)',
                      color: 'var(--op-color-neutral-on-plus-max)',
                      margin: 0,
                    }}
                  >
                    ChatGPT-style lead page.
                  </p>
                </div>

                <button
                  className="btn btn--secondary"
                  onClick={() => router.push('/admin/deploy/leads-page')}
                >
                  Setup
                </button>
              </div>
            </div>

            {/* Intro A/B Testing */}
            <div
              className="card"
              style={{
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  background:
                    'linear-gradient(135deg, var(--orange-100) 0%, var(--orange-900) 50%)',
                  padding: 'var(--op-space-x-large)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 300,
                  position: 'relative',
                }}
              >
                {/* A/B Test Diagram */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--op-space-x-large)',
                  }}
                >
                  {/* Variant A */}
                  <div
                    style={{
                      backgroundColor: 'var(--op-color-background)',
                      borderRadius: 'var(--op-radius-medium)',
                      padding: 'var(--op-space-medium)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      textAlign: 'center',
                      width: '120px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 'var(--op-font-2x-large)',
                        fontWeight: 'var(--op-font-weight-bold)',
                        color: 'var(--op-color-primary-base)',
                      }}
                    >
                      A
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--op-font-x-small)',
                        color: 'var(--op-color-neutral-on-plus-max)',
                      }}
                    >
                      50% traffic
                    </div>
                  </div>

                  {/* VS */}
                  <div
                    style={{
                      color: 'white',
                      fontSize: 'var(--op-font-large)',
                      fontWeight: 'var(--op-font-weight-bold)',
                    }}
                  >
                    vs
                  </div>

                  {/* Variant B */}
                  <div
                    style={{
                      backgroundColor: 'var(--op-color-background)',
                      borderRadius: 'var(--op-radius-medium)',
                      padding: 'var(--op-space-medium)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      textAlign: 'center',
                      width: '120px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 'var(--op-font-2x-large)',
                        fontWeight: 'var(--op-font-weight-bold)',
                        color: 'var(--op-color-alerts-notice-base)',
                      }}
                    >
                      B
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--op-font-x-small)',
                        color: 'var(--op-color-neutral-on-plus-max)',
                      }}
                    >
                      50% traffic
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-body">
                <div style={{ marginBottom: 'var(--op-space-medium)' }}>
                  <h3
                    style={{
                      fontSize: 'var(--op-font-large)',
                      fontWeight: 'var(--op-font-weight-bold)',
                      margin: '0 0 var(--op-space-2x-small) 0',
                    }}
                  >
                    Intro A/B Testing
                  </h3>
                  <p
                    style={{
                      fontSize: 'var(--op-font-small)',
                      color: 'var(--op-color-neutral-on-plus-max)',
                      margin: 0,
                    }}
                  >
                    Compare intro page variants and track conversions
                  </p>
                </div>

                <Button variant="secondary" onClick={() => router.push('/admin/deploy/intro')}>
                  <span>View Results</span>
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
