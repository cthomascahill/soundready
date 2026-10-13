import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// SoundReady EPK share links — a public link that opens the artist's saved
// Electronic Press Kit in the browser, like the demo links for songs.
// Reader actions ("get", "download") are deliberately public: the long random
// token in the URL is the check, and only non-sensitive fields are returned.
// Artist actions ("create", "revoke") require a login and are scoped to the
// artist's own kits by RLS.

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    // ── Public: a reader opens the kit or downloads its PDF ───────────
    if (action === 'get' || action === 'download') {
      const token = String(body.token || '').trim();
      if (!token || token.length < 16) return Response.json({ error: 'Link not found' }, { status: 404 });

      const kits = await base44.asServiceRole.entities.EPK.filter({ share_token: token }, '-created_date', 1);
      const kit = kits[0];
      if (!kit) return Response.json({ error: 'Link not found' }, { status: 404 });

      if (action === 'get') {
        return Response.json({
          artist_name: kit.artist_name || '',
          tagline: kit.tagline || '',
          one_liner: kit.one_liner || '',
          bio: kit.bio || '',
          location: kit.location || '',
          genre: kit.genre || '',
          photo_url: kit.photo_url || '',
          music_url: kit.music_url || '',
          contact_email: kit.contact_email || '',
          phone: kit.phone || '',
          website: kit.website || '',
          instagram: kit.instagram || '',
          tiktok: kit.tiktok || '',
          youtube: kit.youtube || '',
          highlights: kit.highlights || '',
          notable_shows: kit.notable_shows || '',
          monthly_listeners: kit.monthly_listeners || 0,
          total_streams: kit.total_streams || 0,
          followers: kit.followers || 0,
          social_proof: kit.social_proof || [],
          featured_songs: kit.featured_songs || [],
          has_pdf: !!kit.file_uri,
        });
      }

      if (!kit.file_uri) return Response.json({ error: 'This kit has no PDF saved yet' }, { status: 404 });
      const signed = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri: kit.file_uri, expires_in: 3600 });
      return Response.json({ signed_url: signed?.signed_url || '' });
    }

    // ── Artist actions — login required, RLS-scoped to the artist ──────
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    if (action === 'create') {
      if (!body.epk_id) return Response.json({ error: 'epk_id required' }, { status: 400 });
      const kits = await base44.entities.EPK.filter({ id: body.epk_id }, '-created_date', 1);
      const kit = kits[0];
      if (!kit) return Response.json({ error: 'Kit not found' }, { status: 404 });
      if (kit.share_token) return Response.json({ token: kit.share_token });
      const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '').slice(0, 8);
      await base44.entities.EPK.update(kit.id, { share_token: token });
      console.log(`epkShare: created share link for kit ${kit.id}`);
      return Response.json({ token });
    }

    if (action === 'revoke') {
      if (!body.epk_id) return Response.json({ error: 'epk_id required' }, { status: 400 });
      const kits = await base44.entities.EPK.filter({ id: body.epk_id }, '-created_date', 1);
      if (!kits[0]) return Response.json({ error: 'Kit not found' }, { status: 404 });
      await base44.entities.EPK.update(body.epk_id, { share_token: '' });
      console.log(`epkShare: revoked share link for kit ${body.epk_id}`);
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('epkShare error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}