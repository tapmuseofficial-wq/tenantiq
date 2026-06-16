import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    credits: 3,
    features: [
      '3 total screenings',
      'AI income verification',
      'Smart scoring (out of 100)',
      'PDF reports',
    ],
  },
  basic: {
    name: 'Basic',
    price: 9,
    credits: 10,
    features: [
      '10 screening credits',
      'AI income verification',
      'Smart scoring (out of 100)',
      'PDF reports',
    ],
  },
}
