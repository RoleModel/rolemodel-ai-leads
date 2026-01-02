import { describe, expect, it, vi } from 'vitest'

/**
 * Conversation Simulator
 * This simulates the full conversation flow without needing to call the actual AI
 */

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  parts: Array<
    | { type: 'text'; text: string }
    | {
      type: 'tool-invocation'
      toolName: string
      args: Record<string, unknown>
      state: 'call' | 'result'
      result?: unknown
    }
  >
}

interface ConversationState {
  messages: Message[]
  coveredAreas: Set<string>
}

const CONVERSATION_AREAS = [
  'problem',
  'alternatives',
  'business_context',
  'goals',
  'investment',
] as const

type ConversationArea = (typeof CONVERSATION_AREAS)[number]

// Detect which area a response covers based on content
const detectCoveredArea = (content: string): ConversationArea | null => {
  const lower = content.toLowerCase()

  if (
    lower.includes('problem') ||
    lower.includes('challenge') ||
    lower.includes('struggling') ||
    lower.includes('issue')
  ) {
    return 'problem'
  }
  if (
    lower.includes('tried') ||
    lower.includes('alternatives') ||
    lower.includes("haven't found") ||
    lower.includes('looked at')
  ) {
    return 'alternatives'
  }
  if (
    lower.includes('business') ||
    lower.includes('company') ||
    lower.includes('industry') ||
    lower.includes('unique')
  ) {
    return 'business_context'
  }
  if (lower.includes('goal') || lower.includes('success') || lower.includes('outcome')) {
    return 'goals'
  }
  if (lower.includes('budget') || lower.includes('investment') || lower.includes('timeline')) {
    return 'investment'
  }

  return null
}

// Get the next question to ask based on covered areas
const getNextQuestion = (coveredAreas: Set<string>): string => {
  if (!coveredAreas.has('problem')) {
    return 'What problem or opportunity is prompting you to consider custom software?'
  }
  if (!coveredAreas.has('alternatives')) {
    return 'What approaches have you considered or tried so far?'
  }
  if (!coveredAreas.has('business_context')) {
    return 'What does your business do, and what makes your situation unique?'
  }
  if (!coveredAreas.has('goals')) {
    return 'What would success look like for this project?'
  }
  if (!coveredAreas.has('investment')) {
    return 'Have you thought about budget range or timing for this project?'
  }
  return 'Thank you for sharing all that information. Would you like to schedule a consultation?'
}

describe('Conversation Simulator', () => {
  const createConversation = (): ConversationState => ({
    messages: [],
    coveredAreas: new Set(),
  })

  const addMessage = (state: ConversationState, role: 'user' | 'assistant', content: string) => {
    const message: Message = {
      id: `msg-${Date.now()}-${Math.random()}`,
      role,
      content,
      parts: [{ type: 'text', text: content }],
    }
    state.messages.push(message)

    if (role === 'user') {
      const area = detectCoveredArea(content)
      if (area) {
        state.coveredAreas.add(area)
      }
    }

    return message
  }

  it('should progress through conversation areas', () => {
    const state = createConversation()

    // Assistant starts with problem question
    addMessage(state, 'assistant', getNextQuestion(state.coveredAreas))
    expect(state.messages[0].content).toContain('problem')

    // User answers about their problem
    addMessage(state, 'user', "We're struggling with manual data entry that takes hours each day")

    // Should now ask about alternatives
    expect(getNextQuestion(state.coveredAreas)).toContain('tried')
  })

  it('should track all 5 conversation areas', () => {
    const state = createConversation()

    // Simulate full conversation
    addMessage(state, 'assistant', getNextQuestion(state.coveredAreas))
    addMessage(state, 'user', 'Our main problem is inefficient inventory tracking')

    addMessage(state, 'assistant', getNextQuestion(state.coveredAreas))
    addMessage(state, 'user', "We've tried Excel and looked at some off-the-shelf solutions")

    addMessage(state, 'assistant', getNextQuestion(state.coveredAreas))
    addMessage(state, 'user', "We're a manufacturing company with unique workflow requirements")

    addMessage(state, 'assistant', getNextQuestion(state.coveredAreas))
    addMessage(state, 'user', 'Our goal is to reduce inventory errors by 90%')

    addMessage(state, 'assistant', getNextQuestion(state.coveredAreas))
    addMessage(state, 'user', 'We have a budget of $50k and want to launch in 3 months')

    expect(state.coveredAreas.size).toBe(5)
    expect(state.coveredAreas.has('problem')).toBe(true)
    expect(state.coveredAreas.has('alternatives')).toBe(true)
    expect(state.coveredAreas.has('business_context')).toBe(true)
    expect(state.coveredAreas.has('goals')).toBe(true)
    expect(state.coveredAreas.has('investment')).toBe(true)
  })

  it('should handle case study tool calls', () => {
    const state = createConversation()

    // Add a tool call message
    const toolMessage: Message = {
      id: 'msg-tool-1',
      role: 'assistant',
      content: '',
      parts: [
        {
          type: 'tool-invocation',
          toolName: 'show_case_study',
          args: {
            url: 'https://rolemodelsoftware.com/case-studies/fieldx-vrt',
            title: 'FieldX VRT',
            description: 'Agricultural technology solution',
          },
          state: 'result',
          result: { success: true },
        },
      ],
    }
    state.messages.push(toolMessage)

    // Verify tool call exists
    const lastMessage = state.messages[state.messages.length - 1]
    const toolPart = lastMessage.parts.find((p) => p.type === 'tool-invocation')

    expect(toolPart).toBeDefined()
    if (toolPart && toolPart.type === 'tool-invocation') {
      expect(toolPart.toolName).toBe('show_case_study')
      expect(toolPart.args.url).toBe('https://rolemodelsoftware.com/case-studies/fieldx-vrt')
    }
  })
})

describe('User Input Triggers', () => {
  const shouldTriggerCaseStudyTool = (input: string): boolean => {
    const triggers = [
      'case study',
      'case studies',
      'previous work',
      'portfolio',
      'examples',
      'what have you built',
      'show me your work',
      'projects',
      "you've done",
      'past clients',
    ]
    const lower = input.toLowerCase()
    return triggers.some((t) => lower.includes(t))
  }

  it('should trigger case study tool for relevant queries', () => {
    expect(shouldTriggerCaseStudyTool('Can you show me some case studies?')).toBe(true)
    expect(shouldTriggerCaseStudyTool("What's in your portfolio?")).toBe(true)
    expect(shouldTriggerCaseStudyTool('Show me examples of your previous work')).toBe(true)
    expect(shouldTriggerCaseStudyTool('What projects have you done?')).toBe(true)
  })

  it('should not trigger for unrelated queries', () => {
    expect(shouldTriggerCaseStudyTool('What are your prices?')).toBe(false)
    expect(shouldTriggerCaseStudyTool('How long does development take?')).toBe(false)
    expect(shouldTriggerCaseStudyTool('Tell me about your team')).toBe(false)
  })
})

