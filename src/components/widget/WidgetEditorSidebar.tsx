'use client'
import {
  ArrowLeft01Icon,
  Cancel01Icon,
  InformationCircleIcon,
  RefreshIcon,
  Upload01Icon,
} from 'hugeicons-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useSyncExternalStore } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ModelSelector } from '@/components/ui/model-selector'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

import { useWidgetConfig } from '@/contexts/WidgetConfigContext'

export function WidgetEditorSidebar() {
  const router = useRouter()
  const { config, updateConfig } = useWidgetConfig()
  const [alertMessage, setAlertMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const origin = useSyncExternalStore(
    () => () => {},
    () => (typeof window !== 'undefined' ? window.location.origin : ''),
    () => ''
  )

  // Load saved config on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/widget-config')
        if (response.ok) {
          const data = await response.json()
          if (data.config) {
            updateConfig(data.config)
          }
        }
      } catch (error) {
        console.error('Error loading widget config:', error)
      }
    }
    loadConfig()
  }, [updateConfig])

  const handleSave = async () => {
    try {
      console.log('Saving config:', config)
      const response = await fetch('/api/widget-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Failed to save widget settings:', errorText)
        setAlertMessage({ type: 'error', text: 'Failed to save settings' })
        setTimeout(() => setAlertMessage(null), 3000)
      } else {
        const result = await response.json()
        console.log('Save successful:', result)
        setAlertMessage({ type: 'success', text: 'Settings saved successfully!' })
        setTimeout(() => setAlertMessage(null), 3000)
      }
    } catch (error) {
      console.error('Error saving widget config:', error)
      setAlertMessage({ type: 'error', text: 'Error saving settings' })
      setTimeout(() => setAlertMessage(null), 3000)
    }
  }

  return (
    <aside
      style={{
        width: '25%',
        borderRight: '1px solid var(--op-color-border)',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--op-color-background)',
        minWidth: 400,
      }}
    >
      <div
        style={{
          padding: 'var(--op-space-large)',
          borderBottom: '1px solid var(--op-color-border)',
        }}
      >
        <Button onClick={() => router.push('/deploy')} variant="ghost" size="md">
          <ArrowLeft01Icon className="icon-sm" />
          Back to Deploy
        </Button>

        <h1
          style={{
            fontSize: 'var(--op-font-large)',
            fontWeight: 'var(--op-font-weight-bold)',
            margin: 0,
          }}
        >
          Chat widget
        </h1>
      </div>

      <Tabs
        defaultValue="content"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        <div style={{ borderBottom: '1px solid var(--op-color-border)' }}>
          <TabsList
            style={{
              display: 'flex',
              padding: '0 var(--op-space-small)',
              gap: 'var(--op-space-2x-small)',
            }}
          >
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="ai">AI</TabsTrigger>
            <TabsTrigger value="embed">Embed</TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea style={{ flex: 1, minHeight: 0 }}>
          {/* CONTENT TAB */}
          <TabsContent value="content" style={{ padding: 'var(--op-space-large)' }}>
            <div style={{ marginBottom: 'var(--op-space-large)' }}>
              <Label
                htmlFor="widget-display-name"
                style={{
                  display: 'block',
                  fontSize: 'var(--op-font-small)',
                  marginBottom: 'var(--op-space-small)',
                }}
              >
                Display name
              </Label>
              <Input
                id="widget-display-name"
                value={config.displayName || ''}
                onChange={(e) => updateConfig({ displayName: e.target.value })}
                placeholder="RoleModel Software"
              />
            </div>

            <div style={{ marginBottom: 'var(--op-space-large)' }}>
              <Label
                htmlFor="widget-initial-messages"
                style={{
                  display: 'block',
                  fontSize: 'var(--op-font-small)',
                  marginBottom: 'var(--op-space-small)',
                }}
              >
                Initial messages
              </Label>
              <Textarea
                id="widget-initial-messages"
                value={config.initialMessage || ''}
                onChange={(e) => updateConfig({ initialMessage: e.target.value })}
                rows={4}
                style={{ resize: 'vertical' }}
                aria-describedby="widget-initial-messages-help"
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 'var(--op-space-small)',
                }}
              >
                <p
                  id="widget-initial-messages-help"
                  style={{
                    fontSize: 'var(--op-font-x-small)',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--op-space-2x-small)',
                  }}
                >
                  <InformationCircleIcon className="icon-sm" />
                  Enter each message in a new line.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    updateConfig({ initialMessage: "Hi! Let's talk about your project!" })
                  }
                >
                  Reset
                </Button>
              </div>
            </div>

            <div style={{ marginBottom: 'var(--op-space-large)' }}>
              <Label
                htmlFor="widget-suggested-messages-persist"
                style={{
                  display: 'block',
                  fontSize: 'var(--op-font-small)',
                  marginBottom: 'var(--op-space-small)',
                }}
              >
                Suggested messages{' '}
                <InformationCircleIcon
                  className="icon-sm"
                  style={{ display: 'inline', opacity: 0.5 }}
                />
              </Label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--op-space-medium)',
                  padding: 'var(--op-space-small)',
                  backgroundColor: 'var(--op-color-neutral-plus-seven)',
                  border: '1px solid var(--op-color-border)',
                  borderRadius: 'var(--op-radius-small)',
                  gap: 'var(--op-space-small)',
                }}
              >
                <Label
                  htmlFor="widget-suggested-messages-persist"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--op-space-small)',
                  }}
                >
                  <span style={{ fontSize: 'var(--op-font-small)' }}>
                    Keep showing the suggested messages after the users&apos; first
                    message
                  </span>
                  <InformationCircleIcon className="icon-sm" style={{ opacity: 0.5 }} />
                </Label>
                <Switch
                  id="widget-suggested-messages-persist"
                  checked={config.suggestedMessagesPersist}
                  onCheckedChange={(checked) =>
                    updateConfig({ suggestedMessagesPersist: checked })
                  }
                />
              </div>
              <Button variant="ghost" size="sm">
                + Add suggested message
              </Button>
            </div>

            <div style={{ marginBottom: 'var(--op-space-large)' }}>
              <Label
                htmlFor="widget-message-placeholder"
                style={{
                  display: 'block',
                  fontSize: 'var(--op-font-small)',
                  marginBottom: 'var(--op-space-small)',
                }}
              >
                Message placeholder
              </Label>
              <Input
                id="widget-message-placeholder"
                value={config.messagePlaceholder || ''}
                onChange={(e) => updateConfig({ messagePlaceholder: e.target.value })}
                placeholder="Message..."
              />
            </div>

            <div>
              <Label
                htmlFor="widget-dismissible-notice"
                style={{
                  display: 'block',
                  fontSize: 'var(--op-font-small)',
                  color: 'var(--op-color-neutral-on-plus-max)',
                  marginBottom: 'var(--op-space-small)',
                }}
              >
                Dismissible notice
              </Label>

              <Textarea
                id="widget-dismissible-notice"
                value={config.dismissibleNotice || ''}
                onChange={(e) => updateConfig({ dismissibleNotice: e.target.value })}
                rows={6}
                style={{ resize: 'vertical' }}
                aria-describedby="widget-dismissible-notice-help"
              />

              <p
                id="widget-dismissible-notice-help"
                style={{
                  fontSize: 'var(--op-font-x-small)',
                  color: 'var(--op-color-neutral-on-plus-max)',
                  marginTop: 'var(--op-space-small)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--op-space-2x-small)',
                }}
              >
                <InformationCircleIcon
                  className="icon-sm"
                  style={{ flexShrink: 0, marginTop: '2px' }}
                />
                You can use this to add a dismissable notice. It will be dismissed after
                the user sends a message.
              </p>
            </div>
          </TabsContent>

          {/* STYLE TAB */}
          <TabsContent value="style" style={{ padding: 'var(--op-space-large)' }}>
            <div style={{ marginBottom: 'var(--op-space-x-large)' }}>
              <Label
                style={{
                  display: 'block',
                  fontSize: 'var(--op-font-small)',
                  color: 'var(--op-color-neutral-on-plus-max)',
                  marginBottom: 'var(--op-space-medium)',
                }}
              >
                Appearance
              </Label>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'var(--op-space-medium)',
                }}
                role="radiogroup"
                aria-labelledby="widget-theme-label"
              >
                {/* Light theme card */}
                <div
                  role="radio"
                  aria-checked={config.theme === 'light'}
                  tabIndex={0}
                  onClick={() => updateConfig({ theme: 'light' })}
                  onKeyDown={(e) => e.key === 'Enter' && updateConfig({ theme: 'light' })}
                  style={{
                    border: `2px solid ${config.theme === 'light' ? 'var(--op-color-primary)' : 'var(--op-color-border)'}`,
                    borderRadius: 'var(--op-radius-medium)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      backgroundColor: '#f5f5f5',
                      padding: 'var(--op-space-large)',
                      minHeight: '160px',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: 'var(--op-space-small)',
                        left: 'var(--op-space-small)',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#000',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                      }}
                    >
                      +
                    </div>
                    <div
                      style={{
                        marginTop: 'var(--op-space-x-large)',
                        backgroundColor: '#e0e0e0',
                        height: '12px',
                        borderRadius: '4px',
                        width: '60%',
                      }}
                    />
                  </div>
                  <div
                    style={{
                      padding: 'var(--op-space-medium)',
                      backgroundColor: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontSize: 'var(--op-font-small)', fontWeight: 500 }}>
                      Light
                    </span>
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        border: '2px solid var(--op-color-border)',
                        backgroundColor:
                          config.theme === 'light'
                            ? 'var(--op-color-primary)'
                            : 'transparent',
                      }}
                    />
                  </div>
                </div>

                {/* Dark theme card */}
                <div
                  role="radio"
                  aria-checked={config.theme === 'dark'}
                  tabIndex={0}
                  onClick={() => updateConfig({ theme: 'dark' })}
                  onKeyDown={(e) => e.key === 'Enter' && updateConfig({ theme: 'dark' })}
                  style={{
                    border: `2px solid ${config.theme === 'dark' ? 'var(--op-color-primary)' : 'var(--op-color-border)'}`,
                    borderRadius: 'var(--op-radius-medium)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      backgroundColor: '#1a1a1a',
                      padding: 'var(--op-space-large)',
                      minHeight: '160px',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: 'var(--op-space-small)',
                        left: 'var(--op-space-small)',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: 'white',
                        color: '#000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                      }}
                    >
                      +
                    </div>
                    <div
                      style={{
                        marginTop: 'var(--op-space-x-large)',
                        backgroundColor: '#333',
                        height: '12px',
                        borderRadius: '4px',
                        width: '60%',
                      }}
                    />
                  </div>
                  <div
                    style={{
                      padding: 'var(--op-space-medium)',
                      backgroundColor: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontSize: 'var(--op-font-small)', fontWeight: 500 }}>
                      Dark
                    </span>
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        border: '2px solid var(--op-color-border)',
                        backgroundColor:
                          config.theme === 'dark'
                            ? 'var(--op-color-primary)'
                            : 'transparent',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 'var(--op-space-large)' }}>
              <Label
                style={{
                  display: 'block',
                  fontSize: 'var(--op-font-small)',
                  marginBottom: 'var(--op-space-small)',
                }}
              >
                Profile picture
              </Label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--op-space-medium)',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor:
                      config.profilePicture?.startsWith('data:') ||
                      config.profilePicture?.startsWith('http')
                        ? 'transparent'
                        : 'var(--op-color-primary)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--op-font-large)',
                    fontWeight: 'bold',
                    overflow: 'hidden',
                    backgroundImage:
                      config.profilePicture?.startsWith('data:') ||
                      config.profilePicture?.startsWith('http')
                        ? `url(${config.profilePicture})`
                        : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {!config.profilePicture?.startsWith('data:') &&
                    !config.profilePicture?.startsWith('http') &&
                    (config.profilePicture || 'R')}
                </div>
                <input
                  type="file"
                  id="profile-picture-upload"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      // Check file size (max 1MB)
                      if (file.size > 1024 * 1024) {
                        setAlertMessage({
                          type: 'error',
                          text: 'File size must be less than 1MB',
                        })
                        setTimeout(() => setAlertMessage(null), 3000)
                        return
                      }
                      // Convert to base64
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        updateConfig({ profilePicture: reader.result as string })
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                />
                <Button
                  variant="icon"
                  onClick={() =>
                    document.getElementById('profile-picture-upload')?.click()
                  }
                >
                  <Upload01Icon className="icon-sm" />
                </Button>
                <Button
                  variant="icon"
                  onClick={() => updateConfig({ profilePicture: 'R' })}
                >
                  <Cancel01Icon className="icon-sm" />
                </Button>
              </div>
            </div>

            <div style={{ marginBottom: 'var(--op-space-large)' }}>
              <Label
                htmlFor="widget-primary-color"
                style={{
                  display: 'block',
                  fontSize: 'var(--op-font-small)',
                  marginBottom: 'var(--op-space-small)',
                }}
              >
                Primary color
              </Label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--op-space-small)',
                }}
              >
                <label
                  htmlFor="widget-primary-color-picker"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--op-radius-small)',
                    backgroundColor: config.primaryColor,
                    border: '1px solid var(--op-color-border)',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <input
                    id="widget-primary-color-picker"
                    type="color"
                    value={config.primaryColor || '#007BFF'}
                    onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                    style={{
                      position: 'absolute',
                      width: '200%',
                      height: '200%',
                      top: '-50%',
                      left: '-50%',
                      cursor: 'pointer',
                      border: 'none',
                    }}
                  />
                </label>
                <Input
                  id="widget-primary-color"
                  value={config.primaryColor || ''}
                  onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                  style={{ flex: 1, fontFamily: 'monospace' }}
                />
                <Button
                  variant="ghosticon"
                  onClick={() => updateConfig({ primaryColor: '#007BFF' })}
                >
                  <RefreshIcon className="icon-sm" />
                </Button>
              </div>
            </div>

            <div style={{ marginBottom: 'var(--op-space-large)' }}>
              <Label
                htmlFor="widget-button-color"
                style={{
                  display: 'block',
                  fontSize: 'var(--op-font-small)',
                  marginBottom: 'var(--op-space-small)',
                }}
              >
                Chat bubble Button color
              </Label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--op-space-small)',
                }}
              >
                <label
                  htmlFor="widget-button-color-picker"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--op-radius-small)',
                    backgroundColor: config.buttonColor,
                    border: '1px solid var(--op-color-border)',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <input
                    id="widget-button-color-picker"
                    type="color"
                    value={config.buttonColor || '#000000'}
                    onChange={(e) => updateConfig({ buttonColor: e.target.value })}
                    style={{
                      position: 'absolute',
                      width: '200%',
                      height: '200%',
                      top: '-50%',
                      left: '-50%',
                      cursor: 'pointer',
                      border: 'none',
                    }}
                  />
                </label>
                <Input
                  id="widget-button-color"
                  value={config.buttonColor || ''}
                  onChange={(e) => updateConfig({ buttonColor: e.target.value })}
                  style={{ flex: 1, fontFamily: 'monospace' }}
                />
                <Button
                  variant="ghosticon"
                  onClick={() => updateConfig({ buttonColor: '#000000' })}
                >
                  <RefreshIcon className="icon-sm" />
                </Button>
              </div>
            </div>

            <div>
              <Label
                id="widget-alignment-label"
                style={{
                  display: 'block',
                  fontSize: 'var(--op-font-small)',
                  marginBottom: 'var(--op-space-small)',
                }}
              >
                Align chat bubble Button
              </Label>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--op-space-small)',
                }}
                role="radiogroup"
                aria-labelledby="widget-alignment-label"
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
                    id="widget-alignment-left"
                    type="radio"
                    name="alignment"
                    checked={config.alignment === 'left'}
                    onChange={() => updateConfig({ alignment: 'left' })}
                  />
                  <span style={{ fontSize: 'var(--op-font-small)' }}>Left align</span>
                </label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--op-space-small)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    id="widget-alignment-right"
                    type="radio"
                    name="alignment"
                    checked={config.alignment === 'right'}
                    onChange={() => updateConfig({ alignment: 'right' })}
                  />
                  <span style={{ fontSize: 'var(--op-font-small)' }}>Right align</span>
                </label>
              </div>
            </div>
          </TabsContent>

          {/* AI TAB */}
          <TabsContent value="ai" style={{ padding: 'var(--op-space-large)' }}>
            <div style={{ marginBottom: 'var(--op-space-large)' }}>
              <ModelSelector
                label="AI Model"
                id="widget-model"
                value={config.model || 'gpt-4o-mini'}
                onChange={(model) => updateConfig({ model })}
              />
              <p
                style={{
                  fontSize: 'var(--op-font-x-small)',
                  color: 'var(--op-color-neutral-on-plus-max)',
                  margin: 'var(--op-space-x-small) 0 0 0',
                }}
              >
                Select the AI model to power your widget conversations
              </p>
            </div>

            <div style={{ marginBottom: 'var(--op-space-large)' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--op-space-medium)',
                }}
              >
                <Label
                  htmlFor="widget-sync-instructions"
                  style={{
                    fontSize: 'var(--op-font-small)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--op-space-2x-small)',
                  }}
                >
                  Sync with base instructions
                  <InformationCircleIcon className="icon-sm" style={{ opacity: 0.5 }} />
                </Label>
                <Switch
                  id="widget-sync-instructions"
                  checked={config.syncInstructions}
                  onCheckedChange={(checked) =>
                    updateConfig({ syncInstructions: checked })
                  }
                />
              </div>
            </div>

            <div>
              <Label
                htmlFor="widget-instructions-textarea"
                style={{
                  display: 'block',
                  fontSize: 'var(--op-font-small)',
                  marginBottom: 'var(--op-space-small)',
                }}
              >
                Chat widget instructions
              </Label>

              <Textarea
                id="widget-instructions-textarea"
                value={config.instructions || ''}
                onChange={(e) => updateConfig({ instructions: e.target.value })}
                rows={20}
                style={{
                  resize: 'vertical',
                  fontFamily: 'monospace',
                  fontSize: 'var(--op-font-x-small)',
                }}
              />
            </div>
          </TabsContent>

          {/* EMBED TAB */}
          <TabsContent value="embed" style={{ padding: 'var(--op-space-large)' }}>
            <div style={{ marginBottom: 'var(--op-space-large)' }}>
              <h3
                style={{
                  fontSize: 'var(--op-font-medium)',
                  fontWeight: 600,
                  margin: '0 0 var(--op-space-medium) 0',
                }}
              >
                Chat Widget Embed Options
              </h3>

              {/* Option 1: Floating Chat Bubble */}
              <div style={{ marginBottom: 'var(--op-space-x-large)' }}>
                <Label
                  htmlFor="widget-embed-bubble"
                  style={{
                    display: 'block',
                    fontSize: 'var(--op-font-small)',
                    fontWeight: 600,
                    marginBottom: 'var(--op-space-small)',
                  }}
                >
                  Option 1: Floating Chat Bubble (Recommended)
                </Label>
                <p
                  style={{
                    fontSize: 'var(--op-font-x-small)',
                    color: 'var(--op-color-neutral-on-plus-max)',
                    marginBottom: 'var(--op-space-medium)',
                  }}
                >
                  Adds a floating chat bubble in the corner of your website. Copy and
                  paste this code before the closing &lt;/body&gt; tag.
                </p>
                <div
                  style={{
                    position: 'relative',
                  }}
                >
                  <Textarea
                    id="widget-embed-bubble"
                    readOnly
                    rows={4}
                    value={`<script src="${origin}/widget.js" data-chatbot-id="a0000000-0000-0000-0000-000000000001"></script>`}
                    style={{
                      resize: 'none',
                      fontFamily: 'monospace',
                      fontSize: 'var(--op-font-x-small)',
                    }}
                    onClick={(e) => e.currentTarget.select()}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    style={{
                      position: 'absolute',
                      top: 'var(--op-space-small)',
                      right: 'var(--op-space-small)',
                    }}
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `<script src="${origin}/widget.js" data-chatbot-id="a0000000-0000-0000-0000-000000000001"></script>`
                      )
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              {/* Option 2: Inline Iframe */}
              <div style={{ marginBottom: 'var(--op-space-large)' }}>
                <Label
                  htmlFor="widget-embed-iframe"
                  style={{
                    display: 'block',
                    fontSize: 'var(--op-font-small)',
                    fontWeight: 600,
                    marginBottom: 'var(--op-space-small)',
                  }}
                >
                  Option 2: Embedded Chat Window
                </Label>
                <p
                  style={{
                    fontSize: 'var(--op-font-x-small)',
                    color: 'var(--op-color-neutral-on-plus-max)',
                    marginBottom: 'var(--op-space-medium)',
                  }}
                >
                  Embeds the chat directly in your page. Great for help pages or dedicated
                  chat sections.
                </p>
                <div
                  style={{
                    position: 'relative',
                  }}
                >
                  <Textarea
                    id="widget-embed-iframe"
                    readOnly
                    rows={6}
                    value={`<iframe
  src="${origin}/widget/a0000000-0000-0000-0000-000000000001"
  width="400"
  height="600"
  frameborder="0"
  style="border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.15);">
</iframe>`}
                    style={{
                      resize: 'none',
                      fontFamily: 'monospace',
                      fontSize: 'var(--op-font-x-small)',
                    }}
                    onClick={(e) => e.currentTarget.select()}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    style={{
                      position: 'absolute',
                      top: 'var(--op-space-small)',
                      right: 'var(--op-space-small)',
                    }}
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `<iframe\n  src="${origin}/widget/a0000000-0000-0000-0000-000000000001"\n  width="400"\n  height="600"\n  frameborder="0"\n  style="border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.15);">\n</iframe>`
                      )
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--op-color-neutral-plus-seven)',
                padding: 'var(--op-space-medium)',
                borderRadius: 'var(--op-radius-medium)',
                border: '1px solid var(--op-color-border)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--op-space-small)',
                }}
              >
                <InformationCircleIcon
                  className="icon-sm"
                  style={{ flexShrink: 0, marginTop: '2px' }}
                />
                <div>
                  <p
                    style={{
                      fontSize: 'var(--op-font-x-small)',
                      margin: 0,
                    }}
                  >
                    <strong>Installation tips:</strong>
                  </p>
                  <ul
                    style={{
                      fontSize: 'var(--op-font-x-small)',
                      color: 'var(--op-color-neutral-on-plus-max)',
                      marginTop: 'var(--op-space-small)',
                      paddingLeft: 'var(--op-space-medium)',
                    }}
                  >
                    <li>Add the script tag before the closing &lt;/body&gt; tag</li>
                    <li>The widget will appear as a button in the bottom-right corner</li>
                    <li>Works on all modern browsers</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Save Button at Bottom */}
      <div
        style={{
          padding: 'var(--op-space-large)',
          borderTop: '1px solid var(--op-color-border)',
        }}
      >
        <Button variant="primary" onClick={handleSave} style={{ width: '100%' }}>
          Save Changes
        </Button>
      </div>

      {/* Alert Toast */}
      {alertMessage && (
        <div
          style={{
            position: 'fixed',
            top: 'var(--op-space-large)',
            right: 'var(--op-space-large)',
            backgroundColor:
              alertMessage.type === 'success'
                ? 'var(--op-color-alerts-notice-base)'
                : 'var(--op-color-alerts-danger-base)',
            color: 'white',
            padding: 'var(--op-space-medium) var(--op-space-large)',
            borderRadius: 'var(--op-radius-medium)',
            boxShadow: 'var(--op-shadow-large)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--op-space-small)',
            animation: 'slideIn 0.2s ease-out',
          }}
        >
          <InformationCircleIcon className="icon-sm" />
          <span style={{ fontSize: 'var(--op-font-small)' }}>{alertMessage.text}</span>
        </div>
      )}
    </aside>
  )
}
