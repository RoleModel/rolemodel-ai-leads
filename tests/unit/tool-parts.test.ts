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
    expect(isShowCaseStudyTool({ type: 'tool-invocation', toolName: 'show_case_study' })).toBe(true)
    expect(isShowCaseStudyTool({ type: 'tool-show_case_study' })).toBe(true)
    expect(isShowCaseStudyTool({ type: 'tool-invocation', toolName: 'other_tool' })).toBe(false)
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

    expect(mockToolPart.args.url).toBe('https://rolemodelsoftware.com/case-studies/fieldx-vrt')
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
})

describe('Message Part Rendering Logic', () => {
  type MessagePart =
    | { type: 'text'; text: string }
    | {
      type: 'tool-invocation'
      toolName: string
      args: { url?: string; title?: string; description?: string }
    }

  const shouldRenderWebPreview = (part: MessagePart): boolean => {
    if (part.type !== 'tool-invocation') return false
    const isShowCaseStudy = part.toolName === 'show_case_study'
    const hasUrl = Boolean(part.args?.url)
    return isShowCaseStudy && hasUrl
  }

  it('should render web preview for valid show_case_study tool', () => {
    const part: MessagePart = {
      type: 'tool-invocation',
      toolName: 'show_case_study',
      args: {
        url: 'https://rolemodelsoftware.com/case-studies/test',
        title: 'Test',
      },
    }

    expect(shouldRenderWebPreview(part)).toBe(true)
  })

  it('should not render web preview for text parts', () => {
    const part: MessagePart = {
      type: 'text',
      text: 'Hello world',
    }

    expect(shouldRenderWebPreview(part as MessagePart)).toBe(false)
  })

  it('should not render web preview if URL is missing', () => {
    const part: MessagePart = {
      type: 'tool-invocation',
      toolName: 'show_case_study',
      args: {
        title: 'Test without URL',
      },
    }

    expect(shouldRenderWebPreview(part)).toBe(false)
  })
})

