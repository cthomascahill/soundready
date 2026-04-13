import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // This runs as a scheduled job — use service role
    const allUsers = await base44.asServiceRole.entities.User.list();
    const allAnalyses = await base44.asServiceRole.entities.SongAnalysis.filter({ status: "complete" }, "-created_date", 500);
    const allSnapshots = await base44.asServiceRole.entities.ScoreSnapshot.list("-snapshot_date", 1000);
    const allContacts = await base44.asServiceRole.entities.Contact.list("-created_date", 500);

    let emailsSent = 0;

    for (const user of allUsers) {
      const userSongs = allAnalyses.filter((s) => s.created_by === user.email);
      if (userSongs.length === 0) continue;

      // Get user's recent snapshots (last 14 days)
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
      const userSnaps = allSnapshots.filter((s) =>
        userSongs.some((song) => song.id === s.song_id) && s.snapshot_date > twoWeeksAgo
      );

      // Get user's contacts
      const userContacts = allContacts.filter((c) => c.created_by === user.email);
      const coldContacts = userContacts.filter((c) => c.relationship_status === "Cold").slice(0, 3);

      // Compute trend
      const latestSong = userSongs[0];
      const songSnaps = userSnaps.filter((s) => s.song_id === latestSong.id).sort((a, b) => a.snapshot_date.localeCompare(b.snapshot_date));
      const trend = songSnaps.length >= 2
        ? (songSnaps[songSnaps.length - 1].overall_score - songSnaps[0].overall_score)
        : null;

      // Generate personalized email via AI
      const emailContent = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a personal music manager writing a weekly Monday check-in email to an independent artist.

Artist: ${user.full_name || user.email}
Tracks on SoundScore: ${userSongs.length}
Top Track: "${latestSong.title}" (${latestSong.genre}, Score: ${latestSong.overall_score}/100)
TikTok Score: ${latestSong.tiktok_score}/100 | Spotify Score: ${latestSong.spotify_score}/100
Score Trend (last 2 weeks): ${trend !== null ? (trend > 0 ? `+${trend.toFixed(0)} points ↑` : `${trend.toFixed(0)} points ↓`) : "No snapshots yet"}
Curator Contacts in CRM: ${userContacts.length} total, ${coldContacts.length} cold leads
Cold contacts to pitch this week: ${coldContacts.map((c) => `${c.name} (${c.role}, ${c.platform || "no platform"})`).join(", ") || "none yet"}

Write a warm, encouraging, BRIEF weekly email. Tone: knowledgeable friend who is also a music industry insider. 
Include: 1) Quick score summary 2) 1-2 curator pitch suggestions if applicable 3) 2 specific content ideas for this week based on the genre/mood 4) One sharp actionable tip.
Format as plain text email. Subject line included. Sign off as "Your SoundScore Manager".`,
        response_json_schema: {
          type: "object",
          properties: {
            subject: { type: "string" },
            body: { type: "string" }
          }
        }
      });

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: user.email,
        subject: emailContent.subject,
        body: emailContent.body,
        from_name: "SoundScore",
      });

      emailsSent++;
    }

    return Response.json({ success: true, emails_sent: emailsSent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});