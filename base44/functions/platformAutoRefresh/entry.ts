import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID');
const CLIENT_SECRET = Deno.env.get('SPOTIFY_CLIENT_SECRET');
const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

    // Get all platform connections older than 23 hours
    const threshold = new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString();
    const allConns = await base44.asServiceRole.entities.PlatformConnection.list('-last_synced', 200).catch(() => []);
    const stale = allConns.filter(c => c.status === 'connected' && (!c.last_synced || c.last_synced < threshold));

    const results = { refreshed: 0, failed: 0, errors: [] };

    for (const conn of stale) {
      if (conn.platform === 'spotify' && conn.connection_type === 'oauth') {
        const result = await refreshSpotify(base44, conn);
        if (result.success) results.refreshed++;
        else { results.failed++; results.errors.push(`Spotify ${conn.id}: ${result.error}`); }
      }

      if (conn.platform === 'youtube' && conn.raw_channel_id) {
        const result = await refreshYouTube(base44, conn);
        if (result.success) results.refreshed++;
        else { results.failed++; results.errors.push(`YouTube ${conn.id}: ${result.error}`); }
      }
    }

    return Response.json({ success: true, stale_found: stale.length, ...results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function refreshSpotify(base44, conn) {
  if (!conn.refresh_token) {
    await base44.asServiceRole.entities.PlatformConnection.update(conn.id, { status: 'disconnected', access_token: null, refresh_token: null });
    return { success: false, error: 'No refresh token' };
  }

  const refreshRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET),
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: conn.refresh_token }),
  });
  const refreshData = await refreshRes.json();
  if (!refreshData.access_token) {
    await base44.asServiceRole.entities.PlatformConnection.update(conn.id, { status: 'disconnected', access_token: null, refresh_token: null });
    return { success: false, error: 'Refresh failed: ' + (refreshData.error || 'unknown') };
  }

  const accessToken = refreshData.access_token;
  const headers = { Authorization: `Bearer ${accessToken}` };
  const meRes = await fetch('https://api.spotify.com/v1/me', { headers });
  if (!meRes.ok) {
    await base44.asServiceRole.entities.PlatformConnection.update(conn.id, { status: 'disconnected', access_token: null, refresh_token: null });
    return { success: false, error: 'Spotify API 401' };
  }
  const me = await meRes.json();

  let artistStats = { followers: me.followers?.total || 0 };
  if (me.display_name) {
    const searchRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(me.display_name)}&type=artist&limit=5`, { headers });
    const searchData = await searchRes.json();
    const artists = searchData.artists?.items || [];
    const match = artists.find(a => a.name.toLowerCase() === me.display_name.toLowerCase()) || artists[0];
    if (match) {
      const [artistRes, ttRes] = await Promise.all([
        fetch(`https://api.spotify.com/v1/artists/${match.id}`, { headers }),
        fetch(`https://api.spotify.com/v1/artists/${match.id}/top-tracks?market=US`, { headers }),
      ]);
      const artistData = await artistRes.json();
      const ttData = await ttRes.json();
      artistStats = {
        ...artistStats,
        artist_id: match.id,
        popularity: artistData.popularity || 0,
        genres: artistData.genres || [],
        top_tracks: (ttData.tracks || []).slice(0, 5).map(t => ({ title: t.name, popularity: t.popularity, album: t.album?.name || null })),
      };
    }
  }

  await base44.asServiceRole.entities.PlatformConnection.update(conn.id, {
    access_token: accessToken,
    token_expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
    ...(refreshData.refresh_token ? { refresh_token: refreshData.refresh_token } : {}),
    display_name: me.display_name,
    profile_image_url: me.images?.[0]?.url || conn.profile_image_url,
    last_synced: new Date().toISOString(),
    stats: artistStats,
  });

  return { success: true };
}

async function refreshYouTube(base44, conn) {
  if (!YOUTUBE_API_KEY) return { success: false, error: 'No API key' };
  const channelId = conn.raw_channel_id;

  const channelRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`);
  const channelData = await channelRes.json();
  const channel = channelData.items?.[0];
  if (!channel) return { success: false, error: 'Channel not found' };

  const stats = {
    subscribers: parseInt(channel.statistics.subscriberCount || 0),
    total_views: parseInt(channel.statistics.viewCount || 0),
    video_count: parseInt(channel.statistics.videoCount || 0),
  };

  const [topRes, recentRes] = await Promise.all([
    fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=viewCount&maxResults=5&type=video&key=${YOUTUBE_API_KEY}`),
    fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&maxResults=3&type=video&key=${YOUTUBE_API_KEY}`),
  ]);
  const [topData, recentData] = await Promise.all([topRes.json(), recentRes.json()]);

  const topIds = (topData.items || []).map(v => v.id?.videoId).filter(Boolean).join(',');
  const recentIds = (recentData.items || []).map(v => v.id?.videoId).filter(Boolean).join(',');
  const allIds = [...new Set([...topIds.split(','), ...recentIds.split(',')].filter(Boolean))].join(',');

  if (allIds) {
    const allStatsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${allIds}&key=${YOUTUBE_API_KEY}`);
    const allStatsData = await allStatsRes.json();
    const byId = {};
    (allStatsData.items || []).forEach(v => { byId[v.id] = v; });
    stats.top_tracks = topIds.split(',').filter(Boolean).map(id => {
      const v = byId[id];
      return v ? { title: v.snippet.title, views: parseInt(v.statistics.viewCount || 0), url: `https://youtube.com/watch?v=${id}` } : null;
    }).filter(Boolean);
    stats.recent_posts = recentIds.split(',').filter(Boolean).map(id => {
      const v = byId[id];
      return v ? { title: v.snippet.title, views: parseInt(v.statistics.viewCount || 0), published_at: v.snippet.publishedAt, url: `https://youtube.com/watch?v=${id}` } : null;
    }).filter(Boolean);
  }

  await base44.asServiceRole.entities.PlatformConnection.update(conn.id, {
    stats,
    last_synced: new Date().toISOString(),
    display_name: channel.snippet.title,
  });

  return { success: true };
}