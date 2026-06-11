import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { song_id } = await req.json();
    const song = song_id
      ? await base44.entities.SongAnalysis.filter({ id: song_id }, '', 1).then(r => r[0])
      : await base44.entities.SongAnalysis.list('-created_date', 1).then(r => r[0]);

    if (!song) return Response.json({ error: 'No song found' }, { status: 404 });

    const artistName = user.artist_name || song.artist_name || user.full_name;
    const bio = user.bio || `Independent artist ${artistName} creates ${song.genre || 'original'} music.`;

    const epkResult = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a professional Electronic Press Kit (EPK) document for the following artist and song.

Artist: ${artistName}
Bio: ${bio}
Song: "${song.title}"
Genre: ${song.genre || 'Independent'}
Mood: ${song.mood || 'N/A'}
Energy: ${song.energy_level || 'N/A'}
BPM: ${song.bpm || 'N/A'}
Key: ${song.key || 'N/A'}
Similar Artists: ${(song.similar_artists || []).slice(0, 3).join(', ') || 'N/A'}
Song Description: ${song.song_description || song.first_impression || ''}
Analysis: ${song.verdict || song.algorithm_outlook || ''}

Generate a complete EPK including:
1. Artist bio (2 paragraphs, professional)
2. About the new song "${song.title}" (1 compelling paragraph referencing actual audio data)
3. A professional press quote from an imaginary reputable music blog (e.g. "Rolling Stone", "Pitchfork") in quotes
4. Key stats section (format as bullet points with placeholder values)
5. Contact info section (placeholder)

Write in a professional press release voice. Be specific about the song's sound using the audio data provided.`,
      model: "claude_sonnet_4_6"
    });

    const epkContent = typeof epkResult === 'string' ? epkResult : epkResult?.text || JSON.stringify(epkResult);

    await base44.asServiceRole.entities.AIActivity.create({
      user_id: user.id,
      action_type: "epk_generated",
      title: `EPK auto-generated for "${song.title}"`,
      description: `Your Electronic Press Kit has been updated with the latest song data from "${song.title}". Download or share your EPK from the Press Kit page.`,
      song_id: song.id,
      song_title: song.title,
      status: "complete",
      draft_email: epkContent,
      metadata: { song_title: song.title, artist_name: artistName }
    });

    return Response.json({ success: true, epk: epkContent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});