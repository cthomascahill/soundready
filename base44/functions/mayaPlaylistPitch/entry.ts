import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { song_id, playlist } = await req.json();
    if (!song_id || !playlist?.name || !playlist?.email) {
      return Response.json({ error: 'song_id and playlist (name, email) are required' }, { status: 400 });
    }

    const songs = await base44.entities.SongVault.filter({ id: song_id }, '', 1);
    const song = songs[0];
    if (!song) return Response.json({ error: 'Song not found in your Vault' }, { status: 404 });

    const artistName = user.full_name || 'the artist';
    const pitch = await base44.integrations.Core.InvokeLLM({
      prompt: `You are Sam, the AI manager for independent artist "${artistName}". Write a short, professional playlist pitch email to the curator of "${playlist.name}".

Song: "${song.title}"${song.featured_artists ? ` (feat. ${song.featured_artists})` : ''}
Genre: ${song.genre || 'independent'}
Moods: ${(song.moods || []).join(', ') || 'N/A'}
${song.notes ? `About the song: ${song.notes}` : ''}

Curator: ${playlist.curator || 'the curator'} (${playlist.followers || '?'} followers)
Curator's preferences: "${playlist.note || ''}"

Write 3-4 sentences. Address the curator by name in the first sentence. Reference why THIS song fits THIS playlist, concretely, never generic. End with a clear ask. First person from the artist, signed with the artist's name. Start with a "Subject:" line, then a blank line, then the email body. Return only the email, nothing else.`,
    });

    const draft = (typeof pitch === 'string' ? pitch : '').trim();
    if (!draft) return Response.json({ error: 'Sam could not draft the pitch — try again in a moment.' }, { status: 500 });

    const activity = await base44.entities.AIActivity.create({
      user_id: user.id,
      action_type: 'playlist_pitch',
      title: `Pitch "${song.title}" to ${playlist.name}`,
      description: `${playlist.curator || 'Curator'} · ${playlist.followers || '?'} followers${playlist.note ? ` — ${playlist.note}` : ''}`,
      song_id: song.id,
      song_title: song.title,
      status: 'ready_to_send',
      draft_email: draft,
      recipient_email: playlist.email,
      metadata: {
        playlist_name: playlist.name,
        curator: playlist.curator || '',
        followers: playlist.followers || '',
        email_source: 'Playlist database',
      },
    });

    return Response.json(activity);
  } catch (error) {
    console.error('mayaPlaylistPitch error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}