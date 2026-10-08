import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { sendMayaDraft, isValidEmail } from '../../shared/mayaEmail.ts';
import { awardPointsFor } from '../../shared/points.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const isAIManager = user.role === 'admin' || user.subscription_tier === 'ai_manager';
    if (!isAIManager) return Response.json({ error: 'AI Manager subscription required' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const { action, activity_id } = body;
    if (!activity_id) return Response.json({ error: 'activity_id required' }, { status: 400 });

    const activities = await base44.entities.AIActivity.filter({ id: activity_id }, '', 1);
    const activity = activities[0];
    if (!activity) return Response.json({ error: 'Draft not found' }, { status: 404 });
    if (activity.user_id !== user.id) return Response.json({ error: 'This draft does not belong to you' }, { status: 403 });

    const artistName = user.artist_name || user.full_name || 'The Artist';

    // ── Deny: archive the draft ────────────────────────────────────────────
    if (action === 'deny') {
      const updated = await base44.entities.AIActivity.update(activity.id, { status: 'denied' });
      console.log(`mayaSendDraft: draft ${activity.id} denied by artist`);
      return Response.json({ success: true, data: updated });
    }

    // ── Approve: send the (possibly edited) draft ─────────────────────────
    if (action === 'send') {
      const draft = (body.draft_email || activity.draft_email || '').trim();
      const recipient = (body.recipient_email || '').trim();
      if (!draft) return Response.json({ error: 'Draft is empty' }, { status: 400 });
      if (!isValidEmail(recipient)) {
        return Response.json({ error: 'A valid recipient email address is required' }, { status: 400 });
      }

      const fallbackSubject = activity.song_title
        ? `New music: "${activity.song_title}" by ${artistName}`
        : activity.title;
      await sendMayaDraft({ base44, user, draft, recipient, fallbackSubject, confirmSend: activity.action_type === 'playlist_pitch' });

      const updated = await base44.entities.AIActivity.update(activity.id, {
        status: 'sent',
        draft_email: draft,
        recipient_email: recipient,
        sent_at: new Date().toISOString(),
      });
      await awardPointsFor(base44, user.id, { source_type: 'email_approved', source_id: activity.id, reason: `Sent: ${activity.title}` });
      console.log(`mayaSendDraft: activity ${activity.id} sent to ${recipient}`);
      return Response.json({ success: true, data: updated });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('mayaSendDraft error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}