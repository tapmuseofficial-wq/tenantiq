import { createHash } from 'crypto'

const CAPI_URL = 'https://ads-api.reddit.com/api/v2.0/conversions/events/a2_j49bo24fm64b'

interface TrackPurchaseOptions {
  conversionId: string
  ip?: string
  userAgent?: string
  email?: string
}

export async function trackRedditPurchase({
  conversionId,
  ip,
  userAgent,
  email,
}: TrackPurchaseOptions): Promise<void> {
  const token = process.env.REDDIT_CONVERSION_TOKEN
  if (!token) return

  const hashedEmail = email
    ? createHash('sha256').update(email.toLowerCase().trim()).digest('hex')
    : undefined

  await fetch(CAPI_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      test_mode: false,
      events: [
        {
          event_at: new Date().toISOString(),
          event_type: { tracking_type: 'Purchase' },
          conversion_id: conversionId,
          user: {
            ...(ip && { ip_address: ip }),
            ...(userAgent && { user_agent: userAgent }),
            ...(hashedEmail && { email: hashedEmail }),
          },
          metadata: {
            currency: 'CAD',
            value: 19.00,
            conversion_id: conversionId,
            products: [
              {
                id: 'tenantiq_pro',
                name: 'TenantIQ Pro',
                category: 'SaaS Subscription',
              },
            ],
          },
        },
      ],
    }),
  }).catch(() => {
    // Non-blocking — don't let a CAPI failure break the page render
  })
}
