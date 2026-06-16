import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const BASIC_PLAN_CREDITS = 10

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    console.error('[webhook] missing stripe-signature header')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[webhook] missing env var: STRIPE_WEBHOOK_SECRET')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('[webhook] signature verification failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session

  // For one-time payments some methods (e.g. BACS) complete the session before
  // the funds are captured. Only grant credits once the payment is actually paid.
  if (session.mode === 'payment' && session.payment_status !== 'paid') {
    console.log(`[webhook] skipping — payment not yet captured`, {
      sessionId: session.id,
      paymentStatus: session.payment_status,
    })
    return NextResponse.json({ received: true })
  }

  const userId = session.metadata?.supabase_user_id
  if (!userId) {
    console.error('[webhook] missing supabase_user_id in session metadata', { sessionId: session.id })
    // Intentional skip — not a retryable error.
    return NextResponse.json({ received: true })
  }

  const supabase = createServiceClient()

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, screening_credits, stripe_subscription_id')
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    console.error('[webhook] profile lookup failed', {
      userId,
      sessionId: session.id,
      error: profileError?.message,
    })
    // Return 500 so Stripe retries — this is a transient DB error.
    return NextResponse.json({ error: 'Profile lookup failed' }, { status: 500 })
  }

  // Idempotency: stripe_subscription_id stores the last processed session ID for
  // one-time payments. If this session was already handled (e.g. Stripe retry after
  // a network timeout where the DB write succeeded), skip to avoid double-crediting.
  if (profile.stripe_subscription_id === session.id) {
    console.log(`[webhook] duplicate event — session already processed`, { sessionId: session.id, userId })
    return NextResponse.json({ received: true })
  }

  const stripeEmail = session.customer_details?.email?.toLowerCase().trim()
  const profileEmail = profile.email?.toLowerCase().trim()
  if (stripeEmail && profileEmail && stripeEmail !== profileEmail) {
    console.error('[webhook] email mismatch — aborting upgrade', {
      userId,
      sessionId: session.id,
      stripeEmail,
      profileEmail,
    })
    // Intentional skip — not a retryable error.
    return NextResponse.json({ received: true })
  }

  const newCredits = (profile.screening_credits ?? 0) + BASIC_PLAN_CREDITS

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'basic',
      screening_credits: newCredits,
      stripe_subscription_id: session.id, // idempotency key
    })
    .eq('id', userId)

  if (updateError) {
    console.error('[webhook] failed to add credits', {
      userId,
      sessionId: session.id,
      error: updateError.message,
    })
    // Return 500 so Stripe retries.
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }

  console.log(`[webhook] basic plan activated — userId=${userId} credits=${newCredits}`)
  return NextResponse.json({ received: true })
}
