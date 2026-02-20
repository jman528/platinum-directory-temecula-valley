const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://platinumdirectorytemeculavalley.com'

function wrap(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a1a;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;">
<tr><td style="text-align:center;padding-bottom:24px;">
  <img src="${BASE_URL}/logo-light.png" alt="Platinum Directory" height="40" style="height:40px;" />
</td></tr>
<tr><td style="background:rgba(15,23,42,0.95);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:32px;">
${content}
</td></tr>
<tr><td style="text-align:center;padding-top:24px;color:#6b7280;font-size:12px;">
  <p style="margin:0;">Platinum Directory — Temecula Valley</p>
  <p style="margin:4px 0 0;">27450 Ynez Rd, Temecula, CA 92591</p>
  <p style="margin:8px 0 0;"><a href="${BASE_URL}/unsubscribe" style="color:#8b5cf6;">Unsubscribe</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`
}

function btn(text: string, url: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:#C9A84C;border-radius:8px;padding:12px 28px;"><a href="${url}" style="color:#0a0a1a;text-decoration:none;font-weight:600;font-size:14px;">${text}</a></td></tr></table>`
}

type Template = {
  subject: (d: any) => string
  html: (d: any) => string
  text: (d: any) => string
}

export const emailTemplates: Record<string, Template> = {
  welcome: {
    subject: () => 'Welcome to Platinum Directory, Temecula Valley!',
    html: (d) => wrap(`
      <h1 style="color:#ffffff;font-size:24px;margin:0 0 16px;">Welcome aboard!</h1>
      <p style="color:#d1d5db;font-size:15px;line-height:1.6;margin:0 0 16px;">
        Hey ${d.name || 'there'}, thanks for joining Platinum Directory — the premier business directory for Temecula Valley.
      </p>
      <p style="color:#d1d5db;font-size:15px;line-height:1.6;margin:0 0 16px;">
        Here's what you can do:
      </p>
      <ul style="color:#d1d5db;font-size:14px;line-height:1.8;padding-left:20px;">
        <li>Discover local businesses and deals</li>
        <li>Earn points for every interaction</li>
        <li>Redeem exclusive Smart Offers</li>
      </ul>
      ${btn('Explore the Directory', BASE_URL)}
    `),
    text: (d) => `Welcome to Platinum Directory!\n\nHey ${d.name || 'there'}, thanks for joining. Explore businesses, earn points, and find exclusive deals.\n\nVisit: ${BASE_URL}`,
  },

  'business-welcome': {
    subject: () => 'Your Business is Live on Platinum Directory',
    html: (d) => wrap(`
      <h1 style="color:#ffffff;font-size:24px;margin:0 0 16px;">Your listing is live!</h1>
      <p style="color:#d1d5db;font-size:15px;line-height:1.6;margin:0 0 16px;">
        <strong style="color:#C9A84C;">${d.business_name}</strong> is now listed on Platinum Directory.
      </p>
      <p style="color:#d1d5db;font-size:15px;line-height:1.6;margin:0 0 16px;">
        Customers can find you at your listing page. Manage your profile from the dashboard.
      </p>
      ${btn('View Your Listing', `${BASE_URL}/business/${d.slug}`)}
      ${btn('Go to Dashboard', `${BASE_URL}/dashboard`)}
    `),
    text: (d) => `Your business "${d.business_name}" is live on Platinum Directory!\n\nView: ${BASE_URL}/business/${d.slug}\nDashboard: ${BASE_URL}/dashboard`,
  },

  'lead-alert': {
    subject: (d) => `New Lead: ${d.customer_name} is interested in ${d.business_name}`,
    html: (d) => wrap(`
      <h1 style="color:#ffffff;font-size:24px;margin:0 0 16px;">New Lead!</h1>
      <p style="color:#d1d5db;font-size:15px;line-height:1.6;margin:0 0 16px;">
        Someone is interested in <strong style="color:#C9A84C;">${d.business_name}</strong>.
      </p>
      <table style="width:100%;background:rgba(255,255,255,0.05);border-radius:8px;padding:16px;margin:16px 0;">
        <tr><td style="color:#9ca3af;font-size:13px;padding:4px 0;">Name</td><td style="color:#ffffff;font-size:14px;">${d.customer_name}</td></tr>
        <tr><td style="color:#9ca3af;font-size:13px;padding:4px 0;">Email</td><td style="color:#ffffff;font-size:14px;">${d.customer_email || '—'}</td></tr>
        <tr><td style="color:#9ca3af;font-size:13px;padding:4px 0;">Phone</td><td style="color:#ffffff;font-size:14px;">${d.customer_phone || '—'}</td></tr>
        <tr><td style="color:#9ca3af;font-size:13px;padding:4px 0;">Message</td><td style="color:#ffffff;font-size:14px;">${d.message || '—'}</td></tr>
      </table>
      ${btn('Respond in Dashboard', `${BASE_URL}/dashboard/leads`)}
    `),
    text: (d) => `New lead for ${d.business_name}!\n\nName: ${d.customer_name}\nEmail: ${d.customer_email || '—'}\nPhone: ${d.customer_phone || '—'}\nMessage: ${d.message || '—'}\n\nRespond: ${BASE_URL}/dashboard/leads`,
  },

  'smart-offer-purchase': {
    subject: (d) => `Your ${d.offer_name} Voucher — QR Code Inside`,
    html: (d) => wrap(`
      <h1 style="color:#ffffff;font-size:24px;margin:0 0 16px;">Your voucher is ready!</h1>
      <p style="color:#d1d5db;font-size:15px;line-height:1.6;margin:0 0 16px;">
        You purchased <strong style="color:#C9A84C;">${d.offer_name}</strong> from ${d.business_name}.
      </p>
      ${d.qr_code_url ? `<div style="text-align:center;margin:24px 0;"><img src="${d.qr_code_url}" alt="QR Code" width="200" height="200" style="border-radius:8px;" /></div>` : ''}
      <p style="color:#d1d5db;font-size:14px;line-height:1.6;margin:0 0 8px;"><strong style="color:#fff;">How to redeem:</strong></p>
      <ol style="color:#d1d5db;font-size:14px;line-height:1.8;padding-left:20px;">
        <li>Show this QR code at ${d.business_name}</li>
        <li>Staff will scan to verify</li>
        <li>Enjoy your deal!</li>
      </ol>
      ${d.business_address ? `<p style="color:#9ca3af;font-size:13px;margin:16px 0 0;">📍 ${d.business_address}</p>` : ''}
    `),
    text: (d) => `Your voucher for "${d.offer_name}" from ${d.business_name} is ready!\n\nShow your QR code at the business to redeem.\n${d.business_address ? `Address: ${d.business_address}` : ''}`,
  },

  'smart-offer-sold': {
    subject: (d) => `You sold a ${d.offer_name}!`,
    html: (d) => wrap(`
      <h1 style="color:#ffffff;font-size:24px;margin:0 0 16px;">You made a sale!</h1>
      <p style="color:#d1d5db;font-size:15px;line-height:1.6;margin:0 0 16px;">
        Someone just purchased <strong style="color:#C9A84C;">${d.offer_name}</strong>.
      </p>
      <table style="width:100%;background:rgba(255,255,255,0.05);border-radius:8px;padding:16px;margin:16px 0;">
        <tr><td style="color:#9ca3af;font-size:13px;padding:4px 0;">Amount</td><td style="color:#22c55e;font-size:16px;font-weight:bold;">$${d.amount}</td></tr>
        <tr><td style="color:#9ca3af;font-size:13px;padding:4px 0;">Platform Fee</td><td style="color:#ffffff;font-size:14px;">$${d.platform_fee}</td></tr>
        <tr><td style="color:#9ca3af;font-size:13px;padding:4px 0;">Net Earnings</td><td style="color:#22c55e;font-size:14px;font-weight:bold;">$${d.net_amount}</td></tr>
      </table>
      ${btn('View Sales Dashboard', `${BASE_URL}/dashboard/analytics`)}
    `),
    text: (d) => `You sold "${d.offer_name}"!\n\nAmount: $${d.amount}\nPlatform Fee: $${d.platform_fee}\nNet: $${d.net_amount}\n\nDashboard: ${BASE_URL}/dashboard/analytics`,
  },

  'payment-receipt': {
    subject: (d) => `Payment Receipt — Platinum Directory ${d.month || ''}`,
    html: (d) => wrap(`
      <h1 style="color:#ffffff;font-size:24px;margin:0 0 16px;">Payment Received</h1>
      <p style="color:#d1d5db;font-size:15px;line-height:1.6;margin:0 0 16px;">
        Thank you for your payment.
      </p>
      <table style="width:100%;background:rgba(255,255,255,0.05);border-radius:8px;padding:16px;margin:16px 0;">
        <tr><td style="color:#9ca3af;font-size:13px;padding:4px 0;">Amount</td><td style="color:#ffffff;font-size:16px;font-weight:bold;">$${d.amount}</td></tr>
        <tr><td style="color:#9ca3af;font-size:13px;padding:4px 0;">Plan</td><td style="color:#C9A84C;font-size:14px;">${d.tier_name || 'Subscription'}</td></tr>
        <tr><td style="color:#9ca3af;font-size:13px;padding:4px 0;">Next Billing</td><td style="color:#ffffff;font-size:14px;">${d.next_billing || '—'}</td></tr>
      </table>
      ${d.invoice_url ? btn('View Invoice', d.invoice_url) : ''}
    `),
    text: (d) => `Payment received: $${d.amount} for ${d.tier_name || 'Subscription'}.\nNext billing: ${d.next_billing || '—'}${d.invoice_url ? `\nInvoice: ${d.invoice_url}` : ''}`,
  },

  'payment-failed': {
    subject: () => 'Action Required: Payment Failed for Platinum Directory',
    html: (d) => wrap(`
      <h1 style="color:#ef4444;font-size:24px;margin:0 0 16px;">Payment Failed</h1>
      <p style="color:#d1d5db;font-size:15px;line-height:1.6;margin:0 0 16px;">
        We were unable to process your payment for <strong style="color:#C9A84C;">${d.tier_name || 'your subscription'}</strong>.
      </p>
      <p style="color:#d1d5db;font-size:15px;line-height:1.6;margin:0 0 16px;">
        Please update your payment method to continue enjoying premium features.
        If not resolved within 7 days, your account will be downgraded to the free tier.
      </p>
      ${btn('Update Payment Method', `${BASE_URL}/dashboard/billing`)}
    `),
    text: (d) => `Payment failed for ${d.tier_name || 'your subscription'}.\n\nPlease update your payment method: ${BASE_URL}/dashboard/billing\n\nIf not resolved within 7 days, your account will be downgraded.`,
  },

  'payout-confirmation': {
    subject: (d) => `Payout Processed: $${d.amount} sent to your account`,
    html: (d) => wrap(`
      <h1 style="color:#ffffff;font-size:24px;margin:0 0 16px;">Payout Sent!</h1>
      <p style="color:#d1d5db;font-size:15px;line-height:1.6;margin:0 0 16px;">
        We've sent <strong style="color:#22c55e;">$${d.amount}</strong> to your account.
      </p>
      <table style="width:100%;background:rgba(255,255,255,0.05);border-radius:8px;padding:16px;margin:16px 0;">
        <tr><td style="color:#9ca3af;font-size:13px;padding:4px 0;">Total Referrals</td><td style="color:#ffffff;font-size:14px;">${d.total_referrals || 0}</td></tr>
        <tr><td style="color:#9ca3af;font-size:13px;padding:4px 0;">Commission Rate</td><td style="color:#ffffff;font-size:14px;">${d.commission_rate || '10%'}</td></tr>
      </table>
      ${btn('View Earnings', `${BASE_URL}/dashboard/wallet`)}
    `),
    text: (d) => `Payout of $${d.amount} has been sent to your account.\nTotal referrals: ${d.total_referrals || 0}`,
  },

  'referral-signup': {
    subject: () => 'Someone signed up with your referral link!',
    html: (d) => wrap(`
      <h1 style="color:#ffffff;font-size:24px;margin:0 0 16px;">New Referral!</h1>
      <p style="color:#d1d5db;font-size:15px;line-height:1.6;margin:0 0 16px;">
        Someone just signed up using your referral link. You earned <strong style="color:#C9A84C;">${d.points || 500} points</strong>!
      </p>
      <table style="width:100%;background:rgba(255,255,255,0.05);border-radius:8px;padding:16px;margin:16px 0;">
        <tr><td style="color:#9ca3af;font-size:13px;padding:4px 0;">Total Referrals</td><td style="color:#ffffff;font-size:14px;">${d.total_referrals || 1}</td></tr>
        <tr><td style="color:#9ca3af;font-size:13px;padding:4px 0;">Total Points</td><td style="color:#C9A84C;font-size:14px;font-weight:bold;">${d.total_points || 0}</td></tr>
      </table>
      <p style="color:#d1d5db;font-size:14px;line-height:1.6;margin:16px 0 0;">
        Keep sharing to earn more: <strong style="color:#8b5cf6;">${d.referral_link || BASE_URL}</strong>
      </p>
    `),
    text: (d) => `Someone signed up with your referral link! You earned ${d.points || 500} points.\n\nTotal referrals: ${d.total_referrals || 1}\nKeep sharing: ${d.referral_link || BASE_URL}`,
  },

  'giveaway-winner': {
    subject: () => 'You Won the Platinum Directory Giveaway!',
    html: (d) => wrap(`
      <h1 style="color:#C9A84C;font-size:28px;margin:0 0 16px;text-align:center;">Congratulations!</h1>
      <p style="color:#d1d5db;font-size:15px;line-height:1.6;margin:0 0 16px;text-align:center;">
        You've won the <strong style="color:#C9A84C;">${d.giveaway_name || 'Platinum Directory Giveaway'}</strong>!
      </p>
      <div style="background:rgba(212,175,55,0.1);border:1px solid rgba(212,175,55,0.3);border-radius:12px;padding:20px;margin:16px 0;text-align:center;">
        <p style="color:#C9A84C;font-size:20px;font-weight:bold;margin:0;">${d.prize || 'Amazing Prize'}</p>
      </div>
      <p style="color:#d1d5db;font-size:14px;line-height:1.6;margin:0 0 16px;">
        ${d.claim_instructions || 'We will contact you with details on how to claim your prize.'}
      </p>
      ${btn('View Details', `${BASE_URL}/giveaway`)}
    `),
    text: (d) => `Congratulations! You won the ${d.giveaway_name || 'Platinum Directory Giveaway'}!\n\nPrize: ${d.prize || 'Amazing Prize'}\n${d.claim_instructions || 'We will contact you with details.'}`,
  },

  'tier-upgrade-confirmation': {
    subject: (d) => `Welcome to ${d.tier_name} — Here's What's New`,
    html: (d) => wrap(`
      <h1 style="color:#ffffff;font-size:24px;margin:0 0 16px;">You're upgraded!</h1>
      <p style="color:#d1d5db;font-size:15px;line-height:1.6;margin:0 0 16px;">
        Welcome to <strong style="color:#C9A84C;">${d.tier_name}</strong>. Here's what you've unlocked:
      </p>
      <ul style="color:#d1d5db;font-size:14px;line-height:1.8;padding-left:20px;">
        ${(d.features || ['Premium listing', 'Lead alerts', 'Analytics dashboard']).map((f: string) => `<li>${f}</li>`).join('')}
      </ul>
      <p style="color:#d1d5db;font-size:14px;line-height:1.6;margin:16px 0;">
        Need help setting up? Contact us at <a href="mailto:support@platinumdirectorytemeculavalley.com" style="color:#8b5cf6;">support@platinumdirectorytemeculavalley.com</a>
      </p>
      ${btn('Go to Dashboard', `${BASE_URL}/dashboard`)}
    `),
    text: (d) => `Welcome to ${d.tier_name}!\n\nYou've unlocked premium features. Visit your dashboard to get started: ${BASE_URL}/dashboard`,
  },

  'tier-downgrade-notice': {
    subject: () => 'Your Platinum Directory Plan Has Changed',
    html: (d) => wrap(`
      <h1 style="color:#ffffff;font-size:24px;margin:0 0 16px;">Plan Change Notice</h1>
      <p style="color:#d1d5db;font-size:15px;line-height:1.6;margin:0 0 16px;">
        Your subscription to <strong>${d.previous_tier || 'your plan'}</strong> has ended.
        Your listing has been moved to the free tier.
      </p>
      <p style="color:#d1d5db;font-size:14px;line-height:1.6;margin:0 0 16px;">
        Features you'll lose access to:
      </p>
      <ul style="color:#ef4444;font-size:14px;line-height:1.8;padding-left:20px;">
        ${(d.lost_features || ['Lead alerts', 'Analytics', 'Smart Offers', 'AI tools']).map((f: string) => `<li>${f}</li>`).join('')}
      </ul>
      <p style="color:#d1d5db;font-size:14px;line-height:1.6;margin:16px 0;">
        Want to reactivate? You can upgrade again anytime.
      </p>
      ${btn('Reactivate Subscription', `${BASE_URL}/pricing`)}
    `),
    text: (d) => `Your Platinum Directory plan has changed.\n\nYour subscription to ${d.previous_tier || 'your plan'} has ended. Visit ${BASE_URL}/pricing to reactivate.`,
  },
}
