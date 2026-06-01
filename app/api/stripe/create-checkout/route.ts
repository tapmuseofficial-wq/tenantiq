import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  // Guard env vars before any Stripe call so missing config gives a clear message
  // rather than a cryptic "No such price: undefined" from Stripe.
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

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?upgraded=true`,
      cancel_url: `${appUrl}/dashboard`,
      metadata: { supabase_user_id: user.id },
    })

    console.log(`[checkout] session created — session=${session.id} url=${session.url}`)
    return NextResponse.json({ url: session.url })
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      // Log every field Stripe gives us — visible in Vercel function logs
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

    // Non-Stripe exception (e.g. Supabase failure, network error)
    const message = error instanceof Error ? error.message : String(error)
    console.error('[checkout] unexpected error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
