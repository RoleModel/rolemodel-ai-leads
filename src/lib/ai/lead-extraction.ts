import { generateText } from 'ai'

import type { LeadSummaryData } from '@/components/leads-page/LeadSummary'

import { openai } from '@/lib/ai/gateway'

interface Message {
  role: string
  content: string
}

interface SourceContext {
  id: string
  title: string | null
  content?: string
}

/**
 * Extract BANT (Budget, Authority, Need, Timeline) information from a conversation
 * and generate relevant recommendations based on available sources
 */
export async function extractLeadData(
  messages: Message[],
  availableSources?: SourceContext[]
): Promise<LeadSummaryData | null> {
  try {
    // Build conversation history
    const conversationText = messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n')

    // Build available resources context for recommendations
    const resourcesContext = availableSources && availableSources.length > 0
      ? `\nAVAILABLE RESOURCES FOR RECOMMENDATIONS:
${availableSources.map((s, i) => `${i + 1}. "${s.title}" (ID: ${s.id})`).join('\n')}

When generating recommendations, select 2-4 resources from this list that are most relevant to the prospect's needs and situation.`
      : ''

    const { text } = await generateText({
      model: openai('openai/gpt-4o-mini'),
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: `You are a lead qualification assistant. Analyze sales conversations and extract BANT information (Budget, Authority, Need, Timeline) along with other qualifying details.

CRITICAL - Contact Information:
- Pay special attention to extracting the prospect's NAME and EMAIL ADDRESS
- These are the most important fields - look carefully for when they provide this information
- Email addresses often appear when prospects respond to questions like "What's your email?" or "Where should I send this?"
- Names often appear as "I'm [Name]" or "My name is [Name]" or in email signatures

Extract information ONLY if it was explicitly mentioned or strongly implied in the conversation. Do NOT make assumptions or infer information that isn't there.
${resourcesContext}

Return a JSON object with this structure:
{
  "budget": {
    "range": "string or null (e.g., '$10k-$50k')",
    "timeline": "string or null (e.g., 'Q2 2025')",
    "approved": "boolean or null"
  },
  "authority": {
    "role": "string or null (e.g., 'CTO', 'Founder')",
    "decisionMaker": "boolean or null",
    "stakeholders": ["array of strings or empty"]
  },
  "need": {
    "problem": "string or null (concise description)",
    "currentSolution": "string or null",
    "painPoints": ["array of strings or empty"]
  },
  "timeline": {
    "urgency": "string or null (e.g., 'high', 'medium', 'low')",
    "implementationDate": "string or null"
  },
  "companyInfo": {
    "name": "string or null",
    "size": "string or null (e.g., '10-50 employees')",
    "industry": "string or null"
  },
  "contactInfo": {
    "name": "string or null",
    "email": "string or null",
    "phone": "string or null"
  },
  "alignmentScore": "number 0-100 or null (how well the prospect aligns with your ideal customer profile)",
  "nextSteps": ["array of strings or empty"],
  "recommendations": [
    {
      "title": "string (resource title)",
      "description": "string (brief explanation of why this resource is relevant)",
      "url": "string or null (resource URL if known)",
      "type": "case-study | guide | article | tool | other"
    }
  ]
}

CRITICAL:
- Set fields to null if not mentioned
- Use empty arrays [] if no items found
- alignmentScore should reflect how well the prospect aligns with your ideal customer (0-100)
- recommendations should include 2-4 relevant resources based on their needs and industry
- For recommendations, choose resources that directly address their pain points or situation
- Only extract factual information from the conversation
- Return ONLY valid JSON, no other text`,
        },
        {
          role: 'user',
          content: `Extract lead qualification data from this conversation:\n\n${conversationText}`,
        },
      ],
    })

    // Parse the JSON response
    const leadData = JSON.parse(text) as LeadSummaryData

    // Validate that we have at least some meaningful data
    const hasData =
      leadData.need?.problem ||
      leadData.contactInfo?.email ||
      leadData.companyInfo?.name ||
      (leadData.nextSteps && leadData.nextSteps.length > 0)

    return hasData ? leadData : null
  } catch (error) {
    console.error('Error extracting lead data:', error)
    return null
  }
}

/**
 * Check if a conversation is qualified enough to become a lead
 */
export function isQualifiedLead(data: LeadSummaryData | null): boolean {
  if (!data) return false

  // A lead is qualified if it has:
  // 1. Email address (REQUIRED - must be captured before summary)
  // 2. Name (strongly preferred)
  // 3. At least some indication of need/interest
  const hasEmail = !!data.contactInfo?.email
  const hasName = !!data.contactInfo?.name
  const hasEngagement =
    !!data.need?.problem ||
    !!data.companyInfo?.name ||
    (data.nextSteps && data.nextSteps.length > 0)

  // Email is REQUIRED, name is preferred, plus some engagement
  return !!(hasEmail && (hasName || hasEngagement))
}
