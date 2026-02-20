import * as postmark from 'postmark'
import { isEnabled } from '@/lib/feature-flags'
import { emailTemplates } from '@/lib/email-templates'

function getClient() {
  return new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN || '')
}

export async function sendEmail(template: string, to: string, data: Record<string, any>) {
  const flag = await isEnabled('custom_smtp')
  if (!flag) {
    console.log(`Email skipped (custom_smtp off): ${template} to ${to}`)
    return
  }

  const tmpl = emailTemplates[template]
  if (!tmpl) {
    console.error(`Unknown email template: ${template}`)
    return
  }

  try {
    await getClient().sendEmail({
      From: 'Platinum Directory <noreply@platinumdirectorytemeculavalley.com>',
      To: to,
      Subject: tmpl.subject(data),
      HtmlBody: tmpl.html(data),
      TextBody: tmpl.text(data),
      MessageStream: 'outbound',
    })
  } catch (err) {
    console.error(`Failed to send email ${template} to ${to}:`, err)
  }
}
