import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { sendMayaDraft, isValidEmail } from '../../shared/mayaEmail.ts';

// Per-draft actions for "Tell Sam what to do" tasks. Every draft is reviewed
// and approved individually: send emails it out, approve marks it taken on,
// dismiss rejects it. Nothing sends without the artist's explicit action.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const isAIManager = user.role === 'admin' || user.subscription_tier === 'ai_manager';
    if (!isAIManager) return Response.json({ error: 'AI Manager subscription required' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const { action, draft_id } = body;
    if (!draft_id) return Response.json({ error: 'draft_id required' }, { status: 400 });

    const drafts = await base44.entities.SamTaskDraft.filter({ id: draft_id }, '', 1);
    const draft = drafts[0];
    if (!draft) return Response.json({ error: 'Draft not found' }, { status: 404 });
    if (draft.user_id !== user.id) return Response.json({ error: 'This draft does not belong to you' }, { status: 403 });

    const artistName = user.artist_name || user.full_name || 'The Artist';

    // ── Dismiss: reject this draft ────────────────────────────────────────
    if (action === 'dismiss') {
      const updated = await base44.entities.SamTaskDraft.update(draft.id, { status: 'dismissed' });
      console.log(`samTaskDraft: draft ${draft.id} dismissed`);
      return Response.json({ success: true, data: updated });
    }

    // ── Approve: artist takes this one on themselves ──────────────────────
    if (action === 'approve') {
      const text = (body.draft_text || draft.draft || '').trim();
      const updated = await base44.entities.SamTaskDraft.update(draft.id, {
        status: 'approved',
        draft: text,
      });
      console.log(`samTaskDraft: draft ${draft.id} approved by artist`);
      return Response.json({ success: true, data: updated });
    }

    // ── Send: email the approved draft to its target ──────────────────────
    if (action === 'send') {
      const text = (body.draft_text || draft.draft || '').trim();
      const recipient = (body.recipient_email || draft.target_email || '').trim();
      if (!text) return Response.json({ error: 'Draft is empty' }, { status: 400 });
      if (!isValidEmail(recipient)) {
        return Response.json({ error: 'No verified email on file for this target. Use the official contact page, or add an email you verified yourself.' }, { status: 400 });
      }

      // Attach the task's files (the song, the report) so "send this song
      // to Warner" actually delivers the song with the pitch.
      const parentTasks = await base44.entities.SamTask.filter({ id: draft.task_id }, '', 1).catch(() => []);
      const attachments = ((parentTasks[0]?.attachments) || [])
        .slice(0, 5)
        .map(a => ({ filename: a.name || 'attachment', file_url: a.file_uri }));

      await sendMayaDraft({
        base44,
        user,
        draft: text,
        recipient,
        fallbackSubject: `Booking inquiry from ${artistName}`,
        attachments,
      });

      const updated = await base44.entities.SamTaskDraft.update(draft.id, {
        status: 'sent',
        draft: text,
        target_email: recipient,
        sent_at: new Date().toISOString(),
      });
      console.log(`samTaskDraft: draft ${draft.id} sent to ${recipient}`);
      return Response.json({ success: true, data: updated });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('samTaskDraft error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}