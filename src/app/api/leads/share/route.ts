import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"

// POST - Share lead summary via email or Slack
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { leadId, method } = body

  if (!leadId || !method) {
    return NextResponse.json(
      { error: 'leadId and method are required' },
      { status: 400 }
    )
  }

  if (method !== 'email' && method !== 'slack') {
    return NextResponse.json(
      { error: 'method must be "email" or "slack"' },
      { status: 400 }
    )
  }

  // Fetch the lead
  const { data: lead, error } = await supabaseServer
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single()

  if (error || !lead) {
    return NextResponse.json(
      { error: 'Lead not found' },
      { status: 404 }
    )
  }

  const summary = lead.summary || {}

  if (method === 'email') {
    // TODO: Implement email sending
    // This would typically use a service like SendGrid, Resend, or AWS SES
    // For now, we'll just format the content

    const emailContent = formatLeadSummaryForEmail(lead, summary)

    // In a real implementation, you would send the email here
    // await sendEmail({
    //   to: process.env.LEADS_EMAIL_RECIPIENT,
    //   subject: `New Lead: ${lead.visitor_name || lead.visitor_email || 'Anonymous'}`,
    //   html: emailContent,
    // })

    return NextResponse.json({
      success: true,
      message: 'Email functionality not yet implemented',
      preview: emailContent,
    })
  }

  if (method === 'slack') {
    // TODO: Implement Slack webhook
    // This would use Slack's Incoming Webhooks or Web API

    const slackMessage = formatLeadSummaryForSlack(lead, summary)

    // In a real implementation, you would send to Slack here
    // await fetch(process.env.SLACK_WEBHOOK_URL, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(slackMessage),
    // })

    return NextResponse.json({
      success: true,
      message: 'Slack functionality not yet implemented',
      preview: slackMessage,
    })
  }

  return NextResponse.json({ error: 'Invalid method' }, { status: 400 })
}

function formatLeadSummaryForEmail(lead: any, summary: any): string {
  const date = new Date(lead.created_at).toLocaleDateString()

  let html = `
    <h2>New Lead: ${lead.visitor_name || lead.visitor_email || 'Anonymous'}</h2>
    <p><strong>Date:</strong> ${date}</p>
  `

  if (lead.visitor_email) {
    html += `<p><strong>Email:</strong> ${lead.visitor_email}</p>`
  }

  if (summary.qualificationScore !== undefined) {
    html += `<p><strong>Qualification Score:</strong> ${summary.qualificationScore}%</p>`
  }

  if (summary.companyInfo) {
    html += '<h3>Company</h3><ul>'
    if (summary.companyInfo.name) html += `<li><strong>Name:</strong> ${summary.companyInfo.name}</li>`
    if (summary.companyInfo.industry) html += `<li><strong>Industry:</strong> ${summary.companyInfo.industry}</li>`
    if (summary.companyInfo.size) html += `<li><strong>Size:</strong> ${summary.companyInfo.size}</li>`
    html += '</ul>'
  }

  if (summary.budget) {
    html += '<h3>Budget</h3><ul>'
    if (summary.budget.range) html += `<li><strong>Range:</strong> ${summary.budget.range}</li>`
    if (summary.budget.timeline) html += `<li><strong>Timeline:</strong> ${summary.budget.timeline}</li>`
    if (summary.budget.approved !== undefined) {
      html += `<li><strong>Status:</strong> ${summary.budget.approved ? 'Approved' : 'Pending'}</li>`
    }
    html += '</ul>'
  }

  if (summary.authority) {
    html += '<h3>Authority</h3><ul>'
    if (summary.authority.role) html += `<li><strong>Role:</strong> ${summary.authority.role}</li>`
    if (summary.authority.decisionMaker !== undefined) {
      html += `<li><strong>Decision Maker:</strong> ${summary.authority.decisionMaker ? 'Yes' : 'No'}</li>`
    }
    html += '</ul>'
  }

  if (summary.need) {
    html += '<h3>Need</h3><ul>'
    if (summary.need.problem) html += `<li><strong>Problem:</strong> ${summary.need.problem}</li>`
    if (summary.need.currentSolution) html += `<li><strong>Current Solution:</strong> ${summary.need.currentSolution}</li>`
    if (summary.need.painPoints && summary.need.painPoints.length > 0) {
      html += '<li><strong>Pain Points:</strong><ul>'
      summary.need.painPoints.forEach((point: string) => {
        html += `<li>${point}</li>`
      })
      html += '</ul></li>'
    }
    html += '</ul>'
  }

  if (summary.timeline) {
    html += '<h3>Timeline</h3><ul>'
    if (summary.timeline.urgency) html += `<li><strong>Urgency:</strong> ${summary.timeline.urgency}</li>`
    if (summary.timeline.implementationDate) {
      html += `<li><strong>Target Implementation:</strong> ${summary.timeline.implementationDate}</li>`
    }
    html += '</ul>'
  }

  if (summary.nextSteps && summary.nextSteps.length > 0) {
    html += '<h3>Recommended Next Steps</h3><ul>'
    summary.nextSteps.forEach((step: string) => {
      html += `<li>${step}</li>`
    })
    html += '</ul>'
  }

  return html
}

function formatLeadSummaryForSlack(lead: any, summary: any): any {
  const date = new Date(lead.created_at).toLocaleDateString()
  const name = lead.visitor_name || lead.visitor_email || 'Anonymous'

  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `🎯 New Lead: ${name}`,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Date:*\n${date}`,
        },
      ],
    },
  ]

  if (lead.visitor_email) {
    blocks[1]?.fields?.push({
      type: 'mrkdwn',
      text: `*Email:*\n${lead.visitor_email}`,
    })
  }

  if (summary.qualificationScore !== undefined) {
    blocks[1]?.fields?.push({
      type: 'mrkdwn',
      text: `*Qualification Score:*\n${summary.qualificationScore}%`,
    })
  }

  if (summary.companyInfo) {
    const companyFields = []
    if (summary.companyInfo.name) {
      companyFields.push({
        type: 'mrkdwn',
        text: `*Company:*\n${summary.companyInfo.name}`,
      })
    }
    if (summary.companyInfo.industry) {
      companyFields.push({
        type: 'mrkdwn',
        text: `*Industry:*\n${summary.companyInfo.industry}`,
      })
    }
    if (companyFields.length > 0) {
      blocks.push({
        type: 'section',
        fields: companyFields,
      })
    }
  }

  if (summary.need?.problem) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Problem:*\n${summary.need.problem}`,
      },
    })
  }

  if (summary.budget?.range) {
    blocks.push({
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Budget:*\n${summary.budget.range}`,
        },
      ],
    })
  }

  return { blocks }
}
