import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

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

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.supabase_user_id
      const subscriptionId = session.subscription as string
      // The email the customer used during checkout — the most reliable signal
      // of who actually paid, independent of metadata.
      const stripeEmail = session.customer_details?.email?.toLowerCase().trim()

      if (!userId || !subscriptionId) {
        console.error('[webhook] checkout.session.completed: missing metadata', {
          sessionId: session.id,
          hasUserId: !!userId,
          hasSubscriptionId: !!subscriptionId,
        })
        break
      }

      // Verify the user exists in our database before upgrading anything.
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('id', userId)
        .single()

      if (profileError || !profile) {
        console.error('[webhook] checkout.session.completed: user not found in database', {
          userId,
          sessionId: session.id,
          error: profileError?.message,
        })
        break
      }

      // Verify the Stripe customer email matches the account being upgraded.
      // This prevents a metadata mismatch from silently upgrading the wrong user.
      const profileEmail = profile.email?.toLowerCase().trim()
      if (stripeEmail && profileEmail && stripeEmail !== profileEmail) {
        console.error('[webhook] checkout.session.completed: email mismatch — aborting upgrade', {
          userId,
          sessionId: session.id,
          stripeEmail,
          profileEmail,
        })
        break
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'pro',
          stripe_subscription_id: subscriptionId,
        })
        .eq('id', userId)

      if (updateError) {
        console.error('[webhook] checkout.session.completed: failed to upgrade user', {
          userId,
          sessionId: session.id,
          error: updateError.message,
        })
      } else {
        console.log(`[webhook] user upgraded to pro — userId=${userId} subscriptionId=${subscriptionId}`)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'free',
          stripe_subscription_id: null,
        })
        .eq('stripe_subscription_id', subscription.id)

      if (error) {
        console.error('[webhook] customer.subscription.deleted: update failed', {
          subscriptionId: subscription.id,
          error: error.message,
        })
      } else {
        console.log(`[webhook] subscription cancelled — subscriptionId=${subscription.id}`)
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const status = subscription.status === 'active' ? 'pro' : 'free'
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_status: status })
        .eq('stripe_subscription_id', subscription.id)

      if (error) {
        console.error('[webhook] customer.subscription.updated: update failed', {
          subscriptionId: subscription.id,
          status,
          error: error.message,
        })
      } else {
        console.log(`[webhook] subscription updated — subscriptionId=${subscription.id} status=${status}`)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
