'use client'
import {
  ComputerIcon,
  Moon02Icon,
  SmartPhone01Icon,
  SparklesIcon,
  Sun01Icon,
} from 'hugeicons-react'
import { useState } from 'react'


import { LeadsPageView } from '@/components/leads-page/LeadsPageView'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// Default chatbot ID for RoleModel
const DEFAULT_CHATBOT_ID = 'a0000000-0000-0000-0000-000000000001'

const styles = {
  main: {
    flex: 1,
    display: 'flex' as const,
    flexDirection: 'column' as const,
    overflow: 'hidden',
    backgroundColor: 'var(--op-color-background)',
    position: 'relative' as const,
  },
  grid: {
    position: 'absolute' as const,
    inset: 0,
    backgroundImage:
      'radial-gradient(var(--op-color-neutral-plus-four) 1px, transparent 0)',
    backgroundSize: '10px 10px',
    pointerEvents: 'none' as const,
  },
  previewCard: {
    margin: 'var(--op-space-x-large) auto',
    width: 'calc(100% - 60px)',
    maxWidth: '1400px',
    height: 'calc(100vh - 140px)',
    overflow: 'hidden',
    borderRadius: 'var(--op-radius-large)',
    display: 'flex',
    gap: 0,
    flexDirection: 'column' as const,
  },
  browserBar: {
    height: '40px',
    backgroundColor: 'var(--op-color-neutral-plus-eight)',
    borderBottom: '1px solid var(--op-color-border)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 var(--op-space-medium)',
    gap: 'var(--op-space-x-small)',
  },
  browserButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewContainer: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  bottomToolbarWrapper: {
    position: 'absolute' as const,
    bottom: 'var(--op-space-large)',
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '0 var(--op-space-small)',
  },
  bottomToolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--op-space-medium)',
    backgroundColor: 'var(--op-color-background)',
    padding: 'var(--op-space-small) var(--op-space-medium)',
    borderRadius: 'var(--op-radius-pill)',
    border: '1px solid var(--op-color-border)',
    boxShadow: ' var(--op-shadow-medium)',
  },
  topBarTools: {
    display: 'flex',
    backgroundColor: 'var(--op-color-neutral-plus-seven)',
    gap: 'var(--op-space-3x-small)',
    alignItems: 'center',
    border: '1px solid var(--op-color-border)',
    borderRadius: 'var(--op-radius-pill)',
    padding: '0 var(--op-space-x-small)',
  },
  topBarDivider: {
    height: '24px',
    width: '1px',
    backgroundColor: 'var(--op-color-border)',
  },
}

export function PreviewArea() {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [editMode, setEditMode] = useState(true)

  return (
    <main style={styles.main}>
      <div style={styles.grid} className="inner-shadow" />
      <Card
        style={{
          ...styles.previewCard,
          maxWidth: previewMode === 'mobile' ? '400px' : '1400px',
        }}
        data-theme-mode={theme}
      >
        {/* Browser Bar */}
        <div style={styles.browserBar}>
          <div style={styles.browserButton}>
            <svg height="12" width="12">
              <circle
                r="6"
                cx="6"
                cy="6"
                fill="var(--op-color-alerts-notice-minus-two)"
              />
            </svg>
          </div>
          <div style={styles.browserButton}>
            <svg height="12" width="12">
              <circle
                r="6"
                cx="6"
                cy="6"
                fill="var(--op-color-alerts-warning-plus-one)"
              />
            </svg>
          </div>
          <div style={styles.browserButton}>
            <svg height="12" width="12">
              <circle r="6" cx="6" cy="6" fill="var(--op-color-alerts-danger-base)" />
            </svg>
          </div>
        </div>

        {/* Preview Container with LeadsPageView */}
        <div style={styles.previewContainer}>
          <LeadsPageView
            chatbotId={DEFAULT_CHATBOT_ID}
            showSidebar={previewMode === 'desktop'}
            editMode={editMode}
            theme={theme}
            onThemeChange={setTheme}
          />
        </div>
      </Card>

      {/* Bottom Toolbar */}
      <div style={styles.bottomToolbarWrapper}>
        <div style={styles.bottomToolbar}>
          <Button
            variant="ghost"
            onClick={() => setEditMode(!editMode)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--op-space-x-small)',
            }}
          >
            <SparklesIcon className="icon-sm" /> Edit mode
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: editMode
                  ? 'var(--op-color-alerts-notice-base)'
                  : 'transparent',
                marginLeft: 'var(--op-space-x-small)',
              }}
            ></span>
            {editMode && <span style={{ fontSize: 12 }}>On</span>}
          </Button>

          <div style={styles.topBarDivider} />

          <div style={styles.topBarTools}>
            <Button variant="ghosticon" onClick={() => setPreviewMode('desktop')}>
              <ComputerIcon className="icon-sm" />
            </Button>
            <Button variant="ghosticon" onClick={() => setPreviewMode('mobile')}>
              <SmartPhone01Icon className="icon-sm" />
            </Button>
          </div>

          <div style={styles.topBarDivider} />

          <div style={styles.topBarTools}>
            <Button variant="ghosticon" onClick={() => setTheme('light')}>
              <Sun01Icon className="icon-sm" />
            </Button>
            <Button variant="ghosticon" onClick={() => setTheme('dark')}>
              <Moon02Icon className="icon-sm" />
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
