import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { sendMayaDraft, isValidEmail } from '../../shared/mayaEmail.ts';
import { awardPointsFor } from '../../shared/points.ts';

// The approval gate for Sam's recommendations. Dismiss archives a proposal.
// Approve either sends the (possibly edited) outreach draft — nothing goes out
// before this call, which the artist triggers — or marks it taken on when the
// artist chooses to handle it manually.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const isAIManager = user.role === 'admin' || user.subscription_tier === 'ai_manager';
    if (!isAIManager) return Response.json({ error: 'AI Manager subscription required' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const { action, recommendation_id } = body;
    if (!recommendation_id) return Response.json({ error: 'recommendation_id required' }, { status: 400 });

    let rec = null;
    try {
      const recs = await base44.entities.MayaRecommendation.filter({ id: recommendation_id }, '', 1);
      rec = recs[0];
    } catch (e) {
      return Response.json({ error: 'Recommendation not found' }, { status: 404 });
    }
    if (!rec) return Response.json({ error: 'Recommendation not found' }, { status: 404 });
    if (rec.user_id !== user.id) return Response.json({ error: 'This recommendation does not belong to you' }, { status: 403 });

    if (action === 'dismiss') {
      const updated = await base44.entities.MayaRecommendation.update(rec.id, { status: 'dismissed' });
      console.log(`mayaApprove: recommendation ${rec.id} dismissed`);
      return Response.json({ success: true, data: updated });
    }

    if (action === 'approve') {
      if (rec.draft_kind === 'email' && body.manual !== true) {
        const draft = (body.draft !== undefined ? body.draft : (rec.draft || '')).trim();
        const recipient = (body.recipient_email !== undefined ? body.recipient_email : (rec.recipient_email || '')).trim();
        if (!draft) return Response.json({ error: 'Draft is empty' }, { status: 400 });
        if (!isValidEmail(recipient)) {
          return Response.json({ error: 'A valid recipient email address is required' }, { status: 400 });
        }

        await sendMayaDraft({ base44, user, draft, recipient, fallbackSubject: rec.title });

        const updated = await base44.entities.MayaRecommendation.update(rec.id, {
          status: 'executed',
          draft,
          recipient_email: recipient,
          executed_at: new Date().toISOString(),
        });
        await awardPointsFor(base44, user.id, { source_type: 'email_approved', source_id: rec.id, reason: `Approved: ${rec.title}` });
        console.log(`mayaApprove: recommendation ${rec.id} sent to ${recipient}`);
        return Response.json({ success: true, data: updated });
      }

      // Manual kind, or email the artist chose to send themselves
      const updated = await base44.entities.MayaRecommendation.update(rec.id, {
        status: 'approved',
        executed_at: new Date().toISOString(),
      });
      await awardPointsFor(base44, user.id, { source_type: 'email_approved', source_id: rec.id, reason: `Took on: ${rec.title}` });
      console.log(`mayaApprove: recommendation ${rec.id} taken on by artist`);
      return Response.json({ success: true, data: updated });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('mayaApprove error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}