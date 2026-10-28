import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Public waitlist signup from the pre-launch homepage. Anyone can join;
// the only thing this endpoint reveals is whether an email is already on
// the list, and the only thing it writes is that email.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const { email } = await req.json().catch(() => ({}));
    const normalized = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const existing = await base44.asServiceRole.entities.WaitlistSignup.filter(
      { email: normalized },
      { limit: 1 }
    );
    if (existing.items && existing.items.length > 0) {
      return Response.json({ status: 'already_joined' });
    }

    await base44.asServiceRole.entities.WaitlistSignup.create({ email: normalized });
    return Response.json({ status: 'joined' });
  } catch (error) {
    console.error('waitlistSignup failed:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}