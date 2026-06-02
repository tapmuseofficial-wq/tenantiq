import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'
import type { SupabaseClient } from '@supabase/supabase-js'

// Stripe returns resource_missing on the customer param when the stored ID
// doesn't exist in the current mode — e.g. a test-mode customer ID used in
// live mode after switching, or a customer that was manually deleted.
function isStaleCustomerError(err: unknown): err is InstanceType<typeof Stripe.errors.StripeError> {
  return (
    err instanceof Stripe.errors.StripeError &&
    err.code === 'resource_missing' &&
    err.param === 'customer'
  )
}

async function createFreshCustomer(
  supabase: SupabaseClient,
  userId: string,
  email: string | undefined,
  name: string | undefined,
  staleId: string
): Promise<string> {
  console.warn(`[checkout] customer ${staleId} not found in current Stripe mode — clearing and creating new customer`)

  await supabase
    .from('profiles')
    .update({ stripe_customer_id: null })
    .eq('id', userId)

  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: { supabase_user_id: userId },
  })

  await supabase
    .from('profiles')
    .update({ stripe_customer_id: customer.id })
    .eq('id', userId)

  console.log(`[checkout] new customer created — customer=${customer.id}`)
  return customer.id
}

export async function POST(request: NextRequest) {
  const priceId = process.env.STRIPE_PRO_PRICE_ID
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  if (!priceId) {
    console.error('[checkout] missing env var: STRIPE_PRO_PRICE_ID')
    return NextResponse.json({ error: 'Server misconfiguration: STRIPE_PRO_PRICE_ID is not set' }, { status: 500 })
  }
  if (!appUrl) {
    console.error('[checkout] missing env var: NEXT_PUBLIC_APP_URL')
    return NextResponse.json({ error: 'Server misconfiguration: NEXT_PUBLIC_APP_URL is not set' }, { status: 500 })
  }

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email, full_name')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      console.log(`[checkout] creating Stripe customer for user=${user.id}`)
      const customer = await stripe.customers.create({
        email: profile?.email || user.email,
        name: profile?.full_name || undefined,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id

      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    console.log(`[checkout] creating session — user=${user.id} customer=${customerId} price=${priceId}`)

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?upgraded=true`,
      cancel_url: `${appUrl}/dashboard`,
      metadata: { supabase_user_id: user.id },
    }

    let session: Stripe.Checkout.Session
    try {
      session = await stripe.checkout.sessions.create(sessionParams)
    } catch (sessionErr) {
      if (isStaleCustomerError(sessionErr)) {
        // The stored customer ID is stale (test↔live mode switch, or deleted customer).
        // Create a fresh one and retry the session once.
        customerId = await createFreshCustomer(
          supabase,
          user.id,
          profile?.email || user.email,
          profile?.full_name,
          customerId
        )
        session = await stripe.checkout.sessions.create({ ...sessionParams, customer: customerId })
      } else {
        throw sessionErr
      }
    }

    console.log(`[checkout] session created — session=${session.id}`)
    return NextResponse.json({ url: session.url })
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      console.error('[checkout] Stripe error:', {
        type: error.type,
        code: error.code,
        message: error.message,
        param: error.param,
        statusCode: error.statusCode,
        requestId: error.requestId,
      })
      return NextResponse.json(
        { error: `Stripe: ${error.message}`, code: error.code, param: error.param },
        { status: 500 }
      )
    }

    const message = error instanceof Error ? error.message : String(error)
    console.error('[checkout] unexpected error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
