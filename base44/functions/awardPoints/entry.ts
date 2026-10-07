import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { POINTS_TABLE, awardPointsFor } from '../../shared/points.ts';

// Frontend hook for gamification: a page completes a full action (upload a
// song, release a song, ...) and calls this with the action's record id.
// Points are computed and deduped server-side, so they can't be inflated.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { source_type, source_id, reason } = body;
    if (!POINTS_TABLE[source_type]) {
      return Response.json({ error: 'Unknown action type' }, { status: 400 });
    }

    const result = await awardPointsFor(base44, user.id, {
      source_type,
      source_id: String(source_id || ''),
      reason: String(reason || ''),
    });

    return Response.json({ success: true, ...result });
  } catch (error) {
    console.error('awardPoints error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}