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
      // Carry the exact redirect_uri in the state so the token exchange always
      // matches the URI Spotify authorized, whichever host the artist used.
      const state = JSON.stringify({ user_id: user.id, redirect_uri: redirectUri });
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
      const { code, redirect_uri, state } = body;
      if (!code) return Response.json({ error: 'code required' }, { status: 400 });

      // The redirect_uri must exactly match the one used in the authorize
      // request, so read it back from the state blob Spotify echoed to us.
      let redirectUri = redirect_uri;
      let stateUserId = null;
      if (state) {
        try {
          const parsed = JSON.parse(state);
          if (parsed && typeof parsed === 'object') {
            if (parsed.user_id) stateUserId = parsed.user_id;
            if (parsed.redirect_uri) redirectUri = parsed.redirect_uri;
          }
        } catch { /* older flow used a bare user id as state */ }
      }
      if (stateUserId && stateUserId !== user.id) {
        return Response.json({ error: 'This Spotify link belongs to a different session. Please reconnect.' }, { status: 403 });
      }

      const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET),
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
        }),
      });
      const tokenData = await safeJson(tokenRes);
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
        const refreshData = await safeJson(refreshRes);
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

    // ── Link the artist profile (Spotify artist URL) ───────────────────────────
    // The OAuth login covers the personal account. Artist data is public on
    // Spotify, so a client-credentials token is enough to pull it.
    if (action === 'link_artist') {
      const { artist_url } = body;
      const match = String(artist_url || '').match(/artist[/:]([A-Za-z0-9]+)/);
      if (!match) {
        return Response.json({ error: 'Paste your full Spotify artist link (open.spotify.com/artist/...)' }, { status: 400 });
      }
      const artistId = match[1];

      const myConns = await base44.entities.PlatformConnection.filter(
        { created_by_id: user.id, platform: 'spotify' }, '-created_date', 1
      ).catch(() => []);
      // Prefer the artist's own OAuth token; fall back to client credentials
      let token = myConns[0]?.access_token || null;
      if (!token) {
        const ccRes = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET),
          },
          body: new URLSearchParams({ grant_type: 'client_credentials' }),
        });
        const cc = await safeJson(ccRes);
        if (!cc.access_token) {
          return Response.json({ error: 'Could not authenticate with Spotify: ' + (cc.error || 'unknown error') }, { status: 400 });
        }
        token = cc.access_token;
      }
      const headers = { Authorization: `Bearer ${token}` };

      const [artistRes, topRes] = await Promise.all([
        fetch(`https://api.spotify.com/v1/artists/${artistId}`, { headers }),
        fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`, { headers }),
      ]);
      if (artistRes.status === 404) {
        return Response.json({ error: 'Artist not found — double-check the link' }, { status: 404 });
      }
      const artist = await safeJson(artistRes);
      if (artist.error) {
        return Response.json({ error: typeof artist.error === 'string' ? artist.error : artist.error.message }, { status: 400 });
      }
      const top = topRes.ok ? await safeJson(topRes) : {};
      const existing = myConns;
      if (!existing[0]) {
        return Response.json({ error: 'Connect your Spotify account first' }, { status: 404 });
      }

      // Spotify strips followers/popularity/genres/top-tracks when the
      // developer app has restricted access (the premium restriction) — only
      // save the numbers that actually came back.
      const artistStats = {
        artist_id: artist.id,
        artist_name: artist.name,
        artist_followers: artist.followers?.total ?? existing[0].stats?.artist_followers ?? 0,
        popularity: artist.popularity ?? existing[0].stats?.popularity ?? 0,
        genres: (artist.genres?.length ? artist.genres : existing[0].stats?.genres) || [],
        top_tracks: (top.tracks || []).slice(0, 5).map(t => ({
          title: t.name,
          popularity: t.popularity,
          album: t.album?.name || null,
          preview_url: t.preview_url || null,
        })),
      };

      const updated = await base44.entities.PlatformConnection.update(existing[0].id, {
        stats: { ...(existing[0].stats || {}), ...artistStats },
        last_synced: new Date().toISOString(),
      });
      const { access_token: _a, refresh_token: _r, ...safeRecord } = updated;
      return Response.json({ success: true, data: safeRecord });
    }

    // ── Save the one artist stat the Spotify API never exposes ────────────────
    if (action === 'save_artist_manual') {
      const { monthly_listeners } = body;
      const existing = await base44.entities.PlatformConnection.filter(
        { created_by_id: user.id, platform: 'spotify' }, '-created_date', 1
      ).catch(() => []);
      if (!existing[0]) {
        return Response.json({ error: 'Connect your Spotify account first' }, { status: 404 });
      }
      const updated = await base44.entities.PlatformConnection.update(existing[0].id, {
        stats: { ...(existing[0].stats || {}), monthly_listeners: Number(monthly_listeners) || 0 },
      });
      const { access_token: _a, refresh_token: _r, ...safeRecord } = updated;
      return Response.json({ success: true, data: safeRecord });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    console.error('spotifyOAuth failed:', error?.stack || error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// Spotify sometimes answers with plain text (e.g. "Active premium
// subscription required") instead of JSON — read it without crashing.
async function safeJson(res) {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { error: text.slice(0, 160) }; }
}

async function fetchSpotifyData(accessToken) {
  const headers = { Authorization: `Bearer ${accessToken}` };

  // Fetch /me and /me/following in parallel
  const [meRes, followingRes] = await Promise.all([
    fetch('https://api.spotify.com/v1/me', { headers }),
    fetch('https://api.spotify.com/v1/me/following?type=artist&limit=1', { headers }),
  ]);

  if (meRes.status === 401) return { error: 'Unauthorized', status: 401 };
  const me = await safeJson(meRes);
  if (me.error) return { error: typeof me.error === 'string' ? me.error : me.error.message };

  // Get artist profile for the authenticated user using their Spotify artist URI if available
  // me endpoint returns user profile, not artist — use search to find artist ID
  let artistStats = {};
  if (me.id) {
    // Search for artist by display name to get the artist endpoint data
    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(me.display_name || me.id)}&type=artist&limit=5`,
      { headers }
    );
    const searchData = await safeJson(searchRes);
    // Try to find the best matching artist
    const artists = searchData.artists?.items || [];
    const exactMatch = artists.find(a => a.name.toLowerCase() === (me.display_name || '').toLowerCase()) || artists[0];

    if (exactMatch) {
      const [artistRes, topTracksRes] = await Promise.all([
        fetch(`https://api.spotify.com/v1/artists/${exactMatch.id}`, { headers }),
        fetch(`https://api.spotify.com/v1/artists/${exactMatch.id}/top-tracks?market=US`, { headers }),
      ]);
      const artistData = await safeJson(artistRes);
      const topTracksData = await safeJson(topTracksRes);

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

  const followingData = followingRes.ok ? await safeJson(followingRes) : {};

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