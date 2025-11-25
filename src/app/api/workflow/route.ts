import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

// Default chatbot ID - should match the one in chat route
const DEFAULT_CHATBOT_ID = 'a0000000-0000-0000-0000-000000000001'

// GET - Retrieve workflow configuration
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const chatbotId = searchParams.get('chatbotId') || DEFAULT_CHATBOT_ID

  try {
    // Get workflow from chatbot metadata
    const { data, error } = await supabaseServer
      .from('chatbots')
      .select('id, business_context')
      .eq('id', chatbotId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    // Parse workflow from business_context if it exists
    let workflow = null
    if (data?.business_context) {
      try {
        const context = JSON.parse(data.business_context)
        workflow = context.workflow || null
      } catch {
        // If not JSON, it's just plain text context
      }
    }

    // Return default workflow if none exists
    if (!workflow) {
      workflow = {
        nodes: [
          {
            id: 'start',
            type: 'entry',
            data: { label: 'Lead Enters', description: 'Conversation starts' }
          },
          {
            id: 'q1',
            type: 'question',
            data: {
              label: 'Budget',
              question: "What's your budget for this project?",
              keywords: ['10k', '20k', '50k+', 'enterprise'],
              weight: 30
            }
          },
          {
            id: 'q2',
            type: 'question',
            data: {
              label: 'Timeline',
              question: 'When do you need this completed?',
              keywords: ['asap', 'this quarter', 'next quarter', '6 months'],
              weight: 25
            }
          },
          {
            id: 'q3',
            type: 'question',
            data: {
              label: 'Authority',
              question: 'Are you the decision maker for this project?',
              keywords: ['yes', 'no', 'team', 'committee'],
              weight: 25
            }
          },
          {
            id: 'q4',
            type: 'question',
            data: {
              label: 'Need',
              question: 'What specific problems are you trying to solve?',
              keywords: ['efficiency', 'cost', 'scale', 'automation'],
              weight: 20
            }
          },
          {
            id: 'qualified',
            type: 'outcome',
            data: {
              label: 'Qualified Lead',
              threshold: 70,
              action: 'notify_sales'
            }
          },
          {
            id: 'nurture',
            type: 'outcome',
            data: {
              label: 'Nurture Lead',
              threshold: 40,
              action: 'add_to_sequence'
            }
          }
        ],
        qualificationThreshold: 70,
        questions: []
      }
    }

    return NextResponse.json({ workflow })
  } catch (error) {
    console.error('Error fetching workflow:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workflow' },
      { status: 500 }
    )
  }
}

// POST - Save workflow configuration
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { chatbotId = DEFAULT_CHATBOT_ID, workflow } = body

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow configuration required' },
        { status: 400 }
      )
    }

    // Extract qualification questions and scoring rules from workflow
    const questions = workflow.nodes
      .filter((node: any) => node.type === 'question')
      .map((node: any) => ({
        id: node.id,
        question: node.data.question || node.data.label,
        keywords: node.data.keywords || [],
        weight: node.data.weight || 25,
        required: node.data.required || false
      }))

    const qualificationRules = {
      workflow,
      questions,
      threshold: workflow.qualificationThreshold || 70,
      scoringMethod: workflow.scoringMethod || 'weighted_keywords'
    }

    // Check if chatbot exists
    const { data: existing } = await supabaseServer
      .from('chatbots')
      .select('id, business_context, instructions')
      .eq('id', chatbotId)
      .single()

    let businessContext = {}
    if (existing?.business_context) {
      try {
        businessContext = JSON.parse(existing.business_context)
      } catch {
        businessContext = { description: existing.business_context }
      }
    }

    // Merge workflow into business context
    businessContext = {
      ...businessContext,
      workflow: qualificationRules
    }

    // Generate dynamic instructions based on workflow
    const dynamicInstructions = `
You are a lead qualification assistant. Follow this workflow:

QUALIFICATION QUESTIONS:
${questions.map((q: any, i: number) =>
  `${i + 1}. ${q.question} (Weight: ${q.weight}%)`
).join('\n')}

SCORING CRITERIA:
- Look for these keywords in responses: ${questions.flatMap((q: any) => q.keywords).join(', ')}
- Qualification threshold: ${qualificationRules.threshold}%
- Ask questions naturally in conversation, not all at once
- Score based on keyword matches and response quality

IMPORTANT:
1. Collect name early: "Who am I speaking with today?"
2. Collect email before providing detailed information: "What's the best email to send you details?"
3. Calculate qualification score based on responses
4. Mark as qualified if score >= ${qualificationRules.threshold}%
`

    let result
    if (existing) {
      // Update existing chatbot
      result = await supabaseServer
        .from('chatbots')
        .update({
          business_context: JSON.stringify(businessContext),
          instructions: existing.instructions
            ? existing.instructions + '\n\n' + dynamicInstructions
            : dynamicInstructions,
          updated_at: new Date().toISOString()
        })
        .eq('id', chatbotId)
        .select()
        .single()
    } else {
      // Create new chatbot with workflow
      result = await supabaseServer
        .from('chatbots')
        .insert({
          id: chatbotId,
          name: 'Lead Qualification Bot',
          business_context: JSON.stringify(businessContext),
          instructions: dynamicInstructions,
          model: 'gpt-4o-mini',
          temperature: 0.7
        })
        .select()
        .single()
    }

    if (result.error) {
      console.error('Supabase error:', result.error)
      throw result.error
    }

    return NextResponse.json({
      success: true,
      workflow: qualificationRules,
      message: 'Workflow saved and connected to chatbot'
    })
  } catch (error) {
    console.error('Error saving workflow:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to save workflow', details: errorMessage },
      { status: 500 }
    )
  }
}