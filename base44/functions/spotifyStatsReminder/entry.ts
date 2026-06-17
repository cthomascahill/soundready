import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Scheduled function: runs weekly, finds any Spotify connections not updated in 7+ days
// and creates an AIActivity notification for that user.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Get all Spotify connections
    const connections = await base44.asServiceRole.entities.PlatformConnection.filter(
      { platform: 'spotify', status: 'connected' },
      '-last_synced',
      100
    );

    let notified = 0;

    for (const conn of connections) {
      // Skip if updated recently
      if (conn.last_synced && conn.last_synced > sevenDaysAgo) continue;

      const userId = conn.created_by_id;
      if (!userId) continue;

      // Check if we already sent a reminder in the last 7 days to avoid duplicates
      const recentReminders = await base44.asServiceRole.entities.AIActivity.filter(
        { user_id: userId, action_type: 'digest_sent' },
        '-created_date',
        5
      );

      const alreadyReminded = recentReminders.some(r =>
        r.title?.includes('Spotify') &&
        r.created_date > sevenDaysAgo
      );

      if (alreadyReminded) continue;

      await base44.asServiceRole.entities.AIActivity.create({
        user_id: userId,
        action_type: 'digest_sent',
        title: '📊 Spotify stats may be outdated',
        description: "It's been 7+ days since you last updated your Spotify followers and monthly listeners. Head to Connect Platforms → Spotify to refresh your numbers.",
        status: 'complete',
        metadata: { link: '/connect-profiles', platform: 'spotify' },
      });

      notified++;
    }

    return Response.json({ success: true, notified });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});