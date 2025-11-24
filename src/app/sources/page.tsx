"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { TopBar } from "@/components/layout/TopBar"
import { NavigationSidebar } from "@/components/layout/NavigationSidebar"
import {
  Add01Icon,
  Delete02Icon,
  Upload01Icon,
  RefreshIcon,
  InformationCircleIcon,
  Globe02Icon,
} from "hugeicons-react"

interface Source {
  id: string
  title: string | null
  content: string
  created_at: string
  metadata?: {
    type?: 'file' | 'text' | 'website' | 'qna' | 'notion' | 'suggestion'
    url?: string
    filename?: string
    size?: number
  } | null
}

type SourceType = 'files' | 'text' | 'website' | 'qna' | 'notion' | 'suggestions'

export default function SourcesPage() {
  const searchParams = useSearchParams()
  const activeSection = (searchParams.get('section') || 'files') as SourceType

  const [sources, setSources] = useState<Source[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [isRetraining, setIsRetraining] = useState(false)
  const [needsRetraining, setNeedsRetraining] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  const [isDragging, setIsDragging] = useState(false)

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
      const payload: {
        title: string | null
        content: string
        url?: string
        type?: string
      } = {
        title: newTitle.trim() || null,
        content: newContent.trim(),
        type: getSectionType(activeSection),
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
        setNewTitle("")
        setNewContent("")
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
    if (!confirm('Are you sure you want to delete this source?')) return

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

  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return

    setIsAdding(true)
    try {
      const formData = new FormData()
      Array.from(files).forEach(file => formData.append('files', file))

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

  function getSectionType(section: SourceType): 'file' | 'text' | 'website' | 'qna' | 'notion' | 'suggestion' {
    const typeMap: Record<SourceType, 'file' | 'text' | 'website' | 'qna' | 'notion' | 'suggestion'> = {
      'files': 'file',
      'text': 'text',
      'website': 'website',
      'qna': 'qna',
      'notion': 'notion',
      'suggestions': 'suggestion',
    }
    return typeMap[section]
  }

  // Filter sources by type metadata
  const filteredSources = sources.filter(s => {
    // Only show sources that have the matching type
    return s.metadata?.type === getSectionType(activeSection)
  })
  console.log('[Sources Page] Active section:', activeSection)
  console.log('[Sources Page] Looking for type:', getSectionType(activeSection))
  console.log('[Sources Page] Filtered sources:', filteredSources.length)
  console.log('[Sources Page] All source types:', sources.map(s => s.metadata?.type))

  const totalSize = sources.reduce((acc, s) => acc + (s.metadata?.size || 0), 0)
  const totalLinks = sources.filter(s => s.metadata?.type === 'website').length

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
        <NavigationSidebar />

        {/* Main Content */}
        <main style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
        }}>
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: 'var(--op-space-large)',
          }}>
            <div style={{ marginBottom: 'var(--op-space-large)' }}>
              <h1 style={{
                fontSize: 'var(--op-font-x-large)',
                fontWeight: 'var(--op-font-weight-bold)',
                margin: 0,
                textTransform: 'capitalize',
              }}>
                {activeSection}
              </h1>
              <p style={{
                fontSize: 'var(--op-font-small)',
                color: 'var(--op-color-neutral-on-plus-max)',
                margin: 'var(--op-space-2x-small) 0 0 0',
              }}>
                {activeSection === 'files' && 'Upload documents to train your AI. Extract text from PDFs, DOCX, and TXT files.'}
                {activeSection === 'text' && 'Add plain text content for your chatbot to learn from.'}
                {activeSection === 'website' && 'Add website URLs to scrape content from.'}
                {activeSection === 'qna' && 'Add question and answer pairs for precise responses.'}
                {activeSection === 'notion' && 'Import content from your Notion workspace.'}
                {activeSection === 'suggestions' && 'View AI-suggested content improvements.'}
              </p>
            </div>

            {/* File Upload Section */}
            {activeSection === 'files' && (
              <div className="card" style={{ marginBottom: 'var(--op-space-large)' }}>
                <div className="card-header">
                  <h2 style={{ fontSize: 'var(--op-font-medium)', margin: 0 }}>
                    Add files
                  </h2>
                </div>
                <div className="card-body">
                  {/* Warning Message */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--op-space-small)',
                    padding: 'var(--op-space-medium)',
                    backgroundColor: 'var(--op-color-warning-background)',
                    border: '1px solid var(--op-color-warning-border)',
                    borderRadius: 'var(--op-radius-small)',
                    marginBottom: 'var(--op-space-medium)',
                  }}>
                    <InformationCircleIcon
                      className="icon-sm"
                      style={{
                        color: 'var(--op-color-warning)',
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    />
                    <span style={{
                      fontSize: 'var(--op-font-small)',
                      color: 'var(--op-color-warning)',
                    }}>
                      If you are uploading a PDF, make sure you can select/highlight the text.
                    </span>
                  </div>

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
                      backgroundColor: isDragging ? 'var(--op-color-primary-background)' : 'transparent',
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
                    <p style={{
                      fontSize: 'var(--op-font-medium)',
                      margin: 0,
                      marginBottom: 'var(--op-space-2x-small)',
                    }}>
                      Drag & drop files here, or click to select files
                    </p>
                    <p style={{
                      fontSize: 'var(--op-font-small)',
                      color: 'var(--op-color-neutral-on-plus-max)',
                      margin: 0,
                    }}>
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
            )}

            {/* Text/Other Content Section */}
            {activeSection !== 'files' && activeSection !== 'suggestions' && (
              <div className="card" style={{ marginBottom: 'var(--op-space-large)' }}>
                <div className="card-header">
                  <h2 style={{ fontSize: 'var(--op-font-medium)', margin: 0 }}>
                    Add New {activeSection === 'text' ? 'Text' : activeSection === 'website' ? 'Website' : 'Content'}
                  </h2>
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--op-space-medium)' }}>
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
                        activeSection === 'text' ? 'e.g., Services Overview' :
                          activeSection === 'website' ? 'e.g., Homepage' :
                            'Enter a title'
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
                    {isAdding ? 'Adding...' : `Add ${activeSection === 'website' ? 'Website' : 'Source'}`}
                  </button>
                </div>
              </div>
            )}

            {/* Sources List */}
            <div>
              <h2 style={{
                fontSize: 'var(--op-font-large)',
                fontWeight: 'var(--op-font-weight-bold)',
                marginBottom: 'var(--op-space-medium)',
              }}>
                Existing Sources ({filteredSources.length})
              </h2>

              {isLoading ? (
                <p style={{ color: 'var(--op-color-neutral-on-plus-max)' }}>Loading...</p>
              ) : filteredSources.length === 0 ? (
                <p style={{ color: 'var(--op-color-neutral-on-plus-max)' }}>
                  No sources yet. Add your first source above to get started.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--op-space-medium)' }}>
                  {filteredSources.map((source) => (
                    <div key={source.id} className="card">
                      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: 'var(--op-font-medium)', margin: 0 }}>
                          {source.title || 'Untitled Source'}
                        </h3>
                        <button
                          className="btn btn--destructive btn--small btn--icon"
                          onClick={() => handleDeleteSource(source.id)}
                          title="Delete source"
                          aria-label={`Delete ${source.title || 'source'}`}
                        >
                          <Delete02Icon className="icon-sm" />
                        </button>
                      </div>
                      <div className="card-body">
                        <p style={{
                          fontSize: 'var(--op-font-small)',
                          whiteSpace: 'pre-wrap',
                          margin: 0,
                          maxHeight: '200px',
                          overflow: 'auto',
                        }}>
                          {source.content}
                        </p>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: 'var(--op-space-small)',
                        }}>
                          <p style={{
                            fontSize: 'var(--op-font-x-small)',
                            color: 'var(--op-color-neutral-on-plus-max)',
                            margin: 0,
                          }}>
                            Added {new Date(source.created_at).toLocaleDateString()}
                          </p>
                          {source.metadata?.size && (
                            <p style={{
                              fontSize: 'var(--op-font-x-small)',
                              color: 'var(--op-color-neutral-on-plus-max)',
                              margin: 0,
                            }}>
                              {(source.metadata.size / 1024).toFixed(2)} KB
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Stats & Actions */}
          <aside style={{
            width: '320px',
            borderLeft: '1px solid var(--op-color-border)',
            padding: 'var(--op-space-large)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--op-space-large)',
            backgroundColor: 'var(--op-color-background)',
          }}>
            <div>
              <h3 style={{
                fontSize: 'var(--op-font-medium)',
                fontWeight: 'var(--op-font-weight-bold)',
                marginBottom: 'var(--op-space-medium)',
              }}>
                Sources
              </h3>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--op-space-small)',
                padding: 'var(--op-space-medium)',
                backgroundColor: 'var(--op-color-neutral-plus-eight)',
                borderRadius: 'var(--op-radius-medium)',
                marginBottom: 'var(--op-space-medium)',
              }}>
                <Globe02Icon className="icon-sm" />
                <span style={{ fontSize: 'var(--op-font-small)' }}>{totalLinks} Links</span>
                <span style={{
                  marginLeft: 'auto',
                  fontSize: 'var(--op-font-small)',
                  fontWeight: 'var(--op-font-weight-bold)',
                }}>
                  {(totalSize / 1024).toFixed(0)} KB
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--op-space-medium) 0',
                borderTop: '1px solid var(--op-color-border)',
              }}>
                <span style={{
                  fontSize: 'var(--op-font-small)',
                  fontWeight: 'var(--op-font-weight-bold)',
                }}>
                  Total size
                </span>
                <span style={{
                  fontSize: 'var(--op-font-small)',
                }}>
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
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--op-space-small)',
                  padding: 'var(--op-space-medium)',
                  backgroundColor: 'var(--op-color-warning-background)',
                  border: '1px solid var(--op-color-warning-border)',
                  borderRadius: 'var(--op-radius-small)',
                  marginTop: 'var(--op-space-medium)',
                }}>
                  <RefreshIcon
                    className="icon-sm"
                    style={{
                      color: 'var(--op-color-warning)',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{
                    fontSize: 'var(--op-font-small)',
                    color: 'var(--op-color-warning)',
                  }}>
                    Retraining is required for changes to apply
                  </span>
                </div>
              )}
            </div>
          </aside>
        </main>
      </div>
    </div>
  )
}
