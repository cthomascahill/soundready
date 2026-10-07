import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// SoundReady demo links — a private listen link for one Vault song, or for an
// entire project (album/EP) that plays every song in it, in order.
// Listener actions ("get", "play") are deliberately public: the long random
// token in the URL is the check, and only non-sensitive fields are returned.
// Artist actions ("get_by_song", "create", "revoke") require a login and are
// scoped to the artist's own songs, projects and links by RLS.

// Signs a private-storage file URI into a playable URL; passes public URLs through.
async function resolveAudio(base44, fileUrl) {
  if (!fileUrl) return '';
  if (/^https?:\/\//.test(fileUrl)) return fileUrl;
  try {
    const signed = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri: fileUrl, expires_in: 3600 });
    return signed?.signed_url || fileUrl;
  } catch (err) {
    console.log('demoLink: signed url skipped:', err?.message || err);
    return fileUrl;
  }
}

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

      // Album mode — one link plays every song in a project, in order
      if (link.project_id) {
        const [projects, allSongs] = await Promise.all([
          base44.asServiceRole.entities.SongProject.filter({ id: link.project_id }, '', 1).catch(() => []),
          base44.asServiceRole.entities.SongVault.filter({ created_by_id: link.user_id }, '-created_date', 200).catch(() => []),
        ]);
        const albumSongs = allSongs
          .filter(s => s.project_ids?.includes(link.project_id) && s.file_url)
          .sort((a, b) => new Date(a.created_date || 0) - new Date(b.created_date || 0));
        const tracks = albumSongs.map(s => ({
          id: s.id,
          title: s.title || 'Untitled',
          featured_artists: s.featured_artists || '',
          duration: s.duration || null,
          artwork_url: s.artwork_url || '',
        }));
        const meta = {
          is_album: true,
          title: projects[0]?.name || link.song_title || 'Untitled project',
          artist: link.artist_name || '',
          featured_artists: '',
          artwork_url: tracks.find(t => t.artwork_url)?.artwork_url || '',
          plays: link.plays || 0,
          track_count: tracks.length,
          tracks,
        };
        if (action === 'get') return Response.json(meta);

        const trackId = body.track_id || tracks[0]?.id;
        const song = albumSongs.find(s => s.id === trackId) || albumSongs[0];
        if (!song) return Response.json({ error: 'No songs with audio in this project yet' }, { status: 400 });
        const audioUrl = await resolveAudio(base44, song.file_url);

        await base44.asServiceRole.entities.DemoLink.update(link.id, {
          plays: (link.plays || 0) + 1,
          last_played_at: new Date().toISOString(),
        }).catch(() => {});

        return Response.json({ ...meta, audio_url: audioUrl });
      }

      // Single-song mode
      const songs = await base44.asServiceRole.entities.SongVault.filter({ id: link.song_id }, '', 1);
      const song = songs[0] || {};
      const meta = {
        is_album: false,
        title: song.title || link.song_title || 'Untitled demo',
        artist: link.artist_name || '',
        featured_artists: song.featured_artists || '',
        artwork_url: song.artwork_url || '',
        plays: link.plays || 0,
      };
      if (action === 'get') return Response.json(meta);

      const audioUrl = await resolveAudio(base44, song.file_url);
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
      const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '').slice(0, 8);

      // Album link — one link for a whole project
      if (body.project_id) {
        const projects = await base44.entities.SongProject.filter({ id: body.project_id }, '', 1);
        const project = projects[0];
        if (!project) return Response.json({ error: 'Project not found' }, { status: 404 });

        const existing = await base44.entities.DemoLink.filter({ project_id: project.id, active: true }, '-created_date', 1);
        if (existing[0]) return Response.json({ link: existing[0] });
        if (action === 'get_by_song') return Response.json({ link: null });

        const all = await base44.entities.SongVault.filter({ created_by_id: user.id }, '-created_date', 200).catch(() => []);
        const withAudio = all.filter(s => s.project_ids?.includes(project.id) && s.file_url);
        if (!withAudio.length) {
          return Response.json({ error: 'Add audio files to songs in this project first' }, { status: 400 });
        }

        const profiles = await base44.entities.ArtistProfile.filter({ created_by_id: user.id }, '-created_date', 1).catch(() => []);
        const artistName = profiles[0]?.stage_name || user.full_name || '';
        const created = await base44.entities.DemoLink.create({
          user_id: user.id,
          song_id: '',
          project_id: project.id,
          token,
          artist_name: artistName,
          song_title: project.name,
          plays: 0,
          active: true,
        });
        console.log(`demoLink: created album link ${created.id} for project ${project.id} (${withAudio.length} songs)`);
        return Response.json({ link: created });
      }

      // Single-song link
      if (!body.song_id) return Response.json({ error: 'song_id or project_id required' }, { status: 400 });
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
        token,
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