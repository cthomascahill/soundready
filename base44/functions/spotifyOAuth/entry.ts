import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID');
    const CLIENT_SECRET = Deno.env.get('SPOTIFY_CLIENT_SECRET');

    if (!CLIENT_ID || !CLIENT_SECRET) {
      return Response.json({ error: 'Spotify credentials not configured' }, { status: 500 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action } = body;

    // ── Get OAuth authorization URL ───────────────────────────────────────────
    if (action === 'get_auth_url') {
      const appUrl = body.app_url || 'https://app.base44.com/apps/69dcf0ecc907e43a438a626b';
      const redirectUri = `${appUrl}/connect-profiles`;
      console.log('redirect_uri being sent to Spotify:', redirectUri);
      const scopes = 'user-read-private user-read-email user-follow-read';
      const state = user.id; // use user ID as state to map callback back
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: scopes,
        redirect_uri: redirectUri,
        state,
      });
      return Response.json({ auth_url: `https://accounts.spotify.com/authorize?${params}` });
    }

    // ── Exchange code for tokens ──────────────────────────────────────────────
    if (action === 'exchange_code') {
      const { code, redirect_uri } = body;
      if (!code) return Response.json({ error: 'code required' }, { status: 400 });

      const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET),
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirect_uri,
        }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        return Response.json({ error: 'Token exchange failed: ' + (tokenData.error_description || tokenData.error) }, { status: 400 });
      }

      // Pull artist data immediately
      const data = await fetchSpotifyData(tokenData.access_token);
      if (data.error) {
        return Response.json({ error: data.error }, { status: 400 });
      }

      // Save to DB (never expose refresh token client-side)
      const existing = await base44.entities.PlatformConnection.filter(
        { created_by_id: user.id, platform: 'spotify' }, '-created_date', 1
      ).catch(() => []);

      const record = {
        platform: 'spotify',
        connection_type: 'oauth',
        status: 'connected',
        display_name: data.display_name,
        profile_image_url: data.profile_image_url,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        last_synced: new Date().toISOString(),
        stats: data.stats,
      };

      let saved;
      if (existing.length > 0) {
        saved = await base44.entities.PlatformConnection.update(existing[0].id, record);
      } else {
        saved = await base44.entities.PlatformConnection.create(record);
      }

      // Return without tokens
      const { access_token, refresh_token, ...safeRecord } = saved;
      return Response.json({ success: true, data: safeRecord });
    }

    // ── Sync / refresh using stored tokens ───────────────────────────────────
    if (action === 'sync') {
      const existing = await base44.entities.PlatformConnection.filter(
        { created_by_id: user.id, platform: 'spotify' }, '-created_date', 1
      ).catch(() => []);

      if (!existing[0]) return Response.json({ error: 'Not connected' }, { status: 404 });
      const conn = existing[0];

      // Refresh access token if expired or missing
      let accessToken = conn.access_token;
      const expiresAt = conn.token_expires_at ? new Date(conn.token_expires_at) : null;
      const needsRefresh = !accessToken || !expiresAt || expiresAt <= new Date(Date.now() + 60000);

      if (needsRefresh) {
        if (!conn.refresh_token) {
          // Mark disconnected
          await base44.entities.PlatformConnection.update(conn.id, { status: 'disconnected', access_token: null, refresh_token: null });
          return Response.json({ error: 'Token expired — please reconnect Spotify', needs_reconnect: true }, { status: 401 });
        }
        const refreshRes = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET),
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: conn.refresh_token,
          }),
        });
        const refreshData = await refreshRes.json();
        if (!refreshData.access_token) {
          // Revoked — clear tokens
          await base44.entities.PlatformConnection.update(conn.id, { status: 'disconnected', access_token: null, refresh_token: null });
          return Response.json({ error: 'Spotify access was revoked. Please reconnect.', needs_reconnect: true }, { status: 401 });
        }
        accessToken = refreshData.access_token;
        await base44.entities.PlatformConnection.update(conn.id, {
          access_token: accessToken,
          token_expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
          ...(refreshData.refresh_token ? { refresh_token: refreshData.refresh_token } : {}),
        });
      }

      const data = await fetchSpotifyData(accessToken);
      if (data.error) {
        if (data.status === 401) {
          await base44.entities.PlatformConnection.update(conn.id, { status: 'disconnected', access_token: null, refresh_token: null });
          return Response.json({ error: 'Spotify access was revoked. Please reconnect.', needs_reconnect: true }, { status: 401 });
        }
        return Response.json({ error: data.error }, { status: 400 });
      }

      const updated = await base44.entities.PlatformConnection.update(conn.id, {
        display_name: data.display_name,
        profile_image_url: data.profile_image_url,
        last_synced: new Date().toISOString(),
        status: 'connected',
        stats: data.stats,
      });

      const { access_token: _a, refresh_token: _r, ...safeRecord } = updated;
      return Response.json({ success: true, data: safeRecord });
    }

    // ── Disconnect ────────────────────────────────────────────────────────────
    if (action === 'disconnect') {
      const existing = await base44.entities.PlatformConnection.filter(
        { created_by_id: user.id, platform: 'spotify' }, '-created_date', 1
      ).catch(() => []);

      if (existing[0]) {
        const accessToken = existing[0].access_token;
        // Try to revoke on Spotify's side
        if (accessToken) {
          await fetch('https://accounts.spotify.com/api/token/revoke', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET),
            },
            body: new URLSearchParams({ token: accessToken }),
          }).catch(() => {});
        }
        await base44.entities.PlatformConnection.update(existing[0].id, {
          status: 'disconnected',
          access_token: null,
          refresh_token: null,
          token_expires_at: null,
          stats: null,
          display_name: null,
          profile_image_url: null,
        });
      }
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function fetchSpotifyData(accessToken) {
  const headers = { Authorization: `Bearer ${accessToken}` };

  // Fetch /me and /me/following in parallel
  const [meRes, followingRes] = await Promise.all([
    fetch('https://api.spotify.com/v1/me', { headers }),
    fetch('https://api.spotify.com/v1/me/following?type=artist&limit=1', { headers }),
  ]);

  if (meRes.status === 401) return { error: 'Unauthorized', status: 401 };
  const me = await meRes.json();
  if (me.error) return { error: me.error.message };

  // Get artist profile for the authenticated user using their Spotify artist URI if available
  // me endpoint returns user profile, not artist — use search to find artist ID
  let artistStats = {};
  if (me.id) {
    // Search for artist by display name to get the artist endpoint data
    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(me.display_name || me.id)}&type=artist&limit=5`,
      { headers }
    );
    const searchData = await searchRes.json();
    // Try to find the best matching artist
    const artists = searchData.artists?.items || [];
    const exactMatch = artists.find(a => a.name.toLowerCase() === (me.display_name || '').toLowerCase()) || artists[0];

    if (exactMatch) {
      const [artistRes, topTracksRes] = await Promise.all([
        fetch(`https://api.spotify.com/v1/artists/${exactMatch.id}`, { headers }),
        fetch(`https://api.spotify.com/v1/artists/${exactMatch.id}/top-tracks?market=US`, { headers }),
      ]);
      const artistData = await artistRes.json();
      const topTracksData = await topTracksRes.json();

      artistStats = {
        artist_id: exactMatch.id,
        popularity: artistData.popularity || 0,
        genres: artistData.genres || [],
        top_tracks: (topTracksData.tracks || []).slice(0, 5).map(t => ({
          title: t.name,
          popularity: t.popularity,
          album: t.album?.name || null,
          preview_url: t.preview_url || null,
        })),
      };
    }
  }

  const followingData = followingRes.ok ? await followingRes.json() : {};

  const stats = {
    followers: me.followers?.total || 0,
    monthly_listeners: null, // Not available via user API — needs artist dashboard
    ...artistStats,
  };

  return {
    display_name: me.display_name || me.id,
    profile_image_url: me.images?.[0]?.url || null,
    stats,
  };
}