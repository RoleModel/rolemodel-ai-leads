import sendgrid from '@sendgrid/mail'
import { marked } from 'marked'
import { supabaseServer } from '@/lib/supabase/server'

if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY is not defined')
}

sendgrid.setApiKey(process.env.SENDGRID_API_KEY)

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function formatSummaryEmailForProspect(
  visitorName: string,
  summaryText: string
): string {
  const calendlyUrl =
    process.env.NEXT_PUBLIC_CALENDLY_URL ||
    'https://calendly.com/rolemodel-software/45-minute-conversation'

  // Convert markdown to HTML using marked
  const htmlContent = marked.parse(summaryText, {
    async: false,
    gfm: true,
    breaks: true,
  }) as string

  // Check if the summary already contains the Calendly link
  const hasCalendlyLink =
    htmlContent.includes(calendlyUrl) || htmlContent.includes('calendly.com')

  // Only add the scheduling link if it's not already in the content
  const schedulingLink = !hasCalendlyLink
    ? `<p style="margin-top: 24px;">If you'd like to discuss this further, you can <a href="${calendlyUrl}">schedule a call with our team</a>.</p>`
    : ''

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 32px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #1a1a1a;
      font-size: 24px;
      margin-top: 0;
      margin-bottom: 24px;
    }
    .content {
      color: #333;
      font-size: 15px;
      line-height: 1.7;
    }
    .content p {
      margin: 0 0 16px 0;
    }
    a {
      color: #0066cc;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    strong {
      font-weight: 600;
      color: #1a1a1a;
    }
    ul {
      margin: 8px 0 16px 0;
      padding-left: 20px;
    }
    li {
      margin-bottom: 4px;
    }
    .footer {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e5e5e5;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <p>Hi ${escapeHtml(visitorName)},</p>
      <p>Thanks for taking the time to explore whether custom software might be the right fit for your needs.</p>
      <p>${htmlContent}</p>
      ${schedulingLink}
    </div>
    <div class="footer">
      <p>Thanks again for your interest in RoleModel Software. We're here to help you make the best decision for your business.</p>
      <p style="margin-top: 16px;">
        <strong>RoleModel Software</strong><br>
        Custom Software Development<br>
        <a href="https://rolemodelsoftware.com">rolemodelsoftware.com</a>
      </p>
    </div>
  </div>
</body>
</html>
`

  return html
}

export interface SendSummaryEmailParams {
  recipientEmail: string
  recipientName?: string
  summaryText: string
  conversationId?: string
}

export async function sendSummaryEmail({
  recipientEmail,
  recipientName,
  summaryText,
  conversationId,
}: SendSummaryEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if email was already sent for this conversation
    if (conversationId) {
      const { data: conversation, error: fetchError } = await supabaseServer
        .from('conversations')
        .select('email_sent_at')
        .eq('id', conversationId)
        .single()

      if (fetchError) {
        console.error('[Email] Error fetching conversation:', fetchError)
        // Continue anyway - don't block if we can't check
      } else if (conversation?.email_sent_at) {
        console.log('[Email] Email already sent at:', conversation.email_sent_at)
        return { success: false, error: 'Email already sent for this conversation' }
      }
    }

    const visitorName = recipientName || 'there'

    // Format email HTML
    const emailHtml = formatSummaryEmailForProspect(visitorName, summaryText)

    // Send email via SendGrid
    const msg = {
      to: recipientEmail,
      from: 'RoleModel Software <consult@rolemodelsoftware.com>',
      subject: 'Your Custom Software Assessment Summary',
      html: emailHtml,
    }

    await sendgrid.send(msg)

    console.log('[Email] Summary sent to:', recipientEmail)

    // Update email_sent_at timestamp
    if (conversationId) {
      const { error: updateError } = await supabaseServer
        .from('conversations')
        .update({ email_sent_at: new Date().toISOString() })
        .eq('id', conversationId)

      if (updateError) {
        console.error('[Email] Error updating email_sent_at:', updateError)
        // Don't fail - email was sent successfully
      }
    }

    return { success: true }
  } catch (error) {
    console.error('[Email] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
