'use client'

import {
  Add01Icon,
  ArrowUp01Icon,
  Delete02Icon,
  Globe02Icon,
  Link01Icon,
  RefreshIcon,
  SidebarRight01Icon,
  Upload01Icon,
} from 'hugeicons-react'
import { AlertCircleIcon, CheckIcon } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

import type { WorkflowControls } from '@/components/admin/WorkflowDesigner'
import { NavigationSidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'

// Dynamically import WorkflowDesigner to avoid SSR issues with ReactFlow
const WorkflowDesigner = dynamic(
  () => import('@/components/admin/WorkflowDesigner').then((mod) => mod.WorkflowDesigner),
  { ssr: false, loading: () => <div>Loading workflow designer...</div> }
)

interface Source {
  id: string
  title: string | null
  content: string
  created_at: string
  metadata?: {
    type?: 'file' | 'text' | 'website' | 'qna'
    url?: string
    filename?: string
    size?: number
  } | null
}

type SourceType = 'files' | 'text' | 'website' | 'qna' | 'workflow'

export default function SourcesPage() {
  const searchParams = useSearchParams()
  const activeSection = (searchParams.get('section') || 'files') as SourceType

  const [sources, setSources] = useState<Source[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [isRetraining, setIsRetraining] = useState(false)
  const [needsRetraining, setNeedsRetraining] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [workflowControls, setWorkflowControls] = useState<WorkflowControls | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set())
  const [isSyncingFramer, setIsSyncingFramer] = useState(false)
  const [framerSyncResult, setFramerSyncResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const toggleSourceExpanded = (id: string) => {
    setExpandedSources((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  useEffect(() => {
    loadSources()
  }, [])

  async function loadSources() {
    try {
      const res = await fetch('/api/sources')
      const data = await res.json()
      console.log('[Sources Page] Loaded sources:', data.sources)
      console.log('[Sources Page] Total sources:', data.sources?.length)
      console.log('[Sources Page] First source:', data.sources?.[0])
      setSources(data.sources || [])
    } catch (error) {
      console.error('Error loading sources:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAddSource() {
    if (!newContent.trim()) return

    setIsAdding(true)
    try {
      const sectionType = getSectionType(activeSection)
      const payload: {
        title: string | null
        content: string
        url?: string
        type?: string
      } = {
        title: newTitle.trim() || null,
        content: newContent.trim(),
        ...(sectionType && { type: sectionType }),
      }

      // If this is a website source, add URL to payload
      if (activeSection === 'website') {
        payload.url = newContent.trim()
      }

      const res = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setNewTitle('')
        setNewContent('')
        setNeedsRetraining(true)
        await loadSources()
      } else {
        const error = await res.json()
        console.error('Error adding source:', error)
        alert(`Failed to add source: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error adding source:', error)
      alert('Failed to add source. Check console for details.')
    } finally {
      setIsAdding(false)
    }
  }

  async function handleDeleteSource(id: string) {
    try {
      await fetch(`/api/sources?id=${id}`, { method: 'DELETE' })
      setNeedsRetraining(true)
      await loadSources()
    } catch (error) {
      console.error('Error deleting source:', error)
    }
  }

  async function handleRetrainAgent() {
    setIsRetraining(true)
    try {
      await fetch('/api/sources/retrain', { method: 'POST' })
      setNeedsRetraining(false)
    } catch (error) {
      console.error('Error retraining agent:', error)
    } finally {
      setIsRetraining(false)
    }
  }

  async function handleFramerSync() {
    setIsSyncingFramer(true)
    setFramerSyncResult(null)
    try {
      const res = await fetch('/api/framer-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          framerUrl: 'https://relaxed-store-637823.framer.app',
          includeBlog: true,
          includeCaseStudies: true,
          includePages: true,
          skipExisting: true,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setFramerSyncResult({
          success: true,
          message: `Synced ${data.result.created} pages (${data.result.skipped} skipped, ${data.result.failed} failed)`,
        })
        setNeedsRetraining(true)
        await loadSources()
      } else {
        setFramerSyncResult({
          success: false,
          message: data.error || 'Sync failed',
        })
      }
    } catch (error) {
      console.error('Error syncing Framer:', error)
      setFramerSyncResult({
        success: false,
        message: 'Network error during sync',
      })
    } finally {
      setIsSyncingFramer(false)
    }
  }

  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return

    setIsAdding(true)
    try {
      const formData = new FormData()
      Array.from(files).forEach((file) => formData.append('files', file))

      const res = await fetch('/api/sources/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        setNeedsRetraining(true)
        await loadSources()
      }
    } catch (error) {
      console.error('Error uploading files:', error)
    } finally {
      setIsAdding(false)
    }
  }

  function getSectionType(
    section: SourceType
  ): 'file' | 'text' | 'website' | 'qna' | null {
    const typeMap: Record<SourceType, 'file' | 'text' | 'website' | 'qna' | null> = {
      files: 'file',
      text: 'text',
      website: 'website',
      qna: 'qna',
      workflow: null, // workflow doesn't have a source type
    }
    return typeMap[section]
  }

  // Filter sources by type metadata
  const filteredSources =
    activeSection === 'workflow'
      ? [] // No sources to show for workflow section
      : sources.filter((s) => {
          // Only show sources that have the matching type
          return s.metadata?.type === getSectionType(activeSection)
        })
  console.log('[Sources Page] Active section:', activeSection)
  console.log('[Sources Page] Looking for type:', getSectionType(activeSection))
  console.log('[Sources Page] Filtered sources:', filteredSources.length)
  console.log(
    '[Sources Page] All source types:',
    sources.map((s) => s.metadata?.type)
  )

  const totalSize = sources.reduce((acc, s) => acc + (s.metadata?.size || 0), 0)
  const totalLinks = sources.filter((s) => s.metadata?.type === 'website').length

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    handleFileUpload(files)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Suspense fallback={<div>Loading...</div>}>
          <NavigationSidebar />
        </Suspense>

        {/* Main Content */}
        <main
          role="main"
          aria-label="Sources content"
          style={{
            flex: 1,
            display: 'flex',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              flex: 1,
              overflow: 'auto',
            }}
          >
            {/* Show WorkflowDesigner for workflow section */}
            {activeSection === 'workflow' ? (
              <>
                <div
                  style={{
                    // marginBottom: 'var(--op-space-large)',
                    borderBottom: '1px solid',
                    borderColor: 'var(--op-color-border)',
                    padding: 'var(--op-space-large)',
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
                      Lead Qualification Rules
                    </h1>
                    <p
                      style={{
                        fontSize: 'var(--op-font-small)',
                        color: 'var(--op-color-neutral-on-plus-max)',
                        margin: 'var(--op-space-2x-small) 0 0 0',
                      }}
                    >
                      Configure questions and scoring criteria to automatically qualify
                      leads.
                    </p>
                  </div>
                  <button
                    className="btn btn--ghost btn--small"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    title={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
                    style={{ flexShrink: 0 }}
                  >
                    <SidebarRight01Icon
                      className="icon-sm"
                      style={{
                        transform: sidebarCollapsed ? 'scaleX(-1)' : 'none',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </button>
                </div>
                <WorkflowDesigner onControlsChange={setWorkflowControls} />
              </>
            ) : (
              <>
                <div
                  style={{
                    // marginBottom: 'var(--op-space-large)',
                    borderBottom: '1px solid',
                    borderColor: 'var(--op-color-border)',
                    padding: 'var(--op-space-large)',
                  }}
                >
                  <h1
                    style={{
                      fontSize: 'var(--op-font-x-large)',
                      fontWeight: 'var(--op-font-weight-bold)',
                      margin: 0,
                      textTransform: 'capitalize',
                    }}
                  >
                    {activeSection === 'qna' ? 'Q & A' : activeSection}
                  </h1>
                  <p
                    style={{
                      fontSize: 'var(--op-font-small)',
                      color: 'var(--op-color-neutral-on-plus-max)',
                      margin: 'var(--op-space-2x-small) 0 0 0',
                    }}
                  >
                    {activeSection === 'files' &&
                      'Upload documents to train your AI. Extract text from PDFs, DOCX, and TXT files.'}
                    {activeSection === 'text' &&
                      'Add plain text content for your chatbot to learn from.'}
                    {activeSection === 'website' &&
                      'Add website URLs to scrape content from.'}
                    {activeSection === 'qna' &&
                      'Add question and answer pairs for precise responses.'}
                  </p>
                </div>

                {/* File Upload Section */}
                {activeSection === 'files' && (
                  <div style={{ padding: 'var(--op-space-medium)' }}>
                    <div
                      className="card"
                      style={{
                        marginBottom: 'var(--op-space-large)',
                        borderBottom: '1px solid',
                        borderColor: 'var(--op-color-border)',
                      }}
                    >
                      <div className="card__header">
                        <h2 style={{ fontSize: 'var(--op-font-medium)', margin: 0 }}>
                          Add files
                        </h2>
                      </div>
                      <div className="card-body">
                        {/* Drag & Drop Area */}
                        <div
                          onDragEnter={handleDragEnter}
                          onDragLeave={handleDragLeave}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          style={{
                            border: `2px dashed ${isDragging ? 'var(--op-color-primary)' : 'var(--op-color-border)'}`,
                            borderRadius: 'var(--op-radius-medium)',
                            padding: 'var(--op-space-3x-large)',
                            textAlign: 'center',
                            backgroundColor: isDragging
                              ? 'var(--op-color-primary-background)'
                              : 'transparent',
                            transition: 'all 0.2s',
                            cursor: 'pointer',
                          }}
                          onClick={() => document.getElementById('file-input')?.click()}
                        >
                          <Upload01Icon
                            className="icon-lg"
                            style={{
                              marginBottom: 'var(--op-space-medium)',
                              color: 'var(--op-color-neutral-on-plus-max)',
                            }}
                          />
                          <p
                            style={{
                              fontSize: 'var(--op-font-medium)',
                              margin: 0,
                              marginBottom: 'var(--op-space-2x-small)',
                            }}
                          >
                            Drag & drop files here, or click to select files
                          </p>
                          <p
                            style={{
                              fontSize: 'var(--op-font-small)',
                              color: 'var(--op-color-neutral-on-plus-max)',
                              margin: 0,
                            }}
                          >
                            Supported file types: pdf, doc, docx, txt
                          </p>
                        </div>

                        <input
                          id="file-input"
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={(e) => handleFileUpload(e.target.files)}
                          style={{ display: 'none' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Text/Other Content Section */}
                {activeSection !== 'files' && (
                  <div style={{ padding: 'var(--op-space-medium)' }}>
                    <div
                      className="card"
                      style={{
                        marginBottom: 'var(--op-space-large)',
                      }}
                    >
                      <div className="card__header">
                        <h2 style={{ fontSize: 'var(--op-font-medium)', margin: 0 }}>
                          Add New{' '}
                          {activeSection === 'text'
                            ? 'Text'
                            : activeSection === 'website'
                              ? 'Website'
                              : 'Content'}
                        </h2>
                      </div>
                      <div
                        className="card-body"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 'var(--op-space-medium)',
                        }}
                      >
                        <div className="form-group">
                          <label htmlFor="source-title" className="form-label">
                            Title {activeSection === 'text' && '(optional)'}
                          </label>
                          <input
                            id="source-title"
                            className="form-control form-control--large"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder={
                              activeSection === 'text'
                                ? 'e.g., Services Overview'
                                : activeSection === 'website'
                                  ? 'e.g., Homepage'
                                  : 'Enter a title'
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="source-content" className="form-label">
                            {activeSection === 'website' ? 'URL' : 'Content'}
                          </label>
                          {activeSection === 'website' ? (
                            <input
                              id="source-content"
                              className="form-control form-control--large"
                              value={newContent}
                              onChange={(e) => setNewContent(e.target.value)}
                              placeholder="https://example.com"
                              type="url"
                              required
                              aria-required="true"
                            />
                          ) : (
                            <textarea
                              id="source-content"
                              className="form-control"
                              value={newContent}
                              onChange={(e) => setNewContent(e.target.value)}
                              placeholder={`Enter the ${activeSection} content that the chatbot should learn from...`}
                              rows={8}
                              style={{ resize: 'vertical' }}
                              required
                              aria-required="true"
                            />
                          )}
                        </div>

                        <button
                          className="btn btn--primary btn--large"
                          onClick={handleAddSource}
                          disabled={isAdding || !newContent.trim()}
                          style={{ alignSelf: 'flex-start' }}
                        >
                          <Add01Icon className="icon-sm" />
                          {isAdding
                            ? 'Adding...'
                            : `Add ${activeSection === 'website' ? 'Website' : 'Source'}`}
                        </button>
                      </div>
                    </div>

                    {/* Framer Sync Card - Website section only */}
                    {activeSection === 'website' && (
                      <div
                        className="card"
                        style={{ marginBottom: 'var(--op-space-large)' }}
                      >
                        <div className="card__header">
                          <h2 style={{ fontSize: 'var(--op-font-medium)', margin: 0 }}>
                            Sync from Framer
                          </h2>
                        </div>
                        <div className="card-body">
                          <p
                            style={{
                              fontSize: 'var(--op-font-small)',
                              color: 'var(--op-color-neutral-on-plus-max)',
                              marginBottom: 'var(--op-space-medium)',
                            }}
                          >
                            Automatically import all case studies, blog posts, and pages
                            from your Framer website.
                          </p>

                          {framerSyncResult && (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--op-space-small)',
                                padding: 'var(--op-space-medium)',
                                backgroundColor: framerSyncResult.success
                                  ? 'var(--op-color-success-background)'
                                  : 'var(--op-color-error-background)',
                                border: `1px solid ${
                                  framerSyncResult.success
                                    ? 'var(--op-color-success-border)'
                                    : 'var(--op-color-error-border)'
                                }`,
                                borderRadius: 'var(--op-radius-small)',
                                marginBottom: 'var(--op-space-medium)',
                              }}
                            >
                              {framerSyncResult.success ? (
                                <CheckIcon
                                  className="icon-sm"
                                  style={{
                                    color: 'var(--op-color-success)',
                                    flexShrink: 0,
                                  }}
                                />
                              ) : (
                                <AlertCircleIcon
                                  className="icon-sm"
                                  style={{
                                    color: 'var(--op-color-error)',
                                    flexShrink: 0,
                                  }}
                                />
                              )}
                              <span
                                style={{
                                  fontSize: 'var(--op-font-small)',
                                  color: framerSyncResult.success
                                    ? 'var(--op-color-success)'
                                    : 'var(--op-color-error)',
                                }}
                              >
                                {framerSyncResult.message}
                              </span>
                            </div>
                          )}

                          <button
                            className="btn btn--secondary btn--large"
                            onClick={handleFramerSync}
                            disabled={isSyncingFramer}
                            style={{ alignSelf: 'flex-start' }}
                          >
                            <RefreshIcon
                              className="icon-sm"
                              style={{
                                animation: isSyncingFramer
                                  ? 'spin 1s linear infinite'
                                  : 'none',
                              }}
                            />
                            {isSyncingFramer ? 'Syncing...' : 'Sync from Framer'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Sources List */}
                <div style={{ padding: 'var(--op-space-medium)' }}>
                  <h2
                    style={{
                      fontSize: 'var(--op-font-large)',
                      fontWeight: 'var(--op-font-weight-bold)',
                      marginBottom: 'var(--op-space-medium)',
                    }}
                  >
                    Existing Sources ({filteredSources.length})
                  </h2>

                  {isLoading ? (
                    <p style={{ color: 'var(--op-color-neutral-on-plus-max)' }}>
                      Loading...
                    </p>
                  ) : filteredSources.length === 0 ? (
                    <p style={{ color: 'var(--op-color-neutral-on-plus-max)' }}>
                      No sources yet. Add your first source above to get started.
                    </p>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--op-space-medium)',
                      }}
                    >
                      {filteredSources.map((source) => {
                        const isExpanded = expandedSources.has(source.id)

                        return (
                          <div key={source.id} className="card">
                            <div
                              className="card__header"
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer',
                                borderBottom: isExpanded
                                  ? '1px solid var(--op-color-border)'
                                  : 'none',
                              }}
                              onClick={() => toggleSourceExpanded(source.id)}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  flex: 1,
                                  minWidth: 0,
                                }}
                              >
                                <ArrowUp01Icon
                                  className="icon-sm"
                                  style={{
                                    flexShrink: 0,
                                    color: 'var(--op-color-neutral-on-plus-max)',
                                    transition: 'transform 0.2s ease-in-out',
                                    transform: isExpanded
                                      ? 'rotate(180deg)'
                                      : 'rotate(0deg)',
                                  }}
                                />

                                <h3
                                  style={{
                                    fontSize: 'var(--op-font-medium)',
                                    margin: 0,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {source.title || 'Untitled Source'}
                                </h3>
                              </div>
                            </div>

                            {/* URL display */}
                            {source.metadata?.url && (
                              <div
                                style={{
                                  display: isExpanded ? 'block' : 'none',
                                  padding: 'var(--op-space-medium)',
                                  // paddingBottom: 'var(--op-space-small)',
                                  borderBottom: isExpanded
                                    ? '1px solid var(--op-color-border)'
                                    : 'none',
                                }}
                              >
                                <a
                                  href={source.metadata.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 'var(--op-space-2x-small)',
                                    fontSize: 'var(--op-font-small)',
                                    color: 'var(--op-color-primary-base)',
                                    textDecoration: 'none',
                                    maxWidth: '100%',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  <Link01Icon
                                    style={{
                                      width: '12px',
                                      height: '12px',
                                      flexShrink: 0,
                                    }}
                                  />
                                  {source.metadata.url}
                                </a>
                              </div>
                            )}

                            {/* Content - collapsible */}
                            <div
                              className="card-body"
                              style={{
                                display: isExpanded ? 'block' : 'none',
                              }}
                            >
                              <p
                                style={{
                                  fontSize: 'var(--op-font-small)',
                                  whiteSpace: 'pre-wrap',
                                  margin: 0,
                                  maxHeight: '400px',
                                  overflow: 'auto',
                                }}
                              >
                                {source.content}
                              </p>
                            </div>

                            {/* Footer with metadata */}
                            <div
                              style={{
                                display: isExpanded ? 'flex' : 'none',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 'var(--op-space-small) var(--op-space-medium)',
                                borderTop: '1px solid var(--op-color-border)',
                                backgroundColor: 'var(--op-color-neutral-plus-eight)',
                              }}
                            >
                              <p
                                style={{
                                  fontSize: 'var(--op-font-small)',
                                  color: 'var(--op-color-neutral-on-plus-max)',
                                  margin: 0,
                                }}
                              >
                                Added {new Date(source.created_at).toLocaleDateString()}
                                {'  '} | {source.content.length.toLocaleString()} chars
                                {source.metadata?.size &&
                                  ` · ${(source.metadata.size / 1024).toFixed(1)} KB`}
                              </p>
                              <button
                                className="btn btn--destructive btn--small btn--icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteSource(source.id)
                                }}
                                title="Delete source"
                                aria-label={`Delete ${source.title || 'source'}`}
                              >
                                <Delete02Icon className="icon-sm" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right Sidebar - Stats & Actions */}
          <aside
            aria-label="Source statistics and actions"
            style={{
              width: sidebarCollapsed ? '0px' : '320px',
              minWidth: sidebarCollapsed ? '0px' : '320px',
              borderLeft: sidebarCollapsed ? 'none' : '1px solid var(--op-color-border)',
              padding: sidebarCollapsed ? '0' : 'var(--op-space-large)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--op-space-large)',
              backgroundColor: 'var(--op-color-background)',
              overflow: 'hidden',
              transition:
                'width 0.3s ease, min-width 0.3s ease, padding 0.3s ease, border 0.3s ease',
            }}
          >
            {activeSection === 'workflow' && workflowControls ? (
              <div>
                <h3
                  style={{
                    fontSize: 'var(--op-font-medium)',
                    fontWeight: 'var(--op-font-weight-bold)',
                    marginBottom: 'var(--op-space-medium)',
                  }}
                >
                  Workflow Controls
                </h3>

                {workflowControls.saveStatus.type && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--op-space-small)',
                      padding: 'var(--op-space-medium)',
                      backgroundColor:
                        workflowControls.saveStatus.type === 'success'
                          ? 'var(--op-color-success-background)'
                          : 'var(--op-color-error-background)',
                      border: `1px solid ${
                        workflowControls.saveStatus.type === 'success'
                          ? 'var(--op-color-success-border)'
                          : 'var(--op-color-error-border)'
                      }`,
                      borderRadius: 'var(--op-radius-small)',
                      marginBottom: 'var(--op-space-medium)',
                    }}
                  >
                    {workflowControls.saveStatus.type === 'success' ? (
                      <CheckIcon
                        className="icon-sm"
                        style={{ color: 'var(--op-color-success)', flexShrink: 0 }}
                      />
                    ) : (
                      <AlertCircleIcon
                        className="icon-sm"
                        style={{ color: 'var(--op-color-error)', flexShrink: 0 }}
                      />
                    )}
                    <span
                      style={{
                        fontSize: 'var(--op-font-small)',
                        color:
                          workflowControls.saveStatus.type === 'success'
                            ? 'var(--op-color-success)'
                            : 'var(--op-color-error)',
                      }}
                    >
                      {workflowControls.saveStatus.message}
                    </span>
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--op-space-small)',
                    marginBottom: 'var(--op-space-large)',
                  }}
                >
                  <Button
                    variant="secondary"
                    style={{ width: '100%' }}
                    onClick={workflowControls.addNode}
                  >
                    <Add01Icon className="icon-sm" />
                    Add Step
                  </Button>

                  {workflowControls.selectedNode && (
                    <Button
                      variant="destructive"
                      style={{ width: '100%' }}
                      onClick={workflowControls.deleteNode}
                    >
                      <Delete02Icon className="icon-sm" />
                      Delete Node
                    </Button>
                  )}

                  {workflowControls.selectedEdge && (
                    <Button
                      variant="icon"
                      style={{ width: '100%' }}
                      onClick={workflowControls.deleteEdge}
                    >
                      <Delete02Icon className="icon-sm" />
                      Delete Connection
                    </Button>
                  )}

                  <Button
                    variant="primary"
                    style={{ width: '100%' }}
                    onClick={workflowControls.saveWorkflow}
                  >
                    <RefreshIcon className="icon-sm" />
                    Save & Apply to Chatbot
                  </Button>
                </div>

                {workflowControls.editMode && workflowControls.selectedNode && (
                  <div
                    style={{
                      borderTop: '1px solid var(--op-color-border)',
                      paddingTop: 'var(--op-space-medium)',
                    }}
                  >
                    <h4
                      style={{
                        fontSize: 'var(--op-font-small)',
                        fontWeight: 'var(--op-font-weight-bold)',
                        marginBottom: 'var(--op-space-small)',
                      }}
                    >
                      Edit Node
                    </h4>

                    <div className="form-group">
                      <label
                        className="form-label"
                        style={{ fontSize: 'var(--op-font-x-small)' }}
                      >
                        Step Name
                      </label>
                      <input
                        className="form-control"
                        placeholder="Step name"
                        value={workflowControls.nodeData.label}
                        onChange={(e) =>
                          workflowControls.setNodeData({
                            ...workflowControls.nodeData,
                            label: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label
                        className="form-label"
                        style={{ fontSize: 'var(--op-font-x-small)' }}
                      >
                        Question/Description
                      </label>
                      <input
                        className="form-control"
                        placeholder="Description"
                        value={workflowControls.nodeData.description}
                        onChange={(e) =>
                          workflowControls.setNodeData({
                            ...workflowControls.nodeData,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label
                        className="form-label"
                        style={{ fontSize: 'var(--op-font-x-small)' }}
                      >
                        Keywords (comma-separated)
                      </label>
                      <input
                        className="form-control"
                        placeholder="keyword1, keyword2"
                        value={workflowControls.nodeData.keywords}
                        onChange={(e) =>
                          workflowControls.setNodeData({
                            ...workflowControls.nodeData,
                            keywords: e.target.value,
                          })
                        }
                      />
                    </div>

                    <Button
                      variant="primary"
                      style={{ width: '100%' }}
                      onClick={workflowControls.updateNode}
                    >
                      Update Node
                    </Button>
                  </div>
                )}

                {workflowControls.selectedEdge && (
                  <div
                    style={{
                      borderTop: '1px solid var(--op-color-border)',
                      paddingTop: 'var(--op-space-medium)',
                    }}
                  >
                    <h4
                      style={{
                        fontSize: 'var(--op-font-small)',
                        fontWeight: 'var(--op-font-weight-bold)',
                        marginBottom: 'var(--op-space-small)',
                      }}
                    >
                      Edit Connection
                    </h4>

                    <div className="form-group">
                      <label
                        className="form-label"
                        style={{ fontSize: 'var(--op-font-x-small)' }}
                      >
                        Label
                      </label>
                      <input
                        className="form-control"
                        placeholder="Connection label"
                        value={workflowControls.edgeData.label}
                        onChange={(e) =>
                          workflowControls.setEdgeData({
                            ...workflowControls.edgeData,
                            label: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label
                        className="form-label"
                        style={{ fontSize: 'var(--op-font-x-small)' }}
                      >
                        Color
                      </label>
                      <select
                        className="form-control"
                        value={workflowControls.edgeData.stroke}
                        onChange={(e) =>
                          workflowControls.setEdgeData({
                            ...workflowControls.edgeData,
                            stroke: e.target.value,
                          })
                        }
                      >
                        <option value="var(--op-color-primary-base)">Primary</option>
                        <option value="var(--op-color-alerts-notice-plus-one)">
                          Notice (Green)
                        </option>
                        <option value="var(--op-color-alerts-warning-plus-one)">
                          Warning (Yellow)
                        </option>
                        <option value="var(--op-color-alerts-danger-plus-one)">
                          Danger (Red)
                        </option>
                        <option value="var(--purple)">Purple</option>
                        <option value="var(--orange)">Orange</option>
                        <option value="var(--light-green)">Light Green</option>
                        <option value="var(--bright-yellow)">Bright Yellow</option>
                        <option value="var(--op-color-neutral-base)">Neutral</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label
                        className="form-label"
                        style={{ fontSize: 'var(--op-font-x-small)' }}
                      >
                        Stroke Width
                      </label>
                      <input
                        className="form-control"
                        type="number"
                        min="1"
                        max="5"
                        value={workflowControls.edgeData.strokeWidth}
                        onChange={(e) =>
                          workflowControls.setEdgeData({
                            ...workflowControls.edgeData,
                            strokeWidth: Number(e.target.value),
                          })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label
                        className="form-label"
                        style={{ fontSize: 'var(--op-font-x-small)' }}
                      >
                        Line Style
                      </label>
                      <select
                        className="form-control"
                        value={workflowControls.edgeData.lineStyle}
                        onChange={(e) =>
                          workflowControls.setEdgeData({
                            ...workflowControls.edgeData,
                            lineStyle: e.target.value as
                              | 'solid'
                              | 'dashed'
                              | 'dotted'
                              | 'animated',
                          })
                        }
                      >
                        <option value="solid">Solid</option>
                        <option value="dashed">Dashed</option>
                        <option value="dotted">Dotted</option>
                        <option value="animated">Animated</option>
                      </select>
                    </div>

                    <Button
                      variant="primary"
                      style={{ width: '100%' }}
                      onClick={workflowControls.updateEdge}
                    >
                      Update Connection
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3
                  style={{
                    fontSize: 'var(--op-font-medium)',
                    fontWeight: 'var(--op-font-weight-bold)',
                    marginBottom: 'var(--op-space-medium)',
                  }}
                >
                  Sources
                </h3>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--op-space-small)',
                    padding: 'var(--op-space-medium)',
                    backgroundColor: 'var(--op-color-neutral-plus-eight)',
                    borderRadius: 'var(--op-radius-medium)',
                    marginBottom: 'var(--op-space-medium)',
                  }}
                >
                  <Globe02Icon className="icon-sm" />
                  <span style={{ fontSize: 'var(--op-font-small)' }}>
                    {totalLinks} Links
                  </span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: 'var(--op-font-small)',
                      fontWeight: 'var(--op-font-weight-bold)',
                    }}
                  >
                    {(totalSize / 1024).toFixed(0)} KB
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--op-space-medium) 0',
                    borderTop: '1px solid var(--op-color-border)',
                  }}
                >
                  <span
                    style={{
                      fontSize: 'var(--op-font-small)',
                      fontWeight: 'var(--op-font-weight-bold)',
                    }}
                  >
                    Total size
                  </span>
                  <span
                    style={{
                      fontSize: 'var(--op-font-small)',
                    }}
                  >
                    {(totalSize / 1024).toFixed(0)} KB / 400 KB
                  </span>
                </div>

                <button
                  className="btn btn--primary"
                  style={{ width: '100%' }}
                  onClick={handleRetrainAgent}
                  disabled={isRetraining || !needsRetraining}
                >
                  <RefreshIcon className="icon-sm" />
                  {isRetraining ? 'Retraining...' : 'Retrain agent'}
                </button>

                {needsRetraining && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--op-space-small)',
                      padding: 'var(--op-space-medium)',
                      backgroundColor: 'var(--op-color-warning-background)',
                      border: '1px solid var(--op-color-warning-border)',
                      borderRadius: 'var(--op-radius-small)',
                      marginTop: 'var(--op-space-medium)',
                    }}
                  >
                    <RefreshIcon
                      className="icon-sm"
                      style={{
                        color: 'var(--op-color-warning)',
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 'var(--op-font-small)',
                        color: 'var(--op-color-warning)',
                      }}
                    >
                      Retraining is required for changes to apply
                    </span>
                  </div>
                )}
              </div>
            )}
          </aside>
        </main>
      </div>
    </div>
  )
}
