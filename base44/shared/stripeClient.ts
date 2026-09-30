// Shared Stripe REST helper for backend functions.
// Never print or log the key itself.
export async function stripeRequest(stripeKey, method, path, params) {
  const opts = {
    method,
    headers: {
      'Authorization': `Bearer ${stripeKey}`,
      'Stripe-Version': '2025-10-29.clover',
    },
  };
  if (params) {
    opts.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    opts.headers['Idempotency-Key'] = crypto.randomUUID();
    opts.body = new URLSearchParams(params).toString();
  }
  const res = await fetch(`https://api.stripe.com/v1${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `Stripe request failed (${res.status})`);
  return data;
}