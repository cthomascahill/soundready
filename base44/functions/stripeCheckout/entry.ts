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
      const interval = body.interval === 'yearly' ? 'yearly' : 'monthly';

      // Founding-member pricing: while the founding prices are active in
      // Stripe, AI Manager checkouts use them. Deactivate those prices in
      // Stripe to end the founding offer — no code change needed.
      let lookupKey;
      if (tier === 'pro') {
        lookupKey = interval === 'yearly' ? 'artist_pro_yearly_v2' : 'artist_pro_monthly_v2';
      } else {
        const foundingKey = interval === 'yearly' ? 'ai_manager_founding_yearly' : 'ai_manager_founding_monthly';
        const founding = await stripeRequest('GET', `/prices?lookup_keys[]=${foundingKey}&active=true&limit=1`);
        lookupKey = founding.data?.[0] ? foundingKey : (interval === 'yearly' ? 'ai_manager_yearly_v2' : 'ai_manager_monthly_v2');
      }

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
        success_url: `${appUrl}/checkout/success`,
        cancel_url: `${appUrl}/checkout/${tier === 'pro' ? 'artist-pro' : 'ai-manager'}?cancelled=1${interval === 'yearly' ? '&billing=yearly' : ''}`,
        'metadata[base44_app_id]': appId,
        'metadata[user_id]': user.id,
        'metadata[tier]': tier,
        'metadata[interval]': interval,
        'subscription_data[metadata][base44_app_id]': appId,
        'subscription_data[metadata][user_id]': user.id,
        'subscription_data[metadata][tier]': tier,
      };
      // 7-day free trial for Artist Pro — card is auto-charged on day 7 unless cancelled
      if (tier === 'pro') params['subscription_data[trial_period_days]'] = '7';

      const session = await stripeRequest('POST', '/checkout/sessions', params);
      console.log(`stripeCheckout: session created for user ${user.id} (tier: ${tier}, interval: ${interval}, price: ${priceId})`);
      return Response.json({ url: session.url });
    }

    // ── Start a one-time Sam extra usage checkout ──────────────────────────
    if (action === 'create_usage_checkout') {
      const priceData = await stripeRequest('GET', '/prices?lookup_keys[]=sam_extra_usage_v2&active=true&limit=1');
      const priceId = priceData.data?.[0]?.id;
      if (!priceId) return Response.json({ error: 'Extra credits price not found (sam_extra_usage_v2)' }, { status: 500 });

      let appUrl = body.app_url || 'https://soundready.base44.app';
      if (!/^https?:\/\//.test(appUrl)) appUrl = 'https://soundready.base44.app';

      const appId = secrets.get('BASE44_APP_ID') || '';
      const session = await stripeRequest('POST', '/checkout/sessions', {
        mode: 'payment',
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': '1',
        customer_email: user.email,
        client_reference_id: user.id,
        success_url: `${appUrl}/checkout/success?boosted=1`,
        cancel_url: `${appUrl}/tell-sam?cancelled=1`,
        'metadata[base44_app_id]': appId,
        'metadata[user_id]': user.id,
        'metadata[usage_addon]': 'sam_extra_usage',
      });
      console.log(`stripeCheckout: usage add-on session created for user ${user.id}`);
      return Response.json({ url: session.url });
    }

    // ── Cancel subscription at period end (during trial: no charge) ────────
    if (action === 'cancel') {
      const subId = user.stripe_subscription_id;
      if (!subId) {
        // No Stripe subscription exists behind this account (the plan was
        // granted without a completed checkout): move it to Free immediately.
        await base44.entities.User.update(user.id, {
          subscription_tier: 'free',
          subscription_status: 'canceled',
          cancel_at_period_end: false,
          trial_ends_at: null,
        });
        console.log(`stripeCheckout: user ${user.id} had no Stripe subscription; moved to Free`);
        return Response.json({ success: true, immediate: true });
      }
      await stripeRequest('POST', `/subscriptions/${encodeURIComponent(subId)}`, { cancel_at_period_end: 'true' });
      console.log(`stripeCheckout: subscription ${subId} set to cancel at period end`);
      return Response.json({ success: true });
    }

    // ── Fetch the live subscription from Stripe (plan, renewal, status) ─────
    if (action === 'get_subscription') {
      const subId = user.stripe_subscription_id;
      if (!subId) return Response.json({ subscription: null });
      const sub = await stripeRequest('GET', `/subscriptions/${encodeURIComponent(subId)}`);
      const item = sub.items?.data?.[0];
      // Newer API versions moved current_period_end onto the subscription item
      const periodEnd = sub.current_period_end || item?.current_period_end;
      console.log(`stripeCheckout: subscription details fetched for user ${user.id}`);
      return Response.json({
        subscription: {
          status: sub.status,
          cancel_at_period_end: !!sub.cancel_at_period_end,
          current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
          interval: item?.price?.recurring?.interval || 'month',
          amount: (item?.price?.unit_amount || 0) / 100,
        },
      });
    }

    // ── Resume a subscription that was set to cancel at period end ─────────
    if (action === 'resume') {
      const subId = user.stripe_subscription_id;
      if (!subId) return Response.json({ error: 'No active subscription found' }, { status: 400 });
      await stripeRequest('POST', `/subscriptions/${encodeURIComponent(subId)}`, { cancel_at_period_end: 'false' });
      console.log(`stripeCheckout: subscription ${subId} resumed (renewals re-enabled)`);
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('stripeCheckout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}