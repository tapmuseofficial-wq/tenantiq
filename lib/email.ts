import { Resend } from 'resend'

export async function sendNewApplicationEmail({
  landlordEmail,
  tenantName,
  propertyName,
}: {
  landlordEmail: string
  tenantName: string
  propertyName: string
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) return

  const resend = new Resend(process.env.RESEND_API_KEY)

  await resend.emails.send({
    from: 'TenantIQ <notifications@notifications.tenants-iq.com>',
    to: landlordEmail,
    subject: `New applicant: ${tenantName} applied for ${propertyName}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#0A0F1E;color:#F1F5F9;border-radius:12px;">
        <h2 style="margin:0 0 8px;font-size:20px;color:#F1F5F9;">You have a new applicant</h2>
        <p style="margin:0 0 24px;font-size:15px;color:#94A3B8;">
          <strong style="color:#F1F5F9;">${tenantName}</strong> has applied for
          <strong style="color:#F1F5F9;">${propertyName}</strong>.
        </p>
        <a
          href="https://tenants-iq.com/dashboard"
          style="display:inline-block;background:linear-gradient(135deg,#3B82F6,#8B5CF6);color:#fff;font-weight:700;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none;"
        >
          View their score →
        </a>
        <p style="margin:24px 0 0;font-size:12px;color:#475569;">
          TenantIQ · AI-powered tenant screening
        </p>
      </div>
    `,
  }).catch((err) => {
    console.error('[email] Failed to send new application notification:', err)
  })
}
