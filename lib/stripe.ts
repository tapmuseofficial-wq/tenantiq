import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    screenings: 3,
    features: [
      '3 tenant screenings',
      'AI income verification',
      'Smart scoring (out of 100)',
      'PDF reports',
    ],
  },
  pro: {
    name: 'Pro',
    price: 29,
    screenings: Infinity,
    features: [
      'Unlimited screenings',
      'AI income verification',
      'Smart scoring (out of 100)',
      'Side-by-side comparison',
      'PDF reports',
      'Priority support',
    ],
  },
}
