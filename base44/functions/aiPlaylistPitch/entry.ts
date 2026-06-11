import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { song_id } = await req.json();
    if (!song_id) return Response.json({ error: 'song_id required' }, { status: 400 });

    const song = await base44.entities.SongAnalysis.filter({ id: song_id }, '', 1).then(r => r[0]);
    if (!song) return Response.json({ error: 'Song not found' }, { status: 404 });

    // Define playlist types based on song data
    const playlistTypes = [
      `${song.genre || 'Indie'} New Releases`,
      `${song.mood || 'Feel Good'} Vibes`,
      `${song.energy_level === 'high' ? 'High Energy' : song.energy_level === 'low' ? 'Chill' : 'Mid-Tempo'} ${song.genre || 'Music'}`,
      `Best of ${song.genre || 'Independent'} 2025`,
      `${song.genre || 'Pop'} Hits`,
    ];

    // Generate pitches for each playlist type using LLM
    const pitchResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a professional music publicist writing playlist pitch emails for an independent artist. Write concise, personalized pitch emails for each playlist type listed.

Song details:
- Title: "${song.title}"
- Artist: "${song.artist_name}"
- Genre: ${song.genre || 'Independent'}
- Mood: ${song.mood || 'uplifting'}
- Energy: ${song.energy_level || 'medium'}
- BPM: ${song.bpm || 'N/A'}
- Key: ${song.key || 'N/A'}
- Similar Artists: ${(song.similar_artists || []).slice(0, 3).join(', ') || 'N/A'}
- Description: ${song.song_description || song.first_impression || 'A compelling independent track'}

Playlist types to pitch: ${playlistTypes.join(', ')}

For each playlist, write a short pitch email (3 short paragraphs). Reference specific audio details about the song. Be human, direct, and specific — never generic. Format as a JSON array where each item has: playlist_type (string), subject (string), body (string).`,
      response_json_schema: {
        type: "object",
        properties: {
          pitches: {
            type: "array",
            items: {
              type: "object",
              properties: {
                playlist_type: { type: "string" },
                subject: { type: "string" },
                body: { type: "string" }
              }
            }
          }
        }
      },
      model: "claude_sonnet_4_6"
    });

    const pitches = pitchResult?.pitches || [];
    const pitchCount = pitches.length;

    // Log AI activity
    await base44.asServiceRole.entities.AIActivity.create({
      user_id: user.id,
      action_type: "playlist_pitch",
      title: `Pitched "${song.title}" to ${pitchCount} playlist types`,
      description: `Auto-generated personalized pitch emails for: ${pitches.map(p => p.playlist_type).join(', ')}. All pitches are ready to send.`,
      song_id: song.id,
      song_title: song.title,
      status: "ready_to_send",
      draft_email: pitches.map(p => `=== ${p.playlist_type} ===\nSubject: ${p.subject}\n\n${p.body}`).join('\n\n---\n\n'),
      metadata: { pitch_count: pitchCount, playlist_types: pitches.map(p => p.playlist_type) }
    });

    // Send email notification to artist
    if (user.email) {
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `Your song "${song.title}" has been pitched to ${pitchCount} playlists`,
        body: `Your AI Manager just went to work.\n\nYour song "${song.title}" has been pitched to ${pitchCount} playlist curators:\n\n${pitches.map(p => `• ${p.playlist_type}`).join('\n')}\n\nLog in to view your pitching report and see every draft in the AI Activity section of your dashboard.\n\n— SoundReady AI Manager`
      });
    }

    return Response.json({ success: true, pitch_count: pitchCount, pitches });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});