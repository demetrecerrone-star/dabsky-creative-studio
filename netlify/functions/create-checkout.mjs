import Stripe from 'stripe';

// Server-side allowlist. Never trust customer-provided price or amount.
const PACKAGES = Object.freeze({
  starter: { env: 'STRIPE_PRICE_STARTER', mode: 'payment' },
  growth: { env: 'STRIPE_PRICE_GROWTH', mode: 'subscription' },
  premium: { env: 'STRIPE_PRICE_PREMIUM', mode: 'subscription' },
});
const headers = { 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8' };
const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers });
const siteUrl = () => (process.env.STRIPE_SITE_URL || 'https://dabskycreativestudio.netlify.app').replace(/\/$/, '');
const configured = () => {
  const key = process.env.STRIPE_SECRET_KEY || '';
  const keyAllowed = key.startsWith('sk_test_') || (key.startsWith('sk_live_') && process.env.STRIPE_ALLOW_LIVE === 'true');
  return process.env.STRIPE_CHECKOUT_ENABLED === 'true' && keyAllowed;
};
const hasPrice = p => typeof process.env[p.env] === 'string' && /^price_[a-zA-Z0-9]+$/.test(process.env[p.env]);

export default async function handler(request) {
  if (request.method === 'GET') {
    return json({
      enabled: configured(),
      packages: Object.fromEntries(Object.entries(PACKAGES).map(([name, product]) => [name, configured() && hasPrice(product)])),
    });
  }
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, POST' } });

  // Prevent cross-site browser submissions. All payment amounts remain server-controlled.
  const origin = request.headers.get('origin');
  if (origin && origin !== siteUrl()) return json({ error: 'This payment request was not accepted.' }, 403);
  if (!(request.headers.get('content-type') || '').startsWith('application/json')) return json({ error: 'JSON request required.' }, 415);
  const length = Number(request.headers.get('content-length') || 0);
  if (length > 1024) return json({ error: 'Request too large.' }, 413);

  let input;
  try { input = await request.json(); } catch { return json({ error: 'Invalid request.' }, 400); }
  const product = PACKAGES[input?.package];
  if (!product) return json({ error: 'Unknown package.' }, 400);
  if (!configured() || !hasPrice(product)) {
    return json({ error: 'Online checkout is not ready yet. Please contact us for an invoice.' }, 503);
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { maxNetworkRetries: 1, timeout: 10000 });
    const autoTax = process.env.STRIPE_AUTOMATIC_TAX_ENABLED === 'true';
    const session = await stripe.checkout.sessions.create({
      mode: product.mode,
      line_items: [{ price: process.env[product.env], quantity: 1 }],
      success_url: siteUrl() + '/payment-success.html?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: siteUrl() + '/payments.html?status=cancelled',
      billing_address_collection: autoTax ? 'required' : 'auto',
      automatic_tax: { enabled: autoTax },
      ...(product.mode === 'payment' ? { customer_creation: 'always' } : {}),
      metadata: { service: input.package, website: 'dabsky-creative-studio' },
    });
    if (!session.url || !session.url.startsWith('https://checkout.stripe.com/')) {
      return json({ error: 'Checkout is temporarily unavailable.' }, 502);
    }
    return json({ url: session.url });
  } catch (error) {
    // Log error class only. Do not expose secrets or payment details to visitors.
    console.error('Stripe checkout failed:', error?.type || error?.name || 'UnknownError');
    return json({ error: 'Could not start secure checkout. Please contact us for an invoice.' }, 502);
  }
}
