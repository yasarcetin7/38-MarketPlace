import stripeLibrary from 'stripe'
import './env';

export const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripeApiKey = process.env.STRIPE_SECRET_KEY || '';
if (!stripeApiKey) {
  console.warn('STRIPE_SECRET_KEY is missing. Add it to the repository root .env file.')
}
if (!endpointSecret) {
  console.warn('STRIPE_WEBHOOK_SECRET is missing. Webhook signature checks are skipped.')
}
export const stripe = stripeLibrary(stripeApiKey);