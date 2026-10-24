import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from "base44:runtime";
import { SAM_USAGE } from '../../shared/samUsage.ts';

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

      // One-time Sam extra usage pack — credit the artist's balance.
      // Deduped on the Stripe session id so a replayed event never credits twice.
      if (session.metadata?.usage_addon === 'sam_extra_usage') {
        const userId = session.metadata?.user_id || session.client_reference_id;
        if (!userId) throw new Error('usage addon checkout: no user_id in metadata');
        const existing = await base44.asServiceRole.entities.SamUsageAddOn.filter({ stripe_session_id: session.id }, '', 1);
        if (existing.length === 0) {
          await base44.asServiceRole.entities.SamUsageAddOn.create({
            user_id: userId,
            units: SAM_USAGE.addOnUnits,
            status: 'paid',
            amount: (session.amount_total || 0) / 100,
            stripe_session_id: session.id,
            purchased_at: new Date().toISOString(),
          });
          console.log(`stripeWebhook: ${SAM_USAGE.addOnUnits} extra SAM credits credited to user ${userId}`);
        }
        return Response.json({ received: true });
      }

      // One-time lifetime purchase (Artist Pro or Digital Manager) — grant access forever.
      if (session.metadata?.lifetime === '1') {
        const lifetimeUserId = session.metadata?.user_id || session.client_reference_id;
        if (!lifetimeUserId) throw new Error('lifetime checkout: no user_id in metadata');
        const lifetimeTier = session.metadata?.tier === 'pro' ? 'pro' : 'ai_manager';

        // If they were paying monthly, stop that subscription; lifetime replaces it.
        try {
          const existing = await base44.asServiceRole.entities.User.filter({ id: lifetimeUserId }, '', 1);
          const subId = existing[0]?.stripe_subscription_id;
          const stripeKey = secrets.get('STRIPE_SECRET_KEY');
          if (subId && stripeKey) {
            await fetch(`https://api.stripe.com/v1/subscriptions/${encodeURIComponent(subId)}`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${stripeKey}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Stripe-Version': '2025-10-29.clover',
                'Idempotency-Key': crypto.randomUUID(),
              },
              body: 'cancel_at_period_end=true',
            });
          }
        } catch (err) {
          console.error(`stripeWebhook: could not stop old subscription for user ${lifetimeUserId}: ${err.message}`);
        }

        await base44.asServiceRole.entities.User.update(lifetimeUserId, {
          subscription_tier: lifetimeTier,
          subscription_status: 'active',
          trial_ends_at: null,
          stripe_customer_id: session.customer || null,
          stripe_subscription_id: null,
          cancel_at_period_end: false,
          lifetime_access: true,
        });
        console.log(`stripeWebhook: lifetime Digital Manager granted to user ${lifetimeUserId}`);
        return Response.json({ received: true });
      }

      const userId = session.metadata?.user_id || session.client_reference_id;
      const tier = session.metadata?.tier || 'pro';
      if (!userId) throw new Error('checkout.session.completed: no user_id in metadata');
      await base44.asServiceRole.entities.User.update(userId, {
        subscription_tier: tier,
        // Trials were removed from the plans: every purchase is paid and
        // active from the first charge.
        subscription_status: 'active',
        trial_ends_at: null,
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
        // Lifetime buyers keep access even when a replaced monthly plan lapses.
        const existing = await base44.asServiceRole.entities.User.filter({ id: userId }, '', 1);
        if (existing[0]?.lifetime_access) {
          console.log(`stripeWebhook: skipped downgrade for lifetime user ${userId}`);
          return Response.json({ received: true });
        }
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
      const existing = await base44.asServiceRole.entities.User.filter({ id: userId }, '', 1);
      if (existing[0]?.lifetime_access) {
        console.log(`stripeWebhook: skipped downgrade for lifetime user ${userId}`);
        return Response.json({ received: true });
      }
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