import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { platform, profile_url, manual_stats, display_name } = body;

    // ── YouTube Sync Now (using stored channel ID) ────────────────────────────
    if (platform === 'youtube_refresh') {
      const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
      if (!YOUTUBE_API_KEY) return Response.json({ error: 'YouTube API key not configured' }, { status: 500 });

      const existing = await base44.entities.PlatformConnection.filter(
        { created_by_id: user.id, platform: 'youtube' }, '-created_date', 1
      ).catch(() => []);
      if (!existing[0]) return Response.json({ error: 'No YouTube connection found' }, { status: 404 });
      const channelId = existing[0].raw_channel_id;
      if (!channelId) return Response.json({ error: 'No channel ID stored' }, { status: 400 });

      const channelRes = await fetch(
        'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=' + channelId + '&key=' + YOUTUBE_API_KEY
      );
      const channelData = await channelRes.json();
      const channel = channelData.items ? channelData.items[0] : null;
      if (!channel) return Response.json({ error: 'YouTube channel not found' }, { status: 404 });

      const stats = {
        subscribers: parseInt(channel.statistics.subscriberCount || 0),
        total_views: parseInt(channel.statistics.viewCount || 0),
        video_count: parseInt(channel.statistics.videoCount || 0),
      };

      const [topRes, recentRes] = await Promise.all([
        fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=' + channelId + '&order=viewCount&maxResults=5&type=video&key=' + YOUTUBE_API_KEY),
        fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=' + channelId + '&order=date&maxResults=3&type=video&key=' + YOUTUBE_API_KEY),
      ]);
      const [topData, recentData] = await Promise.all([topRes.json(), recentRes.json()]);

      const topIds = (topData.items || []).map(v => v.id?.videoId).filter(Boolean).join(',');
      const recentIds = (recentData.items || []).map(v => v.id?.videoId).filter(Boolean).join(',');
      const allIds = [...new Set([...topIds.split(','), ...recentIds.split(',')].filter(Boolean))].join(',');

      if (allIds) {
        const allStatsRes = await fetch('https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=' + allIds + '&key=' + YOUTUBE_API_KEY);
        const allStatsData = await allStatsRes.json();
        const byId = {};
        (allStatsData.items || []).forEach(v => { byId[v.id] = v; });
        stats.top_tracks = topIds.split(',').filter(Boolean).map(id => {
          const v = byId[id];
          return v ? { title: v.snippet.title, views: parseInt(v.statistics.viewCount || 0), likes: parseInt(v.statistics.likeCount || 0), url: 'https://youtube.com/watch?v=' + id } : null;
        }).filter(Boolean);
        stats.recent_posts = recentIds.split(',').filter(Boolean).map(id => {
          const v = byId[id];
          return v ? { title: v.snippet.title, views: parseInt(v.statistics.viewCount || 0), published_at: v.snippet.publishedAt, url: 'https://youtube.com/watch?v=' + id } : null;
        }).filter(Boolean);
      }

      const updated = await base44.entities.PlatformConnection.update(existing[0].id, {
        stats,
        last_synced: new Date().toISOString(),
        display_name: channel.snippet.title,
      });
      return Response.json({ success: true, data: updated });
    }

    // ── YouTube Disconnect ────────────────────────────────────────────────────
    if (platform === 'youtube_disconnect') {
      const existing = await base44.entities.PlatformConnection.filter(
        { created_by_id: user.id, platform: 'youtube' }, '-created_date', 1
      ).catch(() => []);
      if (existing[0]) {
        await base44.entities.PlatformConnection.update(existing[0].id, {
          status: 'disconnected', raw_channel_id: null, stats: null, display_name: null, profile_url: null,
        });
      }
      return Response.json({ success: true });
    }

    if (!platform) return Response.json({ error: 'platform required' }, { status: 400 });

    // ── Spotify via Client Credentials API ───────────────────────────────────
    if (platform === 'spotify') {
      if (!profile_url) return Response.json({ error: 'profile_url required' }, { status: 400 });

      const CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID');
      const CLIENT_SECRET = Deno.env.get('SPOTIFY_CLIENT_SECRET');
      if (!CLIENT_ID || !CLIENT_SECRET) {
        return Response.json({ error: 'Spotify credentials not configured' }, { status: 500 });
      }

      // Step 1: Get access token via client credentials
      const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET),
        },
        body: 'grant_type=client_credentials',
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        return Response.json({ error: 'Spotify token error: ' + (tokenData.error_description || tokenData.error || 'unknown') }, { status: 500 });
      }

      const token = tokenData.access_token;

      // Step 2: Extract artist ID from URL
      const artistMatch = profile_url.match(/spotify\.com(?:\/intl-[a-z]+)?\/artist\/([A-Za-z0-9]+)/);
      if (!artistMatch) {
        return Response.json({ error: 'Invalid Spotify URL. Use: open.spotify.com/artist/...' }, { status: 400 });
      }
      const artistId = artistMatch[1];

      // Step 3: Fetch artist data + top tracks in parallel
      const [artistRes, topTracksRes] = await Promise.all([
        fetch('https://api.spotify.com/v1/artists/' + artistId, {
          headers: { Authorization: 'Bearer ' + token },
        }),
        fetch('https://api.spotify.com/v1/artists/' + artistId + '/top-tracks?market=US', {
          headers: { Authorization: 'Bearer ' + token },
        }),
      ]);

      const artistData = await artistRes.json();
      const topTracksData = await topTracksRes.json();

      if (artistData.error) {
        return Response.json({ error: 'Spotify API: ' + artistData.error.message }, { status: 400 });
      }

      const stats = {
        followers: artistData.followers ? artistData.followers.total : 0,
        monthly_listeners: null, // Not available via API — must be entered manually
        popularity: artistData.popularity || 0,
        genres: artistData.genres || [],
        top_tracks: (topTracksData.tracks || []).slice(0, 5).map(function(t) {
          return {
            title: t.name,
            popularity: t.popularity,
            album: t.album ? t.album.name : null,
          };
        }),
      };

      const existing = await base44.entities.PlatformConnection.filter(
        { created_by_id: user.id, platform: 'spotify' }, '-created_date', 1
      ).catch(() => []);

      const record = {
        platform: 'spotify',
        connection_type: 'url',
        status: 'connected',
        profile_url: profile_url,
        display_name: artistData.name || null,
        profile_image_url: (artistData.images && artistData.images[0]) ? artistData.images[0].url : null,
        raw_channel_id: artistId,
        last_synced: new Date().toISOString(),
        stats: stats,
      };

      let saved;
      if (existing.length > 0) {
        saved = await base44.entities.PlatformConnection.update(existing[0].id, record);
      } else {
        saved = await base44.entities.PlatformConnection.create(record);
      }

      return Response.json({ success: true, data: saved });
    }

    // ── YouTube via Data API ──────────────────────────────────────────────────
    if (platform === 'youtube') {
      if (!profile_url) return Response.json({ error: 'profile_url required' }, { status: 400 });

      const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
      if (!YOUTUBE_API_KEY) return Response.json({ error: 'YouTube API key not configured' }, { status: 500 });

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

      if (!channelId && handle) {
        const searchRes = await fetch(
          'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&forHandle=' + handle + '&key=' + YOUTUBE_API_KEY
        );
        const searchData = await searchRes.json();
        if (searchData.items && searchData.items.length > 0) {
          channelId = searchData.items[0].id;
        }
      }

      if (!channelId) {
        return Response.json({ error: 'Could not resolve YouTube channel from URL' }, { status: 400 });
      }

      const channelRes = await fetch(
        'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=' + channelId + '&key=' + YOUTUBE_API_KEY
      );
      const channelData = await channelRes.json();
      const channel = channelData.items ? channelData.items[0] : null;
      if (!channel) return Response.json({ error: 'YouTube channel not found' }, { status: 404 });

      const stats = {
        subscribers: parseInt(channel.statistics.subscriberCount || 0),
        total_views: parseInt(channel.statistics.viewCount || 0),
        video_count: parseInt(channel.statistics.videoCount || 0),
      };

      const videosRes = await fetch(
        'https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=' + channelId + '&order=viewCount&maxResults=5&type=video&key=' + YOUTUBE_API_KEY
      );
      const videosData = await videosRes.json();
      const videoIds = videosData.items ? videosData.items.map(function(v) { return v.id && v.id.videoId; }).filter(Boolean).join(',') : '';

      if (videoIds) {
        const videoStatsRes = await fetch(
          'https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=' + videoIds + '&key=' + YOUTUBE_API_KEY
        );
        const videoStatsData = await videoStatsRes.json();
        stats.top_tracks = videoStatsData.items ? videoStatsData.items.map(function(v) {
          return {
            title: v.snippet.title,
            views: parseInt(v.statistics.viewCount || 0),
            likes: parseInt(v.statistics.likeCount || 0),
            url: 'https://youtube.com/watch?v=' + v.id,
          };
        }) : [];
      }

      // Fetch 3 most recent uploads
      const recentRes = await fetch(
        'https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=' + channelId + '&order=date&maxResults=3&type=video&key=' + YOUTUBE_API_KEY
      );
      const recentData = await recentRes.json();
      const recentIds = recentData.items ? recentData.items.map(function(v) { return v.id && v.id.videoId; }).filter(Boolean).join(',') : '';
      if (recentIds) {
        const recentStatsRes = await fetch(
          'https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=' + recentIds + '&key=' + YOUTUBE_API_KEY
        );
        const recentStatsData = await recentStatsRes.json();
        stats.recent_posts = recentStatsData.items ? recentStatsData.items.map(function(v) {
          return {
            title: v.snippet.title,
            views: parseInt(v.statistics.viewCount || 0),
            published_at: v.snippet.publishedAt,
            url: 'https://youtube.com/watch?v=' + v.id,
          };
        }) : [];
      }

      const existing = await base44.entities.PlatformConnection.filter(
        { created_by_id: user.id, platform: 'youtube' }, '-created_date', 1
      ).catch(() => []);

      const record = {
        platform: 'youtube',
        connection_type: 'url',
        status: 'connected',
        profile_url: profile_url,
        display_name: channel.snippet.title,
        profile_image_url: channel.snippet.thumbnails && channel.snippet.thumbnails.medium ? channel.snippet.thumbnails.medium.url : null,
        raw_channel_id: channelId,
        last_synced: new Date().toISOString(),
        stats: stats,
      };

      let saved;
      if (existing.length > 0) {
        saved = await base44.entities.PlatformConnection.update(existing[0].id, record);
      } else {
        saved = await base44.entities.PlatformConnection.create(record);
      }

      return Response.json({ success: true, data: saved });
    }

    // ── Manual stats (TikTok, Apple Music, Self-reported) ────────────────────
    if (platform === 'manual') {
      const { sub_platform } = body;
      if (!sub_platform) return Response.json({ error: 'sub_platform required' }, { status: 400 });

      const existing = await base44.entities.PlatformConnection.filter(
        { created_by_id: user.id, platform: sub_platform }, '-created_date', 1
      ).catch(() => []);

      const { spotify_artist_id, profile_url: manualProfileUrl, ...cleanStats } = manual_stats || {};
      const record = {
        platform: sub_platform,
        connection_type: 'manual',
        status: 'connected',
        last_synced: new Date().toISOString(),
        stats: cleanStats,
      };
      if (display_name) record.display_name = display_name;
      if (manualProfileUrl) record.profile_url = manualProfileUrl;
      if (spotify_artist_id) record.raw_channel_id = spotify_artist_id;

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