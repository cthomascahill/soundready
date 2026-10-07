import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// SoundReady demo links — a private listen link for one Vault song.
// Listener actions ("get", "play") are deliberately public: the long random
// token in the URL is the check, and only non-sensitive fields are returned.
// Artist actions ("get_by_song", "create", "revoke") require a login and are
// scoped to the artist's own songs and links by RLS.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    // ── Public: a listener opens the player or presses play ────────────
    if (action === 'get' || action === 'play') {
      const token = String(body.token || '').trim();
      if (!token || token.length < 16) return Response.json({ error: 'Link not found' }, { status: 404 });

      const links = await base44.asServiceRole.entities.DemoLink.filter({ token }, '', 1);
      const link = links[0];
      if (!link || !link.active) return Response.json({ error: 'Link not found' }, { status: 404 });

      const songs = await base44.asServiceRole.entities.SongVault.filter({ id: link.song_id }, '', 1);
      const song = songs[0] || {};
      const meta = {
        title: song.title || link.song_title || 'Untitled demo',
        artist: link.artist_name || '',
        featured_artists: song.featured_artists || '',
        artwork_url: song.artwork_url || '',
        plays: link.plays || 0,
      };

      if (action === 'get') return Response.json(meta);

      // "play" — resolve the audio URL and count the listen
      let audioUrl = song.file_url || '';
      if (audioUrl && !/^https?:\/\//.test(audioUrl)) {
        try {
          const signed = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri: audioUrl, expires_in: 3600 });
          audioUrl = signed?.signed_url || audioUrl;
        } catch (err) {
          console.log('demoLink: signed url skipped:', err?.message || err);
        }
      }
      if (!audioUrl) return Response.json({ error: 'This song has no audio file yet' }, { status: 400 });

      await base44.asServiceRole.entities.DemoLink.update(link.id, {
        plays: (link.plays || 0) + 1,
        last_played_at: new Date().toISOString(),
      }).catch(() => {});

      return Response.json({ ...meta, audio_url: audioUrl });
    }

    // ── Artist actions — login required, RLS-scoped to the artist ──────
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    if (action === 'get_by_song' || action === 'create') {
      if (!body.song_id) return Response.json({ error: 'song_id required' }, { status: 400 });
      const songs = await base44.entities.SongVault.filter({ id: body.song_id }, '', 1);
      const song = songs[0];
      if (!song) return Response.json({ error: 'Song not found' }, { status: 404 });

      const existing = await base44.entities.DemoLink.filter({ song_id: song.id, active: true }, '-created_date', 1);
      if (existing[0]) return Response.json({ link: existing[0] });
      if (action === 'get_by_song') return Response.json({ link: null });

      if (!song.file_url) return Response.json({ error: 'Add an audio file to this song first' }, { status: 400 });

      const profiles = await base44.entities.ArtistProfile.filter({ created_by_id: user.id }, '-created_date', 1).catch(() => []);
      const artistName = profiles[0]?.stage_name || user.full_name || '';
      const created = await base44.entities.DemoLink.create({
        user_id: user.id,
        song_id: song.id,
        token: crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '').slice(0, 8),
        artist_name: artistName,
        song_title: song.title,
        plays: 0,
        active: true,
      });
      console.log(`demoLink: created link ${created.id} for song ${song.id}`);
      return Response.json({ link: created });
    }

    if (action === 'revoke') {
      if (!body.link_id) return Response.json({ error: 'link_id required' }, { status: 400 });
      const links = await base44.entities.DemoLink.filter({ id: body.link_id }, '', 1);
      if (!links[0]) return Response.json({ error: 'Link not found' }, { status: 404 });
      await base44.entities.DemoLink.update(body.link_id, { active: false });
      console.log(`demoLink: revoked link ${body.link_id}`);
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('demoLink error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}