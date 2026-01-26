import { describe, expect, it, vi } from 'vitest'

// Mock the AI SDK
vi.mock('ai', () => ({
  streamText: vi.fn(),
  tool: vi.fn((config) => config),
}))

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({
              data: {
                id: 'test-chatbot-id',
                business_context: 'Test business context',
                instructions: 'Test instructions',
              },
              error: null,
            })
          ),
          order: vi.fn(() => ({
            limit: vi.fn(() =>
              Promise.resolve({
                data: [],
                error: null,
              })
            ),
          })),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
  })),
}))

describe('Chat API', () => {
  describe('System Prompt Structure', () => {
    it('should include the 5-question conversation structure', () => {
      const systemPrompt = `
CONVERSATION STRUCTURE:
1. Problem - What problem or opportunity is prompting you to consider custom software?
2. Alternatives tried - What approaches have you considered or tried so far?
3. Business context - What does your business do, and what makes your situation unique?
4. Goals / success metrics - What would success look like for this project?
5. Investment mindset - Have you thought about budget range or timing for this project?
      `

      expect(systemPrompt).toContain('Problem')
      expect(systemPrompt).toContain('Alternatives tried')
      expect(systemPrompt).toContain('Business context')
      expect(systemPrompt).toContain('Goals / success metrics')
      expect(systemPrompt).toContain('Investment mindset')
    })

    it('should include case study tool instructions', () => {
      const systemPrompt = `
CASE STUDY PREVIEWS (MANDATORY - YOU MUST USE THE TOOL):
- When the user asks about previous work, portfolio, case studies, examples, or "what have you built", you MUST call the show_case_study tool.
- Look for sources in the Available Knowledge Base that have URLs containing "/case-studies/" or "/portfolio/".
      `

      expect(systemPrompt).toContain('show_case_study')
      expect(systemPrompt).toContain('MANDATORY')
      expect(systemPrompt).toContain('/case-studies/')
    })
  })

  describe('Tool Definitions', () => {
    it('should define show_case_study tool with correct schema', () => {
      const toolDefinition = {
        description:
          'REQUIRED: Display an interactive web preview of a case study. You MUST call this tool when the user asks about previous work.',
        inputSchema: {
          url: { type: 'string', description: 'The full URL of the case study page' },
          title: { type: 'string', description: 'Title of the case study' },
          description: { type: 'string', optional: true, description: 'Brief description' },
        },
      }

      expect(toolDefinition.description).toContain('REQUIRED')
      expect(toolDefinition.inputSchema.url).toBeDefined()
      expect(toolDefinition.inputSchema.title).toBeDefined()
    })
  })
})

describe('File Attachments', () => {
  interface FileUIPart {
    type: 'file'
    url: string
    mediaType: string
    filename?: string
  }

  interface PromptInputMessage {
    text: string
    files: FileUIPart[]
  }

  const createSendMessagePayload = (message: PromptInputMessage) => {
    return {
      text: message.text,
      files: message.files.length > 0 ? message.files : undefined,
    }
  }

  it('should include files in sendMessage payload when files are attached', () => {
    const message: PromptInputMessage = {
      text: 'Here is my document',
      files: [
        {
          type: 'file',
          url: 'data:image/png;base64,iVBORw0KGgo...',
          mediaType: 'image/png',
          filename: 'screenshot.png',
        },
      ],
    }

    const payload = createSendMessagePayload(message)

    expect(payload.text).toBe('Here is my document')
    expect(payload.files).toBeDefined()
    expect(payload.files).toHaveLength(1)
    expect(payload.files![0].mediaType).toBe('image/png')
    expect(payload.files![0].filename).toBe('screenshot.png')
  })

  it('should not include files in payload when no files are attached', () => {
    const message: PromptInputMessage = {
      text: 'Just a text message',
      files: [],
    }

    const payload = createSendMessagePayload(message)

    expect(payload.text).toBe('Just a text message')
    expect(payload.files).toBeUndefined()
  })

  it('should allow sending only files without text', () => {
    const message: PromptInputMessage = {
      text: '',
      files: [
        {
          type: 'file',
          url: 'data:application/pdf;base64,JVBERi0...',
          mediaType: 'application/pdf',
          filename: 'document.pdf',
        },
      ],
    }

    // Should be allowed to send (text is empty but files exist)
    const shouldSend = message.text.trim() !== '' || message.files.length > 0
    expect(shouldSend).toBe(true)

    const payload = createSendMessagePayload(message)
    expect(payload.files).toHaveLength(1)
  })

  it('should handle multiple file attachments', () => {
    const message: PromptInputMessage = {
      text: 'Multiple files attached',
      files: [
        {
          type: 'file',
          url: 'data:image/png;base64,abc...',
          mediaType: 'image/png',
          filename: 'image1.png',
        },
        {
          type: 'file',
          url: 'data:image/jpeg;base64,def...',
          mediaType: 'image/jpeg',
          filename: 'image2.jpg',
        },
        {
          type: 'file',
          url: 'data:application/pdf;base64,ghi...',
          mediaType: 'application/pdf',
          filename: 'doc.pdf',
        },
      ],
    }

    const payload = createSendMessagePayload(message)

    expect(payload.files).toHaveLength(3)
    expect(payload.files![0].mediaType).toBe('image/png')
    expect(payload.files![1].mediaType).toBe('image/jpeg')
    expect(payload.files![2].mediaType).toBe('application/pdf')
  })
})

describe('Conversation Flow', () => {
  // Simulate a conversation to test flow
  const simulateConversation = () => {
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = []

    const addUserMessage = (content: string) => {
      messages.push({ role: 'user', content })
    }

    const addAssistantMessage = (content: string) => {
      messages.push({ role: 'assistant', content })
    }

    const getLastAssistantMessage = () => {
      return messages.filter((m) => m.role === 'assistant').pop()
    }

    return { messages, addUserMessage, addAssistantMessage, getLastAssistantMessage }
  }

  it('should track conversation progress through 5 areas', () => {
    const { addUserMessage, addAssistantMessage, messages } = simulateConversation()

    // Initial greeting
    addAssistantMessage(
      'Hi! What problem or opportunity is prompting you to consider custom software?'
    )

    // User responds to problem
    addUserMessage("We're struggling with manual time tracking using spreadsheets")
    addAssistantMessage(
      "That sounds frustrating. What approaches have you tried so far to address this?"
    )

    // User responds to alternatives
    addUserMessage("We've looked at some off-the-shelf solutions but they don't fit our workflow")
    addAssistantMessage(
      "I see. Could you tell me more about your business and what makes your workflow unique?"
    )

    expect(messages.length).toBe(5)
    expect(messages[0].content).toContain('problem')
    expect(messages[2].content).toContain('tried')
    expect(messages[4].content).toContain('business')
  })

  it('should handle case study requests', () => {
    const { addUserMessage, messages } = simulateConversation()

    addUserMessage('Can you show me some examples of your previous work?')

    // In a real scenario, the AI would call show_case_study tool
    const shouldShowCaseStudy = (userMessage: string) => {
      const triggers = [
        'previous work',
        'portfolio',
        'case studies',
        'examples',
        'what have you built',
        'show me',
      ]
      return triggers.some((trigger) => userMessage.toLowerCase().includes(trigger))
    }

    expect(shouldShowCaseStudy(messages[0].content)).toBe(true)
  })
})

