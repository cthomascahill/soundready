import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from "base44:runtime";

// Verifies the Stripe-Signature header (t=...,v1=...) against the raw payload.
async function verifySignature(payload, sigHeader, secret) {
  if (!sigHeader) return false;
  const parts = {};
  sigHeader.split(',').forEach(p => {
    const idx = p.indexOf('=');
    if (idx > 0) parts[p.slice(0, idx).trim()] = p.slice(idx + 1).trim();
  });
  const { t, v1 } = parts;
  if (!t || !v1) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, enc.encode(`${t}.${payload}`));
  const hex = [...new Uint8Array(mac)].map(b => b.toString(16).padStart(2, '0')).join('');
  return hex.length === v1.length && hex === v1.toLowerCase();
}

export default async function(req) {
  const payload = await req.text();
  const secret = secrets.get('STRIPE_WEBHOOK_SECRET');
  const valid = secret ? await verifySignature(payload, req.headers.get('stripe-signature'), secret) : false;
  if (!valid) {
    console.error('stripeWebhook: invalid or missing signature');
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(payload);

  try {
    const base44 = createClientFromRequest(req);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // One-time Beat Store purchase — record the sale, no subscription involved
      if (session.metadata?.beat_id) {
        const existing = await base44.asServiceRole.entities.BeatSale.filter({ stripe_session_id: session.id }, '', 1);
        if (existing.length === 0) {
          await base44.asServiceRole.entities.BeatSale.create({
            beat_id: session.metadata.beat_id,
            beat_title: session.metadata.beat_title || '',
            producer_id: session.metadata.producer_id || '',
            producer_name: session.metadata.producer_name || '',
            buyer_email: session.customer_details?.email || session.customer_email || '',
            deal_type: session.metadata.deal_type === 'Exclusive' ? 'Exclusive' : 'Lease',
            amount: (session.amount_total || 0) / 100,
            stripe_session_id: session.id,
            status: 'paid',
          });
          console.log(`stripeWebhook: beat sale recorded for beat ${session.metadata.beat_id}`);
        }
        return Response.json({ received: true });
      }

      const userId = session.metadata?.user_id || session.client_reference_id;
      const tier = session.metadata?.tier || 'pro';
      if (!userId) throw new Error('checkout.session.completed: no user_id in metadata');
      await base44.asServiceRole.entities.User.update(userId, {
        subscription_tier: tier,
        subscription_status: tier === 'pro' ? 'trialing' : 'active',
        trial_ends_at: tier === 'pro' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null,
        stripe_customer_id: session.customer || null,
        stripe_subscription_id: session.subscription || null,
        cancel_at_period_end: false,
      });
      console.log(`stripeWebhook: user ${userId} subscribed to ${tier}`);
    }

    if (event.type === 'customer.subscription.updated') {
      const sub = event.data.object;
      const userId = sub.metadata?.user_id;
      if (!userId) return Response.json({ received: true });
      const update = {
        subscription_status: sub.status,
        cancel_at_period_end: !!sub.cancel_at_period_end,
      };
      if (sub.status === 'trialing' && sub.trial_end) {
        update.trial_ends_at = new Date(sub.trial_end * 1000).toISOString();
      }
      if (sub.status === 'canceled') {
        update.subscription_tier = 'free';
        update.stripe_subscription_id = null;
      }
      await base44.asServiceRole.entities.User.update(userId, update);
      console.log(`stripeWebhook: subscription updated for user ${userId} → ${sub.status}`);
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const userId = sub.metadata?.user_id;
      if (!userId) return Response.json({ received: true });
      await base44.asServiceRole.entities.User.update(userId, {
        subscription_tier: 'free',
        subscription_status: 'canceled',
        stripe_subscription_id: null,
        cancel_at_period_end: false,
      });
      console.log(`stripeWebhook: subscription deleted for user ${userId}`);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('stripeWebhook error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}