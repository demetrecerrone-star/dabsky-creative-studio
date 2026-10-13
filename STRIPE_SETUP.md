# Dabsky Creative Studio — Stripe integration plan

## Business and scope
Website: https://dabskycreativestudio.netlify.app/
Services: graphic design, corporate branding, logo development, advertising collateral; fixed-scope social media packages and promotional videos.
Requested Stripe features: Payments, Invoicing, Tax.

## Architecture
- Hosted Stripe Checkout for three fixed-price packages with server-controlled Price IDs.
- Stripe Invoicing for custom logo development, brand identities, advertising collateral, and video quotes.
- Netlify Functions protect the Stripe secret, validate products, and create Checkout Sessions.
- The payments page remains unlinked from the homepage and Checkout is disabled by default until tested and approved.
- Tax collection starts OFF. Configure Stripe Tax and verify appropriate registrations/tax treatment before enabling.
- Webhook endpoint verifies Stripe signatures and logs event identifiers; fulfillment is not automated. Verify invoices and transactions in Stripe Dashboard.
- Never push API keys, account credentials, or webhook signing secrets to GitHub.

## Stripe Dashboard setup
1. Rotate any secret key that has been pasted into a conversation. Do not share the replacement.
2. In Stripe TEST MODE create Products and Prices:
   - Starter Trial: USD 79.00 one-time
   - Business Growth: USD 249.00 recurring monthly
   - Premium Brand: USD 399.00 recurring monthly
   Use Price IDs (prefix price_) and select the correct test/live context.
3. Configure business profile, public support email dabskycreativestudio@gmail.com, logo, refund/cancellation/fulfillment terms, statement descriptor, and verification details.
4. Set up Stripe Invoicing defaults and templates for custom work; issue invoices only after a written scope and client acceptance.
5. In Stripe Tax configure headquarter address and product tax codes; consult a qualified Minnesota tax expert concerning taxability of design and digital services, registrations, and tax on purchases shipped/delivered to other jurisdictions.
6. Create a Stripe webhook endpoint in TEST MODE at:
   https://dabskycreativestudio.netlify.app/.netlify/functions/stripe-webhook
   Subscribe to checkout.session.completed, checkout.session.async_payment_succeeded, checkout.session.async_payment_failed, invoice.paid, invoice.payment_failed, and customer.subscription.deleted.

## Netlify configuration
Netlify > Dabsky site > Project configuration > Environment variables (Functions scope):
  STRIPE_SECRET_KEY = NEW ROTATED sk_test_... key, not the key exposed in chat
  STRIPE_PRICE_STARTER = test mode price_... for $79 one-time
  STRIPE_PRICE_GROWTH = test mode price_... for $249/month
  STRIPE_PRICE_PREMIUM = test mode price_... for $399/month
  STRIPE_SITE_URL = https://dabskycreativestudio.netlify.app
  STRIPE_CHECKOUT_ENABLED = false (until tests pass)
  STRIPE_AUTOMATIC_TAX_ENABLED = false (until tax registrations/configuration verified)
  STRIPE_ALLOW_LIVE = false
  STRIPE_WEBHOOK_SECRET = test webhook endpoint secret from Stripe Dashboard

Environment variables declared in netlify.toml do NOT reach Netlify Functions. Do not put secret values in the repository.

## Staged verification
- Deploy the static website with npm build and dist/ publish directory; preserve existing assets and demo videos.
- Check GET /.netlify/functions/create-checkout: enabled=false and all packages false before launch.
- Check the Stripe test mode products/prices have correct amounts, intervals and currency.
- Set STRIPE_CHECKOUT_ENABLED=true ONLY after all required test Price IDs exist, with the rotated sk_test key.
- In test mode, complete a $79 payment and confirm the Checkout Session and corresponding Stripe Dashboard payment.
- Test both monthly subscriptions, invoice handling, failed/canceled payments, webhook signature rejection, and checkout cancellations.
- Verify custom invoice delivery and payment through Stripe Invoicing.
- Add payment links to the homepage only after the payment flow is confirmed operational and the service policies are displayed.
- For live launch, switch ALL connected assets to live mode together, verify tax setup and payout information, update the webhook secret for live mode, and enable STRIPE_ALLOW_LIVE=true only after explicit approval.
- Do not automatically deliver paid design work based only on the success page redirect.

## Notes
The Stripe ChatGPT app from the user's direct link was unavailable in this workspace and the integration planner was not available. This manual implementation is based on Stripe/Netlify's documented patterns, rather than an output from that planner.
