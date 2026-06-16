import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { platform, profile_url, manual_stats, connection_id } = body;

    if (!platform) return Response.json({ error: 'platform required' }, { status: 400 });

    // ── YouTube URL sync ──────────────────────────────────────────────────────
    if (platform === 'youtube') {
      if (!profile_url) return Response.json({ error: 'profile_url required for YouTube' }, { status: 400 });

      const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
      if (!YOUTUBE_API_KEY) return Response.json({ error: 'YouTube API key not configured' }, { status: 500 });

      // Extract channel ID or handle from URL
      let channelId = null;
      let handle = null;

      const ucMatch = profile_url.match(/youtube\.com\/channel\/(UC[\w-]+)/);
      const atMatch = profile_url.match(/youtube\.com\/@([\w.]+)/);
      const userMatch = profile_url.match(/youtube\.com\/user\/([\w.]+)/);

      if (ucMatch) {
        channelId = ucMatch[1];
      } else if (atMatch) {
        handle = atMatch[1];
      } else if (userMatch) {
        handle = userMatch[1];
      }

      // Resolve handle to channel ID
      if (!channelId && handle) {
        const searchRes = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&forHandle=${handle}&key=${YOUTUBE_API_KEY}`
        );
        const searchData = await searchRes.json();
        if (searchData.items?.length > 0) {
          channelId = searchData.items[0].id;
        }
      }

      if (!channelId) {
        return Response.json({ error: 'Could not resolve YouTube channel from URL' }, { status: 400 });
      }

      const channelRes = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`
      );
      const channelData = await channelRes.json();
      const channel = channelData.items?.[0];
      if (!channel) return Response.json({ error: 'YouTube channel not found' }, { status: 404 });

      const stats = {
        subscribers: parseInt(channel.statistics.subscriberCount || 0),
        total_views: parseInt(channel.statistics.viewCount || 0),
        video_count: parseInt(channel.statistics.videoCount || 0),
      };

      // Get top 5 videos
      const videosRes = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=viewCount&maxResults=5&type=video&key=${YOUTUBE_API_KEY}`
      );
      const videosData = await videosRes.json();
      const videoIds = videosData.items?.map(v => v.id?.videoId).filter(Boolean).join(',');

      if (videoIds) {
        const videoStatsRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
        );
        const videoStatsData = await videoStatsRes.json();
        stats.top_tracks = videoStatsData.items?.map(v => ({
          title: v.snippet.title,
          views: parseInt(v.statistics.viewCount || 0),
          likes: parseInt(v.statistics.likeCount || 0),
          url: `https://youtube.com/watch?v=${v.id}`,
          thumbnail: v.snippet.thumbnails?.medium?.url,
        })) || [];
      }

      const existing = await base44.entities.PlatformConnection.filter(
        { created_by_id: user.id, platform: 'youtube' }, '-created_date', 1
      ).catch(() => []);

      const record = {
        platform: 'youtube',
        connection_type: 'url',
        status: 'connected',
        profile_url,
        display_name: channel.snippet.title,
        profile_image_url: channel.snippet.thumbnails?.medium?.url,
        raw_channel_id: channelId,
        last_synced: new Date().toISOString(),
        stats,
      };

      let saved;
      if (existing.length > 0) {
        saved = await base44.entities.PlatformConnection.update(existing[0].id, record);
      } else {
        saved = await base44.entities.PlatformConnection.create(record);
      }

      return Response.json({ success: true, data: saved });
    }

    // ── Spotify OAuth token exchange ──────────────────────────────────────────
    if (platform === 'spotify_exchange') {
      const { code, redirect_uri } = body;
      if (!code || !redirect_uri) return Response.json({ error: 'code and redirect_uri required' }, { status: 400 });

      const CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID');
      const CLIENT_SECRET = Deno.env.get('SPOTIFY_CLIENT_SECRET');

      const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`),
        },
        body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        return Response.json({ error: tokenData.error_description || 'Token exchange failed' }, { status: 400 });
      }

      const profileRes = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const profileData = await profileRes.json();

      const topTracksRes = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=5&time_range=medium_term', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const topTracksData = await topTracksRes.json();

      const stats = {
        followers: profileData.followers?.total || 0,
        monthly_listeners: profileData.monthly_listeners || null,
        top_tracks: topTracksData.items?.map(t => ({
          title: t.name,
          artist: t.artists?.[0]?.name,
          popularity: t.popularity,
          spotify_id: t.id,
          preview_url: t.preview_url,
          album_art: t.album?.images?.[0]?.url,
        })) || [],
        top_markets: [],
      };

      const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

      const existing = await base44.entities.PlatformConnection.filter(
        { created_by_id: user.id, platform: 'spotify' }, '-created_date', 1
      ).catch(() => []);

      const record = {
        platform: 'spotify',
        connection_type: 'oauth',
        status: 'connected',
        display_name: profileData.display_name,
        profile_image_url: profileData.images?.[0]?.url,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: expiresAt,
        last_synced: new Date().toISOString(),
        stats,
      };

      let saved;
      if (existing.length > 0) {
        saved = await base44.entities.PlatformConnection.update(existing[0].id, record);
      } else {
        saved = await base44.entities.PlatformConnection.create(record);
      }

      return Response.json({ success: true, data: saved });
    }

    // ── Spotify refresh using stored token ─────────────────────────────────────
    if (platform === 'spotify_refresh') {
      if (!connection_id) return Response.json({ error: 'connection_id required' }, { status: 400 });
      const CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID');
      const CLIENT_SECRET = Deno.env.get('SPOTIFY_CLIENT_SECRET');

      const connections = await base44.entities.PlatformConnection.filter(
        { created_by_id: user.id, platform: 'spotify' }, '-created_date', 1
      );
      if (!connections.length) return Response.json({ error: 'No Spotify connection found' }, { status: 404 });
      const conn = connections[0];
      if (!conn.refresh_token) return Response.json({ error: 'No refresh token stored' }, { status: 400 });

      const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`),
        },
        body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: conn.refresh_token }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) return Response.json({ error: 'Refresh failed' }, { status: 400 });

      const accessToken = tokenData.access_token;
      const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

      const profileRes = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const profileData = await profileRes.json();

      const topTracksRes = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=5&time_range=medium_term', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const topTracksData = await topTracksRes.json();

      const updatedStats = {
        ...conn.stats,
        followers: profileData.followers?.total || conn.stats?.followers || 0,
        top_tracks: topTracksData.items?.map(t => ({
          title: t.name,
          artist: t.artists?.[0]?.name,
          popularity: t.popularity,
          spotify_id: t.id,
          album_art: t.album?.images?.[0]?.url,
        })) || conn.stats?.top_tracks || [],
      };

      const updated = await base44.entities.PlatformConnection.update(conn.id, {
        access_token: accessToken,
        token_expires_at: expiresAt,
        refresh_token: tokenData.refresh_token || conn.refresh_token,
        last_synced: new Date().toISOString(),
        stats: updatedStats,
      });

      return Response.json({ success: true, data: updated });
    }

    // ── Manual stats save (TikTok, Apple Music, Self-reported) ──────────────
    if (platform === 'manual') {
      const { sub_platform } = body;
      if (!sub_platform) return Response.json({ error: 'sub_platform required for manual' }, { status: 400 });

      const existing = await base44.entities.PlatformConnection.filter(
        { created_by_id: user.id, platform: sub_platform }, '-created_date', 1
      ).catch(() => []);

      const record = {
        platform: sub_platform,
        connection_type: 'manual',
        status: 'connected',
        last_synced: new Date().toISOString(),
        stats: manual_stats || {},
      };

      let saved;
      if (existing.length > 0) {
        saved = await base44.entities.PlatformConnection.update(existing[0].id, record);
      } else {
        saved = await base44.entities.PlatformConnection.create(record);
      }

      return Response.json({ success: true, data: saved });
    }

    return Response.json({ error: 'Unknown platform' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});