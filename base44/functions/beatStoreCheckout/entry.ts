import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';
import { stripeRequest } from '../../shared/stripeClient.ts';

// Public Beat Store endpoints — callable by logged-out buyers on the storefront.
const DEFAULT_APP_URL = 'https://soundready.base44.app';

function sanitizeAppUrl(appUrl) {
  let url = appUrl || DEFAULT_APP_URL;
  if (!/^https?:\/\//.test(url)) url = DEFAULT_APP_URL;
  return url.replace(/\/+$/, '');
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const stripeKey = secrets.get('STRIPE_SECRET_KEY');
    if (!stripeKey) return Response.json({ error: 'Stripe is not configured' }, { status: 500 });
    const appId = secrets.get('BASE44_APP_ID') || '';

    // ── Public storefront listing (no auth) ───────────────────────────────
    if (body.action === 'get_store') {
      const producerId = body.producer_id;
      if (!producerId) return Response.json({ error: 'producer_id required' }, { status: 400 });

      const producer = await base44.asServiceRole.entities.User.get(producerId).catch(() => null);
      if (!producer) return Response.json({ error: 'Store not found' }, { status: 404 });

      const beats = await base44.asServiceRole.entities.Beat.filter(
        { created_by_id: producerId, for_sale: true },
        '-created_date',
        100
      );

      return Response.json({
        producer_name: producer.artist_name || producer.full_name || 'Producer',
        beats: beats.map((b) => ({
          id: b.id,
          title: b.title,
          genre: b.genre,
          bpm: b.bpm,
          key: b.key,
          mood_tags: b.mood_tags || [],
          lease_price: b.lease_price,
          exclusive_price: b.exclusive_price,
        })),
      });
    }

    // ── Start a one-time checkout for a beat (no auth — buyer may be anyone)
    if (body.action === 'create_checkout') {
      const { beat_id, deal_type } = body;
      if (!beat_id) return Response.json({ error: 'beat_id required' }, { status: 400 });
      if (!['Lease', 'Exclusive'].includes(deal_type)) {
        return Response.json({ error: 'deal_type must be Lease or Exclusive' }, { status: 400 });
      }

      const beatArr = await base44.asServiceRole.entities.Beat.filter({ id: beat_id }, '', 1);
      const beat = beatArr[0];
      if (!beat) return Response.json({ error: 'Beat not found' }, { status: 404 });
      if (!beat.for_sale) return Response.json({ error: 'This beat is not for sale' }, { status: 400 });

      const amount = deal_type === 'Lease' ? beat.lease_price : beat.exclusive_price;
      if (!amount || amount <= 0) {
        return Response.json({ error: `No ${deal_type.toLowerCase()} price is set for this beat` }, { status: 400 });
      }

      const appUrl = sanitizeAppUrl(body.app_url);
      const session = await stripeRequest(stripeKey, 'POST', '/checkout/sessions', {
        mode: 'payment',
        'line_items[0][quantity]': '1',
        'line_items[0][price_data][currency]': 'usd',
        'line_items[0][price_data][unit_amount]': String(Math.round(amount * 100)),
        'line_items[0][price_data][product_data][name]': `${beat.title} (${deal_type})`,
        'line_items[0][price_data][product_data][description]': `Beat ${deal_type.toLowerCase()} from ${beat.producer_name || 'producer'}`,
        'metadata[base44_app_id]': appId,
        'metadata[beat_id]': beat.id,
        'metadata[producer_id]': beat.created_by_id,
        'metadata[deal_type]': deal_type,
        'payment_intent_data[metadata][base44_app_id]': appId,
        success_url: `${appUrl}/store/download?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/store/${beat.created_by_id}`,
      });

      console.log(`beatStoreCheckout: session ${session.id} created for beat ${beat.id} (${deal_type}, $${amount})`);
      return Response.json({ url: session.url });
    }

    // ── Post-purchase delivery: verify payment, hand back a download link ─
    if (body.action === 'get_download') {
      const sessionId = body.session_id;
      if (!sessionId) return Response.json({ error: 'session_id required' }, { status: 400 });

      const session = await stripeRequest(stripeKey, 'GET', `/checkout/sessions/${encodeURIComponent(sessionId)}`);
      if (session.payment_status !== 'paid') {
        return Response.json({ error: 'This order has not been paid yet' }, { status: 402 });
      }
      const beatId = session.metadata?.beat_id;
      const dealType = session.metadata?.deal_type || 'Lease';
      if (!beatId) return Response.json({ error: 'No beat is attached to this order' }, { status: 400 });

      const beatArr = await base44.asServiceRole.entities.Beat.filter({ id: beatId }, '', 1);
      const beat = beatArr[0];
      if (!beat) return Response.json({ error: 'Beat not found' }, { status: 404 });
      if (!beat.file_url) return Response.json({ error: 'The producer has not uploaded a file for this beat yet' }, { status: 404 });

      // Record the sale (idempotent — the webhook may have gotten here first)
      const existing = await base44.asServiceRole.entities.BeatSale.filter({ stripe_session_id: sessionId }, '', 1);
      if (existing.length === 0) {
        await base44.asServiceRole.entities.BeatSale.create({
          beat_id: beat.id,
          beat_title: beat.title,
          producer_id: session.metadata?.producer_id || beat.created_by_id,
          producer_name: beat.producer_name,
          buyer_email: session.customer_details?.email || session.customer_email || '',
          deal_type: dealType,
          amount: session.amount_total / 100,
          stripe_session_id: sessionId,
          status: 'delivered',
          delivered_at: new Date().toISOString(),
        });
      } else if (existing[0].status !== 'delivered') {
        await base44.asServiceRole.entities.BeatSale.update(existing[0].id, { status: 'delivered', delivered_at: new Date().toISOString() });
      }

      let downloadUrl = beat.file_url;
      if (!downloadUrl.startsWith('http')) {
        const signed = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri: beat.file_url, expires_in: 3600 });
        downloadUrl = signed.signed_url;
      }

      console.log(`beatStoreCheckout: download delivered for session ${sessionId}`);
      return Response.json({
        beat_title: beat.title,
        producer_name: beat.producer_name,
        deal_type: dealType,
        download_url: downloadUrl,
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('beatStoreCheckout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}