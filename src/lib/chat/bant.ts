import type { UIMessage } from 'ai'

type BantStepId = 'name' | 'email' | 'need' | 'timeline' | 'budgetAuthority'

type BantStep = {
  id: BantStepId
  /** Patterns that indicate the AI is asking about this BANT item */
  askPatterns: RegExp[]
}

/**
 * BANT steps with regex patterns to detect when the AI is actually asking
 * for this information (not just mentioning keywords).
 */
const BANT_STEPS: BantStep[] = [
  {
    id: 'name',
    askPatterns: [
      /what(?:'s| is) your name/i,
      /who am i speaking/i,
      /may i (?:have|get|know) your name/i,
      /what should i call you/i,
      /could you (?:share|tell me) your name/i,
      /how should i address you/i,
    ],
  },
  {
    id: 'email',
    askPatterns: [
      /what(?:'s| is) (?:your|the best) email/i,
      /(?:share|provide|give me) (?:your|an) email/i,
      /email (?:address|to reach you)/i,
      /how (?:can|should) (?:i|we) (?:reach|contact) you/i,
      /best (?:way|email) to (?:reach|contact)/i,
    ],
  },
  {
    id: 'need',
    askPatterns: [
      /what (?:challenges?|problems?|issues?|pain points?) (?:are you|do you)/i,
      /what (?:are you|do you) (?:trying to|looking to) (?:solve|accomplish|achieve)/i,
      /tell me (?:about|more about) (?:your|the) (?:challenge|problem|need|goal)/i,
      /what brings you (?:here|to us)/i,
      /what (?:can|would) (?:i|we) help (?:you )?with/i,
      /what (?:is|are) (?:your|the) (?:main|primary|biggest) (?:challenge|problem|goal|need)/i,
    ],
  },
  {
    id: 'timeline',
    askPatterns: [
      /when (?:do you|are you|would you) (?:need|want|hope|like|expect)/i,
      /what(?:'s| is) (?:your|the) (?:timeline|timeframe|deadline)/i,
      /(?:target|ideal|expected) (?:date|timeline|timeframe)/i,
      /how (?:soon|quickly) (?:do you|would you)/i,
      /when (?:are you|do you) (?:hoping|planning|looking) to/i,
    ],
  },
  {
    id: 'budgetAuthority',
    askPatterns: [
      /what(?:'s| is) (?:your|the) budget/i,
      /budget (?:range|in mind|allocated)/i,
      /how much (?:are you|have you) (?:looking to|planning to|willing to) (?:spend|invest)/i,
      /who (?:makes?|is) (?:the|involved in) (?:final )?(?:decision|call)/i,
      /are you the (?:decision maker|one who decides)/i,
      /investment (?:range|you're considering)/i,
    ],
  },
]

/**
 * Checks if an assistant message contains a question asking about a specific BANT step.
 * Uses regex patterns to detect actual questions, not just keyword mentions.
 */
const didAssistantAskAboutStep = (text: string, patterns: RegExp[]) => {
  // Must contain a question mark to be asking something
  if (!text.includes('?')) return false
  return patterns.some((pattern) => pattern.test(text))
}

/**
 * Calculate BANT progress based on which qualification questions the AI has asked.
 * Returns a percentage (0-100) of BANT steps the AI has asked about.
 */
export const getBantProgressFromAssistantQuestions = (
  messages: UIMessage[],
  getMessageContent: (message: UIMessage) => string
) => {
  if (messages.length === 0) {
    return 0
  }

  const assistantMessages = messages
    .filter((message) => message.role === 'assistant')
    .map((message) => getMessageContent(message))

  if (assistantMessages.length === 0) {
    return 0
  }

  const completedSteps = BANT_STEPS.reduce((count, step) => {
    const asked = assistantMessages.some((text) =>
      didAssistantAskAboutStep(text, step.askPatterns)
    )
    return asked ? count + 1 : count
  }, 0)

  return Math.round((completedSteps / BANT_STEPS.length) * 100)
}
