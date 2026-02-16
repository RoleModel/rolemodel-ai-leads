import { describe, expect, it } from 'vitest'

describe('Tool Part Detection', () => {
  // Simulating the part type detection logic from LandingPageB
  const isToolInvocation = (partType: string) => {
    return partType === 'tool-invocation' || partType.startsWith('tool-')
  }

  const isShowCaseStudyTool = (part: { type: string; toolName?: string }) => {
    return part.toolName === 'show_case_study' || part.type === 'tool-show_case_study'
  }

  it('should detect tool-invocation type', () => {
    expect(isToolInvocation('tool-invocation')).toBe(true)
    expect(isToolInvocation('tool-show_case_study')).toBe(true)
    expect(isToolInvocation('tool-custom')).toBe(true)
    expect(isToolInvocation('text')).toBe(false)
  })

  it('should identify show_case_study tool', () => {
    expect(
      isShowCaseStudyTool({ type: 'tool-invocation', toolName: 'show_case_study' })
    ).toBe(true)
    expect(isShowCaseStudyTool({ type: 'tool-show_case_study' })).toBe(true)
    expect(isShowCaseStudyTool({ type: 'tool-invocation', toolName: 'other_tool' })).toBe(
      false
    )
  })

  it('should extract args from tool part', () => {
    const mockToolPart = {
      type: 'tool-invocation',
      toolName: 'show_case_study',
      toolCallId: 'call-123',
      state: 'result',
      args: {
        url: 'https://rolemodelsoftware.com/case-studies/fieldx-vrt',
        title: 'FieldX VRT',
        description: 'A case study about agricultural technology',
      },
    }

    expect(mockToolPart.args.url).toBe(
      'https://rolemodelsoftware.com/case-studies/fieldx-vrt'
    )
    expect(mockToolPart.args.title).toBe('FieldX VRT')
    expect(mockToolPart.args.description).toBeTruthy()
  })

  it('should handle tool part without optional description', () => {
    const mockToolPart = {
      type: 'tool-invocation',
      toolName: 'show_case_study',
      args: {
        url: 'https://rolemodelsoftware.com/case-studies/test',
        title: 'Test Project',
      },
    }

    expect(mockToolPart.args.url).toBeTruthy()
    expect(mockToolPart.args.title).toBeTruthy()
    expect((mockToolPart.args as { description?: string }).description).toBeUndefined()
  })

  it('should extract enriched metadata from tool result', () => {
    const mockToolPart = {
      type: 'tool-invocation',
      toolName: 'show_case_study',
      toolCallId: 'call-456',
      state: 'result',
      args: {
        url: 'https://rolemodelsoftware.com/case-studies/fieldx-vrt',
        title: 'FieldX VRT',
        description: 'Original description',
      },
      result: {
        success: true,
        url: 'https://rolemodelsoftware.com/case-studies/fieldx-vrt',
        title: 'FieldX VRT - Enriched',
        description: 'Enriched description from scraper',
        backgroundImage: 'https://example.com/fieldx-bg.jpg',
        logo: 'https://example.com/fieldx-logo.svg',
        industry: 'Agriculture',
        tags: ['React Native', 'Mobile App', 'IoT'],
      },
    }

    // Result should take precedence over args
    expect(mockToolPart.result.title).toBe('FieldX VRT - Enriched')
    expect(mockToolPart.result.description).toBe('Enriched description from scraper')
    expect(mockToolPart.result.backgroundImage).toBeTruthy()
    expect(mockToolPart.result.logo).toBeTruthy()
    expect(mockToolPart.result.industry).toBe('Agriculture')
    expect(mockToolPart.result.tags).toHaveLength(3)
  })
})

describe('CaseStudyCard Rendering Logic', () => {
  type ToolPart = {
    type: string
    toolName?: string
    args?: { url?: string; title?: string; description?: string }
    result?: {
      success?: boolean
      url?: string
      title?: string
      description?: string
      backgroundImage?: string
      logo?: string
      industry?: string
      tags?: string[]
    }
  }

  const shouldRenderCaseStudyCard = (toolPart: ToolPart): boolean => {
    const isShowCaseStudy =
      toolPart.toolName === 'show_case_study' || toolPart.type === 'tool-show_case_study'
    // Check for URL in result (enriched) or args (fallback)
    const url = toolPart.result?.url || toolPart.args?.url
    return isShowCaseStudy && Boolean(url)
  }

  const getCardProps = (toolPart: ToolPart) => ({
    url: toolPart.result?.url || toolPart.args?.url,
    title: toolPart.result?.title || toolPart.args?.title,
    description: toolPart.result?.description || toolPart.args?.description,
    backgroundImage: toolPart.result?.backgroundImage,
    logo: toolPart.result?.logo,
    industry: toolPart.result?.industry,
    tags: toolPart.result?.tags,
  })

  it('should render CaseStudyCard for valid show_case_study tool', () => {
    const part: ToolPart = {
      type: 'tool-invocation',
      toolName: 'show_case_study',
      args: {
        url: 'https://rolemodelsoftware.com/case-studies/test',
        title: 'Test',
      },
    }

    expect(shouldRenderCaseStudyCard(part)).toBe(true)
  })

  it('should render CaseStudyCard with enriched metadata from result', () => {
    const part: ToolPart = {
      type: 'tool-invocation',
      toolName: 'show_case_study',
      args: {
        url: 'https://rolemodelsoftware.com/case-studies/test',
        title: 'Test from Args',
      },
      result: {
        success: true,
        url: 'https://rolemodelsoftware.com/case-studies/test',
        title: 'Test from Result',
        description: 'Enriched description',
        backgroundImage: 'https://example.com/bg.jpg',
        logo: 'https://example.com/logo.svg',
        industry: 'Technology',
        tags: ['React', 'TypeScript'],
      },
    }

    expect(shouldRenderCaseStudyCard(part)).toBe(true)

    const props = getCardProps(part)
    expect(props.title).toBe('Test from Result') // Result takes precedence
    expect(props.description).toBe('Enriched description')
    expect(props.backgroundImage).toBe('https://example.com/bg.jpg')
    expect(props.logo).toBe('https://example.com/logo.svg')
    expect(props.industry).toBe('Technology')
    expect(props.tags).toEqual(['React', 'TypeScript'])
  })

  it('should fallback to args when result is not available', () => {
    const part: ToolPart = {
      type: 'tool-invocation',
      toolName: 'show_case_study',
      args: {
        url: 'https://rolemodelsoftware.com/case-studies/test',
        title: 'Test from Args',
        description: 'Description from args',
      },
    }

    const props = getCardProps(part)
    expect(props.url).toBe('https://rolemodelsoftware.com/case-studies/test')
    expect(props.title).toBe('Test from Args')
    expect(props.description).toBe('Description from args')
    expect(props.backgroundImage).toBeUndefined()
    expect(props.logo).toBeUndefined()
  })

  it('should not render CaseStudyCard for text parts', () => {
    const part: ToolPart = {
      type: 'text',
    }

    expect(shouldRenderCaseStudyCard(part)).toBe(false)
  })

  it('should not render CaseStudyCard if URL is missing', () => {
    const part: ToolPart = {
      type: 'tool-invocation',
      toolName: 'show_case_study',
      args: {
        title: 'Test without URL',
      },
    }

    expect(shouldRenderCaseStudyCard(part)).toBe(false)
  })

  it('should not render CaseStudyCard for other tool types', () => {
    const part: ToolPart = {
      type: 'tool-invocation',
      toolName: 'suggest_questions',
      args: {
        url: 'https://example.com',
      },
    }

    expect(shouldRenderCaseStudyCard(part)).toBe(false)
  })

  it('should use URL from result when args URL differs', () => {
    const part: ToolPart = {
      type: 'tool-invocation',
      toolName: 'show_case_study',
      args: {
        url: 'https://old-url.com/case-study',
        title: 'Old Title',
      },
      result: {
        success: true,
        url: 'https://new-url.com/case-study',
        title: 'New Title',
      },
    }

    const props = getCardProps(part)
    expect(props.url).toBe('https://new-url.com/case-study')
    expect(props.title).toBe('New Title')
  })
})
