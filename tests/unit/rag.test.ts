import { describe, expect, it, vi } from 'vitest'

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
  })),
}))

// Mock embeddings
vi.mock('@/lib/ai/embeddings', () => ({
  generateEmbedding: vi.fn(() => Promise.resolve(new Array(1536).fill(0))),
}))

describe('RAG Context Building', () => {
  it('should include source URLs in context', async () => {
    // Test that sources with URLs are properly formatted
    const mockSource = {
      id: '1',
      title: 'Test Case Study',
      content: 'This is a test case study about software development.',
      metadata: {
        url: 'https://rolemodelsoftware.com/case-studies/test',
        type: 'case-study',
      },
    }

    // Simulate the context building logic
    const formatSource = (source: typeof mockSource, index: number) => {
      const numbering = `[${index + 1}] ${source.title || 'Untitled'}`
      const url =
        typeof source.metadata?.url === 'string' && source.metadata.url.trim().length > 0
          ? `\nURL: ${source.metadata.url}`
          : ''
      return `${numbering}\n${source.content}${url}`
    }

    const formatted = formatSource(mockSource, 0)

    expect(formatted).toContain('[1] Test Case Study')
    expect(formatted).toContain('This is a test case study')
    expect(formatted).toContain('URL: https://rolemodelsoftware.com/case-studies/test')
  })

  it('should handle sources without URLs', async () => {
    const mockSource = {
      id: '2',
      title: 'Blog Post',
      content: 'A blog post without a URL.',
      metadata: {},
    }

    const formatSource = (source: typeof mockSource, index: number) => {
      const numbering = `[${index + 1}] ${source.title || 'Untitled'}`
      const metadata = source.metadata as Record<string, unknown> | null | undefined
      const url =
        typeof metadata?.url === 'string' && metadata.url.trim().length > 0
          ? `\nURL: ${metadata.url}`
          : ''
      return `${numbering}\n${source.content}${url}`
    }

    const formatted = formatSource(mockSource, 0)

    expect(formatted).toContain('[1] Blog Post')
    expect(formatted).not.toContain('URL:')
  })

  it('should identify case study sources correctly', () => {
    const caseStudyUrls = [
      'https://rolemodelsoftware.com/case-studies/dock-designer',
      'https://rolemodelsoftware.com/portfolio/project-x',
      'https://rolemodelsoftware.com/our-work/client-project',
    ]

    const isCaseStudyUrl = (url: string) => {
      return (
        url.includes('/case-studies/') ||
        url.includes('/portfolio/') ||
        url.includes('/our-work/')
      )
    }

    caseStudyUrls.forEach((url) => {
      expect(isCaseStudyUrl(url)).toBe(true)
    })

    expect(isCaseStudyUrl('https://rolemodelsoftware.com/blog/post')).toBe(false)
    expect(isCaseStudyUrl('https://rolemodelsoftware.com/about')).toBe(false)
  })
})
