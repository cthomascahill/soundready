import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // This function can be called by scheduler — use service role for fetching all AI Manager users
    let user;
    let targetUserId;

    try {
      user = await base44.auth.me();
      targetUserId = user?.id;
    } catch {
      // Called from scheduler — process all AI Manager users
    }

    if (targetUserId) {
      await sendDigestForUser(base44, user);
      return Response.json({ success: true });
    }

    // Admin/scheduler path: fetch all users with plan = ai_manager
    // Since we can't list users, we look at recent AI activities to find active users
    const recentActivities = await base44.asServiceRole.entities.AIActivity.list('-created_date', 100);
    const userIds = [...new Set(recentActivities.map(a => a.user_id).filter(Boolean))];

    let processed = 0;
    for (const uid of userIds) {
      try {
        // Gather their songs and activities
        const songs = await base44.asServiceRole.entities.SongAnalysis.filter({ created_by_id: uid }, '-created_date', 5);
        const activities = await base44.asServiceRole.entities.AIActivity.filter({ user_id: uid }, '-created_date', 10);

        if (songs.length === 0) continue;

        const artistName = songs[0]?.artist_name || 'Artist';
        const genres = [...new Set(songs.map(s => s.genre).filter(Boolean))];

        const digestResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `You are a direct, human A&R manager writing a weekly career digest email for ${artistName}, a ${genres.join('/')} artist.

Recent activity this week:
${activities.slice(0, 5).map(a => `- ${a.title}: ${a.description}`).join('\n') || '- No activity this week'}

Recent songs:
${songs.map(s => `- "${s.title}" (${s.genre}, ${s.status})`).join('\n')}

Write a weekly digest email that includes:
1. A summary of last week's AI activity (2-3 sentences)
2. One specific release timing recommendation based on their genre
3. One tour opportunity or booking suggestion 
4. One specific, actionable recommendation for this week
5. A motivational but honest 1-paragraph assessment of where their career stands

Write in a direct A&R voice — specific, human, never generic. Reference their actual song titles and genre. Subject line and full email body.`,
          model: "claude_sonnet_4_6"
        });

        const digestContent = typeof digestResult === 'string' ? digestResult : JSON.stringify(digestResult);

        await base44.asServiceRole.entities.AIActivity.create({
          user_id: uid,
          action_type: "digest_sent",
          title: "Weekly AI Career Digest",
          description: "Your weekly AI Manager career digest has been prepared with personalized recommendations, release timing, and tour opportunities.",
          status: "complete",
          draft_email: digestContent,
          metadata: { week: new Date().toISOString().split('T')[0] }
        });

        processed++;
      } catch (err) {
        console.error(`Failed digest for user ${uid}:`, err.message);
      }
    }

    return Response.json({ success: true, processed });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function sendDigestForUser(base44, user) {
  const songs = await base44.entities.SongAnalysis.list('-created_date', 5);
  const activities = await base44.entities.AIActivity.filter({ user_id: user.id }, '-created_date', 10);
  const artistName = user.artist_name || user.full_name || 'Artist';
  const genres = [...new Set(songs.map(s => s.genre).filter(Boolean))];

  const digestResult = await base44.integrations.Core.InvokeLLM({
    prompt: `You are a direct, human A&R manager writing a weekly career digest email for ${artistName}, a ${genres.join('/')} artist.

Recent activity: ${activities.slice(0, 5).map(a => `- ${a.title}`).join('\n') || 'Getting started'}
Songs: ${songs.map(s => `"${s.title}" (${s.genre})`).join(', ')}

Write a weekly digest with: activity summary, release timing recommendation, tour opportunity, one actionable recommendation for the week, and an honest career assessment. Direct A&R voice. Include subject line.`,
    model: "claude_sonnet_4_6"
  });

  const digestContent = typeof digestResult === 'string' ? digestResult : JSON.stringify(digestResult);

  await base44.asServiceRole.entities.AIActivity.create({
    user_id: user.id,
    action_type: "digest_sent",
    title: "Weekly AI Career Digest",
    description: "Your weekly AI Manager career digest with personalized recommendations.",
    status: "complete",
    draft_email: digestContent,
    metadata: { week: new Date().toISOString().split('T')[0] }
  });
}