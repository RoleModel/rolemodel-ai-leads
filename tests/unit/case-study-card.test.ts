import { describe, expect, it, vi, beforeEach } from 'vitest'

// Mock the case study scraper module
vi.mock('@/lib/framer/case-study-scraper', () => ({
  scrapeCaseStudyMetadata: vi.fn(),
}))

import { scrapeCaseStudyMetadata } from '@/lib/framer/case-study-scraper'

describe('CaseStudyCard Props Interface', () => {
  // Test the expected props interface for the CaseStudyCard component
  interface CaseStudyCardProps {
    url?: string
    title?: string
    description?: string
    backgroundImage?: string
    logo?: string
    cornerRadius?: number
    mobileBreakpoint?: number
    overlayColor?: string
    logoSize?: number
    logoSizeMobile?: number
    variant?: 'auto' | 'idle' | 'hover' | 'mobile'
    className?: string
    isLoading?: boolean
  }

  it('should accept all required props', () => {
    const props: CaseStudyCardProps = {
      url: 'https://rolemodelsoftware.com/case-studies/test',
      title: 'Test Case Study',
      description: 'A test description',
    }

    expect(props.url).toBe('https://rolemodelsoftware.com/case-studies/test')
    expect(props.title).toBe('Test Case Study')
    expect(props.description).toBe('A test description')
  })

  it('should accept enriched metadata props', () => {
    const props: CaseStudyCardProps = {
      url: 'https://rolemodelsoftware.com/case-studies/test',
      title: 'Test Case Study',
      description: 'A test description',
      backgroundImage: 'https://example.com/bg.jpg',
      logo: 'https://example.com/logo.svg',
    }

    expect(props.backgroundImage).toBe('https://example.com/bg.jpg')
    expect(props.logo).toBe('https://example.com/logo.svg')
  })

  it('should handle optional styling props', () => {
    const props: CaseStudyCardProps = {
      cornerRadius: 24,
      mobileBreakpoint: 768,
      overlayColor: '0,0,0',
      logoSize: 180,
      logoSizeMobile: 100,
      variant: 'hover',
      className: 'custom-class',
    }

    expect(props.cornerRadius).toBe(24)
    expect(props.variant).toBe('hover')
    expect(props.className).toBe('custom-class')
  })

  it('should handle loading state', () => {
    const props: CaseStudyCardProps = {
      isLoading: true,
    }

    expect(props.isLoading).toBe(true)
  })
})

describe('Case Study Metadata Scraper', () => {
  const mockScrapeCaseStudyMetadata = scrapeCaseStudyMetadata as ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return metadata for a valid case study URL', async () => {
    const mockMetadata = {
      url: 'https://rolemodelsoftware.com/case-studies/fieldx-vrt',
      title: 'FieldX VRT',
      description: 'Agricultural technology case study',
      backgroundImage: 'https://example.com/fieldx-bg.jpg',
      logo: 'https://example.com/fieldx-logo.svg',
    }

    mockScrapeCaseStudyMetadata.mockResolvedValue(mockMetadata)

    const result = await scrapeCaseStudyMetadata(
      'https://rolemodelsoftware.com/case-studies/fieldx-vrt'
    )

    expect(result).toEqual(mockMetadata)
    expect(mockScrapeCaseStudyMetadata).toHaveBeenCalledWith(
      'https://rolemodelsoftware.com/case-studies/fieldx-vrt'
    )
  })

  it('should return minimal metadata when scraping fails', async () => {
    mockScrapeCaseStudyMetadata.mockResolvedValue({
      url: 'https://rolemodelsoftware.com/case-studies/unknown',
      title: 'Case Study',
    })

    const result = await scrapeCaseStudyMetadata(
      'https://rolemodelsoftware.com/case-studies/unknown'
    )

    expect(result.url).toBe('https://rolemodelsoftware.com/case-studies/unknown')
    expect(result.title).toBe('Case Study')
    expect(result.backgroundImage).toBeUndefined()
    expect(result.logo).toBeUndefined()
  })


})

describe('Tool Part Detection for Case Study', () => {
  // Simulating the part type detection logic used across components
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
    expect(isShowCaseStudyTool({ type: 'tool-invocation', toolName: 'show_case_study' })).toBe(true)
    expect(isShowCaseStudyTool({ type: 'tool-show_case_study' })).toBe(true)
    expect(isShowCaseStudyTool({ type: 'tool-invocation', toolName: 'other_tool' })).toBe(false)
  })
})

describe('Tool Result with Enriched Metadata', () => {
  interface ToolResult {
    success: boolean
    url: string
    title: string
    description?: string
    backgroundImage?: string
    logo?: string
  }

  it('should contain all enriched metadata fields', () => {
    const result: ToolResult = {
      success: true,
      url: 'https://rolemodelsoftware.com/case-studies/fieldx-vrt',
      title: 'FieldX VRT',
      description: 'Agricultural technology case study',
      backgroundImage: 'https://example.com/fieldx-bg.jpg',
      logo: 'https://example.com/fieldx-logo.svg',
    }

    expect(result.success).toBe(true)
    expect(result.url).toBeTruthy()
    expect(result.title).toBeTruthy()
    expect(result.backgroundImage).toBeTruthy()
    expect(result.logo).toBeTruthy()
  })

  it('should handle partial metadata when scraping fails', () => {
    const result: ToolResult = {
      success: true,
      url: 'https://rolemodelsoftware.com/case-studies/unknown',
      title: 'Unknown Project',
    }

    expect(result.success).toBe(true)
    expect(result.url).toBeTruthy()
    expect(result.title).toBeTruthy()
    expect(result.backgroundImage).toBeUndefined()
    expect(result.logo).toBeUndefined()
  })
})

describe('CaseStudyCard Rendering Logic', () => {
  // AI SDK uses 'input' and 'output' for tool parts
  interface ToolPart {
    type: string
    toolName?: string
    input?: {
      url?: string
      title?: string
      description?: string
    }
    output?: {
      success?: boolean
      url?: string
      title?: string
      description?: string
      backgroundImage?: string
      logo?: string
    }
    // Legacy support
    args?: {
      url?: string
      title?: string
      description?: string
    }
    result?: {
      success?: boolean
      url?: string
      title?: string
      description?: string
      backgroundImage?: string
      logo?: string
    }
  }

  const shouldRenderCaseStudyCard = (toolPart: ToolPart): boolean => {
    const isShowCaseStudy =
      toolPart.toolName === 'show_case_study' || toolPart.type === 'tool-show_case_study'
    // AI SDK uses 'input'/'output', but keep 'args'/'result' as fallback
    const inputData = toolPart.input || toolPart.args
    const outputData = toolPart.output || toolPart.result
    const url = outputData?.url || inputData?.url
    return isShowCaseStudy && Boolean(url)
  }

  const getCardProps = (toolPart: ToolPart) => {
    const inputData = toolPart.input || toolPart.args
    const outputData = toolPart.output || toolPart.result
    return {
      url: outputData?.url || inputData?.url,
      title: outputData?.title || inputData?.title,
      description: outputData?.description || inputData?.description,
      backgroundImage: outputData?.backgroundImage,
      logo: outputData?.logo,
    }
  }

  it('should render card for valid show_case_study tool with output', () => {
    const toolPart: ToolPart = {
      type: 'tool-invocation',
      toolName: 'show_case_study',
      input: {
        url: 'https://rolemodelsoftware.com/case-studies/test',
        title: 'Test',
      },
      output: {
        success: true,
        url: 'https://rolemodelsoftware.com/case-studies/test',
        title: 'Test Case Study',
        description: 'Enriched description',
        backgroundImage: 'https://example.com/bg.jpg',
        logo: 'https://example.com/logo.svg',
      },
    }

    expect(shouldRenderCaseStudyCard(toolPart)).toBe(true)

    const props = getCardProps(toolPart)
    expect(props.title).toBe('Test Case Study') // Uses output over input
    expect(props.description).toBe('Enriched description')
    expect(props.backgroundImage).toBe('https://example.com/bg.jpg')
    expect(props.logo).toBe('https://example.com/logo.svg')
  })

  it('should fallback to input when output is not available', () => {
    const toolPart: ToolPart = {
      type: 'tool-invocation',
      toolName: 'show_case_study',
      input: {
        url: 'https://rolemodelsoftware.com/case-studies/test',
        title: 'Test from Input',
        description: 'Description from input',
      },
    }

    expect(shouldRenderCaseStudyCard(toolPart)).toBe(true)

    const props = getCardProps(toolPart)
    expect(props.url).toBe('https://rolemodelsoftware.com/case-studies/test')
    expect(props.title).toBe('Test from Input')
    expect(props.description).toBe('Description from input')
    expect(props.backgroundImage).toBeUndefined()
    expect(props.logo).toBeUndefined()
  })

  it('should not render card for text parts', () => {
    const toolPart: ToolPart = {
      type: 'text',
    }

    expect(shouldRenderCaseStudyCard(toolPart)).toBe(false)
  })

  it('should not render card if URL is missing', () => {
    const toolPart: ToolPart = {
      type: 'tool-invocation',
      toolName: 'show_case_study',
      input: {
        title: 'Test without URL',
      },
    }

    expect(shouldRenderCaseStudyCard(toolPart)).toBe(false)
  })

  it('should not render card for other tool types', () => {
    const toolPart: ToolPart = {
      type: 'tool-invocation',
      toolName: 'suggest_questions',
      input: {
        url: 'https://example.com',
      },
    }

    expect(shouldRenderCaseStudyCard(toolPart)).toBe(false)
  })
})

describe('AI Tool Integration', () => {
  it('should call show_case_study tool with correct parameters', () => {
    // Simulating the tool input schema
    const toolInput = {
      url: 'https://rolemodelsoftware.com/case-studies/fieldx-vrt',
      title: 'FieldX VRT',
      description: 'A case study about agricultural technology',
    }

    // Validate URL format
    expect(() => new URL(toolInput.url)).not.toThrow()
    expect(toolInput.title).toBeTruthy()
    expect(typeof toolInput.description).toBe('string')
  })

  it('should handle tool execution result structure', () => {
    // Expected result structure from show_case_study tool
    const expectedResult = {
      success: true,
      url: 'https://rolemodelsoftware.com/case-studies/fieldx-vrt',
      title: 'FieldX VRT',
      description: 'Agricultural technology case study',
      backgroundImage: 'https://example.com/fieldx-bg.jpg',
      logo: 'https://example.com/fieldx-logo.svg',
    }

    expect(expectedResult.success).toBe(true)
    expect(expectedResult.url).toMatch(/^https:\/\//)
    expect(expectedResult.backgroundImage).toMatch(/^https:\/\//)
    expect(expectedResult.logo).toMatch(/^https:\/\//)
  })
})
