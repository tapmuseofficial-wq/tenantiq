const CAPI_URL = 'https://ads-api.reddit.com/api/v2.0/conversions/events/a2_j49bo24fm64b'

export async function trackRedditPurchase(conversionId: string): Promise<void> {
  const token = process.env.REDDIT_CONVERSION_TOKEN
  if (!token) return

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
          user: {},
        },
      ],
    }),
  }).catch(() => {
    // Non-blocking — don't let a CAPI failure break the page render
  })
}
