import Stripe from 'stripe';

// This endpoint verifies webhook signatures and logs payment event IDs ONLY.
// It does not fulfill orders or grant services automatically. Confirm payments
// in Stripe Dashboard until a durable fulfillment workflow is implemented.
export default async function handler(request) {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });
  const key = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key || !webhookSecret) return new Response('Not configured', { status: 503 });
  const signature = request.headers.get('stripe-signature');
  if (!signature) return new Response('Missing signature', { status: 400 });

  let event;
  try {
    const raw = await request.text();
    const stripe = new Stripe(key);
    event = stripe.webhooks.constructEvent(raw, signature, webhookSecret);
  } catch {
    return new Response('Invalid webhook signature', { status: 400 });
  }

  const handled = new Set([
    'checkout.session.completed',
    'checkout.session.async_payment_succeeded',
    'checkout.session.async_payment_failed',
    'invoice.paid',
    'invoice.payment_failed',
    'customer.subscription.deleted',
  ]);
  if (handled.has(event.type)) {
    console.info('Verified Stripe event', event.id, event.type);
  }
  return Response.json({ received: true }, { headers: { 'Cache-Control': 'no-store' } });
}
