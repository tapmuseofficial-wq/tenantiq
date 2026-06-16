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

  const supabase = createServiceClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.supabase_user_id
    const stripeEmail = session.customer_details?.email?.toLowerCase().trim()

    if (!userId) {
      console.error('[webhook] checkout.session.completed: missing supabase_user_id in metadata', {
        sessionId: session.id,
      })
      return NextResponse.json({ received: true })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, screening_credits')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      console.error('[webhook] checkout.session.completed: user not found', {
        userId,
        sessionId: session.id,
        error: profileError?.message,
      })
      return NextResponse.json({ received: true })
    }

    const profileEmail = profile.email?.toLowerCase().trim()
    if (stripeEmail && profileEmail && stripeEmail !== profileEmail) {
      console.error('[webhook] checkout.session.completed: email mismatch — aborting', {
        userId,
        sessionId: session.id,
        stripeEmail,
        profileEmail,
      })
      return NextResponse.json({ received: true })
    }

    const newCredits = (profile.screening_credits ?? 0) + BASIC_PLAN_CREDITS

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'basic',
        screening_credits: newCredits,
      })
      .eq('id', userId)

    if (updateError) {
      console.error('[webhook] checkout.session.completed: failed to add credits', {
        userId,
        sessionId: session.id,
        error: updateError.message,
      })
    } else {
      console.log(`[webhook] basic plan activated — userId=${userId} credits=${newCredits}`)
    }
  }

  return NextResponse.json({ received: true })
}
