import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from "base44:runtime";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action } = body;

    const stripeKey = secrets.get('STRIPE_SECRET_KEY');
    if (!stripeKey) return Response.json({ error: 'Stripe is not configured' }, { status: 500 });

    const stripeRequest = async (method, path, params) => {
      const opts = { method, headers: { 'Authorization': `Bearer ${stripeKey}`, 'Stripe-Version': '2025-10-29.clover' } };
      if (params) {
        opts.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        opts.headers['Idempotency-Key'] = crypto.randomUUID();
        opts.body = new URLSearchParams(params).toString();
      }
      const res = await fetch(`https://api.stripe.com/v1${path}`, opts);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || `Stripe request failed (${res.status})`);
      return data;
    };

    // ── Start a subscription checkout ──────────────────────────────────────
    if (action === 'create_checkout') {
      const tier = body.tier === 'ai_manager' ? 'ai_manager' : 'pro';
      const lookupKey = tier === 'pro' ? 'artist_pro_monthly' : 'ai_manager_monthly';

      const priceData = await stripeRequest('GET', `/prices?lookup_keys[]=${lookupKey}&active=true&limit=1`);
      const priceId = priceData.data?.[0]?.id;
      if (!priceId) return Response.json({ error: `Subscription price not found (${lookupKey})` }, { status: 500 });

      let appUrl = body.app_url || 'https://soundready.base44.app';
      if (!/^https?:\/\//.test(appUrl)) appUrl = 'https://soundready.base44.app';

      const appId = secrets.get('BASE44_APP_ID') || '';
      const params = {
        mode: 'subscription',
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': '1',
        customer_email: user.email,
        client_reference_id: user.id,
        success_url: `${appUrl}/pricing-account?checkout=success`,
        cancel_url: `${appUrl}/pricing-account?checkout=cancelled`,
        'metadata[base44_app_id]': appId,
        'metadata[user_id]': user.id,
        'metadata[tier]': tier,
        'subscription_data[metadata][base44_app_id]': appId,
        'subscription_data[metadata][user_id]': user.id,
        'subscription_data[metadata][tier]': tier,
      };
      // 7-day free trial for Artist Pro — card is auto-charged on day 7 unless cancelled
      if (tier === 'pro') params['subscription_data[trial_period_days]'] = '7';

      const session = await stripeRequest('POST', '/checkout/sessions', params);
      console.log(`stripeCheckout: session created for user ${user.id} (tier: ${tier})`);
      return Response.json({ url: session.url });
    }

    // ── Cancel subscription at period end (during trial: no charge) ────────
    if (action === 'cancel') {
      const subId = user.stripe_subscription_id;
      if (!subId) return Response.json({ error: 'No active subscription found' }, { status: 400 });
      await stripeRequest('POST', `/subscriptions/${encodeURIComponent(subId)}`, { cancel_at_period_end: 'true' });
      console.log(`stripeCheckout: subscription ${subId} set to cancel at period end`);
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('stripeCheckout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}