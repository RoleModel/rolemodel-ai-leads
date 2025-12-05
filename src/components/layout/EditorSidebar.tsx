'use client'
import { ArrowLeft01Icon } from '@hugeicons-pro/core-stroke-standard'
import { HugeiconsIcon } from '@hugeicons/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ModelSelector } from '@/components/ui/model-selector'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'

import { useLeadsPageSettings } from '@/contexts/LeadsPageSettingsContext'

// Default chatbot ID for RoleModel
const DEFAULT_CHATBOT_ID = 'a0000000-0000-0000-0000-000000000001'

const styles = {
  editorSidebar: {
    width: '25%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    padding: 'var(--op-space-medium) 0',
    borderRight: '1px solid var(--op-color-border)',
    backgroundColor: 'var(--op-color-background)',
    flexShrink: 0,
    minWidth: 400,
  },
  navHeader: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--op-space-medium)',
    marginBottom: 'var(--op-space-medium)',
    padding: '0 var(--op-space-medium)',
  },
  navBackBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--op-space-x-small)',
    fontSize: 'var(--op-font-small)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
  navTitleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navTitle: {
    fontSize: 'var(--op-font-x-large)',
    fontWeight: 600,
    margin: 0,
  },
  settingsForm: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 0,
    paddingBottom: 'var(--op-space-large)',
    padding: '0 var(--op-space-medium)',
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--op-space-x-small)',
    paddingBottom: 'var(--op-space-small)',
  },
  formRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--op-space-small)',
  },
  sidebarFooter: {
    marginTop: 'auto',
    paddingTop: 'var(--op-space-large)',
    borderTop: '1px solid var(--op-color-border)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--op-space-medium)',
    padding: 'var(--op-space-large) var(--op-space-medium) var(--op-space-medium)',
  },
}

export function EditorSidebar() {
  const router = useRouter()
  const { settings, updateSettings } = useLeadsPageSettings()
  const [isSaving, setIsSaving] = useState(false)
  const [showDeployPopover, setShowDeployPopover] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/leads-page-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatbotId: DEFAULT_CHATBOT_ID,
          pageTitle: settings.pageTitle,
          pageDescription: settings.pageDescription,
          introText: settings.introText,
          timeEstimate: settings.timeEstimate,
          aiInstructions: settings.aiInstructions,
          calendlyUrl: settings.calendlyUrl,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const iframeEmbedCode = `<iframe
  src="${typeof window !== 'undefined' ? window.location.origin : ''}/embed/leads-page?chatbotId=${DEFAULT_CHATBOT_ID}"
  width="100%"
  height="100vh"
  frameborder="0"
  allow="clipboard-write"
></iframe>`

  const scriptEmbedCode = `<script
  src="${typeof window !== 'undefined' ? window.location.origin : ''}/embed-script.js"
  data-chatbot-id="${DEFAULT_CHATBOT_ID}"
  data-container-id="rolemodel-widget">
</script>`

  return (
    <aside style={styles.editorSidebar}>
      <div style={styles.navHeader}>
        <button style={styles.navBackBtn} onClick={() => router.push('/deploy')}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          Back to Deploy
        </button>

        <div style={styles.navTitleRow}>
          <h1 style={styles.navTitle}>Leads page</h1>
          <Popover open={showDeployPopover} onOpenChange={setShowDeployPopover}>
            <PopoverTrigger asChild>
              <Button size="sm">Deploy</Button>
            </PopoverTrigger>
            <PopoverContent align="end" style={{ width: '500px', maxHeight: '80vh', overflow: 'auto' }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--op-space-large)',
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: 'var(--op-font-medium)',
                      fontWeight: 600,
                      margin: '0 0 var(--op-space-small) 0',
                    }}
                  >
                    Embed Leads Page
                  </h3>
                  <p
                    style={{
                      fontSize: 'var(--op-font-small)',
                      margin: 0,
                      color: 'var(--op-color-on-background)',
                    }}
                  >
                    Choose how to embed your leads page on your website.
                  </p>
                </div>

                {/* Option 1: Full Page Iframe */}
                <div>
                  <h4
                    style={{
                      fontSize: 'var(--op-font-small)',
                      fontWeight: 600,
                      margin: '0 0 var(--op-space-small) 0',
                    }}
                  >
                    Option 1: Full Page Embed (Recommended)
                  </h4>
                  <p
                    style={{
                      fontSize: 'var(--op-font-x-small)',
                      color: 'var(--op-color-neutral-on-plus-max)',
                      margin: '0 0 var(--op-space-small) 0',
                    }}
                  >
                    Embeds the leads page as a full-page experience. Best for dedicated landing pages.
                  </p>
                  <div style={{ position: 'relative' }}>
                    <pre
                      style={{
                        padding: 'var(--op-space-medium)',
                        backgroundColor: 'var(--op-color-neutral-minus-eight)',
                        color: 'var(--op-color-neutral-on-minus-eight)',
                        borderRadius: 'var(--op-radius-medium)',
                        fontSize: 'var(--op-font-x-small)',
                        fontFamily: 'monospace',
                        overflow: 'auto',
                        maxHeight: '150px',
                        margin: 0,
                        border: '1px solid',
                        borderColor: 'var(--op-color-border)',
                      }}
                    >
                      {iframeEmbedCode}
                    </pre>
                    <Button
                      size="sm"
                      variant="secondary"
                      style={{
                        position: 'absolute',
                        top: 'var(--op-space-small)',
                        right: 'var(--op-space-small)',
                      }}
                      onClick={() => {
                        navigator.clipboard.writeText(iframeEmbedCode)
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                {/* Option 2: Floating Widget */}
                <div>
                  <h4
                    style={{
                      fontSize: 'var(--op-font-small)',
                      fontWeight: 600,
                      margin: '0 0 var(--op-space-small) 0',
                    }}
                  >
                    Option 2: Floating Widget
                  </h4>
                  <p
                    style={{
                      fontSize: 'var(--op-font-x-small)',
                      color: 'var(--op-color-neutral-on-plus-max)',
                      margin: '0 0 var(--op-space-small) 0',
                    }}
                  >
                    Adds a floating widget in the bottom-right corner. Works great in Framer and other platforms.
                  </p>
                  <div style={{ position: 'relative' }}>
                    <pre
                      style={{
                        padding: 'var(--op-space-medium)',
                        backgroundColor: 'var(--op-color-neutral-minus-eight)',
                        color: 'var(--op-color-neutral-on-minus-eight)',
                        borderRadius: 'var(--op-radius-medium)',
                        fontSize: 'var(--op-font-x-small)',
                        fontFamily: 'monospace',
                        overflow: 'auto',
                        maxHeight: '150px',
                        margin: 0,
                        border: '1px solid',
                        borderColor: 'var(--op-color-border)',
                      }}
                    >
                      {scriptEmbedCode}
                    </pre>
                    <Button
                      size="sm"
                      variant="secondary"
                      style={{
                        position: 'absolute',
                        top: 'var(--op-space-small)',
                        right: 'var(--op-space-small)',
                      }}
                      onClick={() => {
                        navigator.clipboard.writeText(scriptEmbedCode)
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--op-space-small)' }}>
                  <Button
                    variant="secondary"
                    style={{ flex: 1 }}
                    onClick={() =>
                      window.open(
                        `/test-embed.html`,
                        '_blank'
                      )
                    }
                  >
                    Test Both Options
                  </Button>
                  <Button
                    variant="secondary"
                    style={{ flex: 1 }}
                    onClick={() =>
                      window.open(
                        `/embed/leads-page?chatbotId=${DEFAULT_CHATBOT_ID}`,
                        '_blank'
                      )
                    }
                  >
                    Preview Full Page
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <ScrollArea style={{ flex: 1, minHeight: 0 }}>
        <div style={styles.settingsForm}>
              <div style={styles.formSection}>
                <ModelSelector
                  label="AI Model"
                  value={settings.model || 'gpt-4o-mini'}
                  onChange={(model) => updateSettings({ model })}
                />
                <p
                  style={{
                    fontSize: 'var(--op-font-x-small)',
                    color: 'var(--op-color-neutral-on-plus-max)',
                    margin: 'var(--op-space-x-small) 0 0 0',
                  }}
                >
                  Select the AI model to power your conversations
                </p>
              </div>

              <div style={styles.formSection}>
                <Label style={{ fontSize: 'var(--op-font-small)' }}>Calendly URL</Label>
                <p
                  style={{
                    fontSize: 'var(--op-font-x-small)',
                    color: 'var(--op-color-neutral-on-plus-max)',
                    margin: '0 0 var(--op-space-x-small) 0',
                  }}
                >
                  Link for scheduling calls after qualification
                </p>
                <Input
                  value={settings.calendlyUrl}
                  onChange={(e) => updateSettings({ calendlyUrl: e.target.value })}
                  placeholder="https://calendly.com/your-link"
                />
              </div>

              <div style={styles.formSection}>
                <Label style={{ fontSize: 'var(--op-font-small)' }}>AI Instructions</Label>
                <p
                  style={{
                    fontSize: 'var(--op-font-small)',
                    margin: '0 0 var(--op-space-x-small) 0',
                  }}
                >
                  Use the CRIT™ framework to structure your AI prompt for better lead
                  qualification
                </p>
                <div
                  style={{
                    backgroundColor: 'var(--op-color-neutral-plus-seven)',
                    border: '1px solid var(--op-color-border)',
                    padding: 'var(--op-space-medium)',
                    borderRadius: 'var(--op-radius-medium)',
                    marginBottom: 'var(--op-space-medium)',
                    fontSize: 'var(--op-font-x-small)',
                  }}
                >
                  <p style={{ margin: '0 0 var(--op-space-x-small) 0', fontWeight: 600 }}>
                    CRIT™ Framework:
                  </p>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: 'var(--op-space-large)',
                      lineHeight: 1.6,
                    }}
                  >
                    <li>
                      <strong>Context:</strong> Describe your business, product, and ideal
                      customer profile
                    </li>
                    <li>
                      <strong>Role:</strong> Define the AI&apos;s expertise (e.g.,
                      &quot;Expert B2B sales qualification specialist&quot;)
                    </li>
                    <li>
                      <strong>Interview:</strong> Specify how to qualify leads (e.g.,
                      &quot;Ask 3-5 BANT questions one at a time&quot;)
                    </li>
                    <li>
                      <strong>Task:</strong> Define the outcome (e.g., &quot;Provide
                      qualification score and next steps&quot;)
                    </li>
                  </ul>
                </div>
                <textarea
                  value={settings.aiInstructions}
                  onChange={(e) => updateSettings({ aiInstructions: e.target.value })}
                  placeholder={`Example using CRIT™ framework:

CONTEXT: We're a B2B SaaS platform helping mid-market companies (10-50 employees, $5M-$50M revenue) automate sales workflows.

ROLE: You are an expert B2B sales qualification specialist with 15+ years in SaaS, using BANT methodology.

INTERVIEW: Ask questions one at a time (3-5 total) to assess:
- Budget: Can they invest $50K-$500K annually?
- Authority: Are they a decision-maker or influencer?
- Need: What workflow challenges are they facing?
- Timeline: When do they need a solution?

TASK: After qualification, provide:
1. Qualification score (0-100)
2. Summary of their needs
3. Recommended next steps
4. Offer to schedule a discovery call`}
                  className="form-control"
                  rows={15}
                  style={{
                    resize: 'vertical',
                    minHeight: '300px',
                    fontFamily: 'monospace',
                    fontSize: 'var(--op-font-x-small)',
                  }}
                />
              </div>
        </div>
      </ScrollArea>

      <div style={styles.sidebarFooter}>
        <div style={styles.formRow}>
          <Button
            variant="secondary"
            style={{ flex: 1 }}
            onClick={() => router.push('/deploy')}
            disabled={isSaving}
          >
            Discard
          </Button>
          <Button
            variant="primary"
            style={{ flex: 1 }}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </div>
    </aside>
  )
}
