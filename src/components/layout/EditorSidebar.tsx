'use client'
import { ArrowLeft01Icon } from '@hugeicons-pro/core-stroke-standard'
import { HugeiconsIcon } from '@hugeicons/react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ModelSelector } from '@/components/ui/model-selector'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useLeadsPageSettings } from '@/contexts/LeadsPageSettingsContext'

// Default chatbot ID for RoleModel
const DEFAULT_CHATBOT_ID = 'a0000000-0000-0000-0000-000000000001'

export const MIN_SIDEBAR_WIDTH = 320
export const MAX_SIDEBAR_WIDTH = 800
export const DEFAULT_SIDEBAR_WIDTH = 400
// Width threshold at which LeadsPageView sidebar should collapse
export const SIDEBAR_COLLAPSE_THRESHOLD = 550

const MIN_WIDTH = MIN_SIDEBAR_WIDTH
const MAX_WIDTH = MAX_SIDEBAR_WIDTH
const DEFAULT_WIDTH = DEFAULT_SIDEBAR_WIDTH

const styles = {
  editorSidebar: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    padding: 'var(--op-space-medium) 0',
    borderRight: '1px solid var(--op-color-border)',
    backgroundColor: 'var(--op-color-background)',
    flexShrink: 0,
    position: 'relative' as const,
  },
  resizeHandle: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    width: '6px',
    height: '100%',
    cursor: 'col-resize',
    backgroundColor: 'transparent',
    zIndex: 10,
    transition: 'background-color 0.15s ease',
  },
  resizeHandleActive: {
    backgroundColor: 'var(--op-color-primary-base)',
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
    justifyItems: 'stretch',
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

interface EditorSidebarProps {
  width?: number
  onWidthChange?: (width: number) => void
}

export function EditorSidebar({
  width = DEFAULT_WIDTH,
  onWidthChange,
}: EditorSidebarProps) {
  const router = useRouter()
  const { settings, updateSettings } = useLeadsPageSettings()
  const [isSaving, setIsSaving] = useState(false)
  const [showDeployPopover, setShowDeployPopover] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const sidebarRef = useRef<HTMLElement>(null)

  // Handle resize drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!sidebarRef.current || !onWidthChange) return

      const sidebarRect = sidebarRef.current.getBoundingClientRect()
      const newWidth = e.clientX - sidebarRect.left
      const clampedWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth))
      onWidthChange(clampedWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, onWidthChange])

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
          ragConfig: settings.ragConfig,
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

  // Always use production URL for embed codes (preview deployments block iframes)
  const origin = 'https://rolemodel-ai-leads.vercel.app'

  const iframeEmbedCode = `<iframe
  src="${origin}/embed/leads-page?chatbotId=${DEFAULT_CHATBOT_ID}"
  width="100%"
  frameborder="0"
  allow="clipboard-write"
></iframe>`

  const scriptEmbedCode = `<script
  src="${origin}/embed-script.js"
  data-chatbot-id="${DEFAULT_CHATBOT_ID}"
  data-container-id="rolemodel-widget">
</script>`

  return (
    <aside ref={sidebarRef} style={{ ...styles.editorSidebar, width: `${width}px` }}>
      {/* Resize Handle */}
      <div
        style={{
          ...styles.resizeHandle,
          ...(isResizing ? styles.resizeHandleActive : {}),
        }}
        onMouseDown={handleMouseDown}
        onMouseEnter={(e) => {
          if (!isResizing) {
            ;(e.target as HTMLElement).style.backgroundColor =
              'var(--op-color-primary-minus-four)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isResizing) {
            ;(e.target as HTMLElement).style.backgroundColor = 'transparent'
          }
        }}
      />
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
            <PopoverContent
              align="end"
              style={{ width: '500px', maxHeight: '80vh', overflow: 'auto' }}
            >
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
                      color: 'var(--op-color-on-background)',
                    }}
                  >
                    Embed Leads Page
                  </h3>
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
                    Embeds the leads page as a full-page experience. Best for dedicated
                    landing pages.
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
                    Adds a floating widget in the bottom-right corner. Works great in
                    Framer and other platforms.
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
                    onClick={() => window.open(`/test-embed.html`, '_blank')}
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
          <ModelSelector
            label="AI Model"
            value={settings.model || 'gpt-4o-mini'}
            onChange={(model) => updateSettings({ model })}
          />

          <div className="form-group">
            <Label style={{ fontSize: 'var(--op-font-small)' }}>Calendly URL</Label>
            <Input
              value={settings.calendlyUrl}
              onChange={(e) => updateSettings({ calendlyUrl: e.target.value })}
              placeholder="https://calendly.com/your-link"
            />
          </div>

          <div
            style={{
              ...styles.formSection,
              borderTop: '1px solid var(--op-color-border)',
              paddingTop: 'var(--op-space-medium)',
              marginTop: 'var(--op-space-medium)',
            }}
          >
            <Label style={{ fontSize: 'var(--op-font-small)' }}>AI Instructions</Label>
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

          {/* Knowledge Base Settings */}
          <div style={{ ...styles.formSection }}>
            <p style={{ fontSize: 'var(--op-font-medium)', fontWeight: 600 }}>
              Knowledge Base Settings
            </p>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--op-space-medium)',
              }}
            >
              {/* Retrieval Settings */}
              <div style={{ display: 'flex', gap: 'var(--op-space-small)' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <Label style={{ fontSize: 'var(--op-font-x-small)' }}>
                    Sources to Retrieve
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={settings.ragConfig?.sourceLimit ?? 5}
                    onChange={(e) =>
                      updateSettings({
                        ragConfig: {
                          ...settings.ragConfig,
                          sourceLimit: parseInt(e.target.value) || 5,
                        },
                      })
                    }
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <Label style={{ fontSize: 'var(--op-font-x-small)' }}>
                    Similarity Threshold
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={1}
                    step={0.1}
                    value={settings.ragConfig?.similarityThreshold ?? 0.5}
                    onChange={(e) =>
                      updateSettings({
                        ragConfig: {
                          ...settings.ragConfig,
                          similarityThreshold: parseFloat(e.target.value) || 0.5,
                        },
                      })
                    }
                  />
                </div>
              </div>

              {/* Enable Citations Toggle */}
              <div className="form-group form-group--inline form-group--no-margin">
                <Input
                  id="enableCitations"
                  name="enableCitations"
                  type="checkbox"
                  checked={settings.ragConfig?.enableCitations ?? true}
                  onChange={(e) =>
                    updateSettings({
                      ragConfig: {
                        ...settings.ragConfig,
                        enableCitations: e.target.checked,
                      },
                    })
                  }
                  className="form-control--medium"
                />
                <label className="form-label">Enable Citations</label>
              </div>

              {/* Enable Case Studies Toggle */}
              <div className="form-group form-group--inline form-group--no-margin">
                <Input
                  id="enableCaseStudies"
                  name="enableCaseStudies"
                  type="checkbox"
                  checked={settings.ragConfig?.enableCaseStudies ?? true}
                  onChange={(e) =>
                    updateSettings({
                      ragConfig: {
                        ...settings.ragConfig,
                        enableCaseStudies: e.target.checked,
                      },
                    })
                  }
                  className="form-control--medium"
                />
                <span className="form-label">Proactive Case Studies</span>
              </div>

              {/* Personalization Toggle */}
              <div className="form-group form-group--inline form-group--no-margin">
                <Input
                  id="enablePersonalization"
                  name="enablePersonalization"
                  type="checkbox"
                  checked={settings.ragConfig?.enablePersonalization ?? true}
                  onChange={(e) =>
                    updateSettings({
                      ragConfig: {
                        ...settings.ragConfig,
                        enablePersonalization: e.target.checked,
                      },
                    })
                  }
                  className="form-control--medium"
                />
                <label className="form-label">Personalize Responses</label>
              </div>
              <p
                style={{
                  fontSize: 'var(--op-font-x-small)',
                  color: 'var(--op-color-neutral-on-plus-max)',
                  margin: 0,
                }}
              >
                Use visitor&apos;s name and context in responses
              </p>
            </div>
          </div>

          {/* Conversation Flow Settings */}
          <div
            style={{
              ...styles.formSection,
              borderTop: '1px solid var(--op-color-border)',
              paddingTop: 'var(--op-space-medium)',
              marginTop: 'var(--op-space-medium)',
            }}
          >
            <Label style={{ fontSize: 'var(--op-font-medium)', fontWeight: 600 }}>
              Conversation Flow
            </Label>
            <p
              style={{
                fontSize: 'var(--op-font-x-small)',
                color: 'var(--op-color-neutral-on-plus-max)',
                margin: '0 0 var(--op-space-medium) 0',
              }}
            >
              Control how the AI qualifies leads and collects information
            </p>

            <div>
              <div className="form-group">
                {/* BANT Qualification Toggle */}
                <Input
                  id="enableBANT"
                  name="enableBANT"
                  type="checkbox"
                  checked={settings.ragConfig?.enableBANT ?? true}
                  onChange={(e) =>
                    updateSettings({
                      ragConfig: { ...settings.ragConfig, enableBANT: e.target.checked },
                    })
                  }
                  className="form-control--medium"
                />
                <Label>BANT Qualification</Label>
              </div>

              <p style={{ fontSize: 'var(--op-font-x-small)', margin: 0 }}>
                Ask about Budget, Authority, Need, Timeline
              </p>

              {/* Ask for Name Toggle */}
              <div className="form-group">
                <Input
                  id="askForName"
                  name="askForName"
                  type="checkbox"
                  checked={settings.ragConfig?.askForName ?? true}
                  onChange={(e) =>
                    updateSettings({
                      ragConfig: { ...settings.ragConfig, askForName: e.target.checked },
                    })
                  }
                  className="form-control--medium"
                />
                <Label>Ask for Name</Label>
              </div>
              <p
                style={{
                  fontSize: 'var(--op-font-x-small)',
                  color: 'var(--op-color-neutral-on-plus-max)',
                  margin: 0,
                }}
              >
                AI will ask for visitor&apos;s name during conversation
              </p>

              {/* Ask for Email Toggle */}
              <div className="form-group">
                <Input
                  id="askForEmail"
                  name="askForEmail"
                  type="checkbox"
                  checked={settings.ragConfig?.askForEmail ?? true}
                  onChange={(e) =>
                    updateSettings({
                      ragConfig: { ...settings.ragConfig, askForEmail: e.target.checked },
                    })
                  }
                  className="form-control--medium"
                />
                <Label>Ask for Email</Label>
              </div>
              <p
                style={{
                  fontSize: 'var(--op-font-x-small)',
                  color: 'var(--op-color-neutral-on-plus-max)',
                  margin: 0,
                }}
              >
                AI will ask for visitor&apos;s email for follow-up
              </p>

              {/* Max Questions */}
              <div className="form-group">
                <Label style={{ fontSize: 'var(--op-font-small)' }}>
                  Max Qualification Questions
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={settings.ragConfig?.maxQuestions ?? 5}
                  onChange={(e) =>
                    updateSettings({
                      ragConfig: {
                        ...settings.ragConfig,
                        maxQuestions: parseInt(e.target.value) || 5,
                      },
                    })
                  }
                  style={{ width: '100px' }}
                />
              </div>

              {/* Response Conciseness */}
              <div className="form-group">
                <Label style={{ fontSize: 'var(--op-font-small)' }}>
                  Response Length
                </Label>
                <Select
                  value={settings.ragConfig?.responseConciseness ?? 'moderate'}
                  onValueChange={(value) =>
                    updateSettings({
                      ragConfig: {
                        ...settings.ragConfig,
                        responseConciseness: value as 'brief' | 'moderate' | 'detailed',
                      },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a response length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brief">Brief (1-2 sentences)</SelectItem>
                    <SelectItem value="moderate">Moderate (2-4 sentences)</SelectItem>
                    <SelectItem value="detailed">
                      Detailed (thorough responses)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Custom Instructions */}
          <div style={{ ...styles.formSection }}>
            <Label style={{ fontSize: 'var(--op-font-medium)', fontWeight: 600 }}>
              Custom Instructions
            </Label>
            <p
              style={{
                fontSize: 'var(--op-font-x-small)',
                color: 'var(--op-color-neutral-on-plus-max)',
                margin: '0 0 var(--op-space-x-small) 0',
              }}
            >
              Additional instructions for how the AI should behave
            </p>
            <textarea
              value={settings.ragConfig?.customInstructions ?? ''}
              onChange={(e) =>
                updateSettings({
                  ragConfig: {
                    ...settings.ragConfig,
                    customInstructions: e.target.value,
                  },
                })
              }
              placeholder={`Example custom instructions:

- When discussing pricing, always reference the pricing guide
- Prioritize case studies from the same industry as the prospect
- Always mention our 30-day pilot program when discussing timelines`}
              className="form-control"
              rows={6}
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
