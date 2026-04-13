import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SPOTIFY_CLIENT_ID = Deno.env.get("SPOTIFY_CLIENT_ID");
const SPOTIFY_CLIENT_SECRET = Deno.env.get("SPOTIFY_CLIENT_SECRET");
const YT_KEY = Deno.env.get("YOUTUBE_API_KEY");

async function getSpotifyToken() {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`,
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  return data.access_token;
}

async function searchSpotifyArtist(name, token) {
  const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(name)}&type=artist&limit=1`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.artists?.items?.[0] || null;
}

async function getSpotifyArtistById(id, token) {
  const res = await fetch(`https://api.spotify.com/v1/artists/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
}

async function searchYouTubeChannel(name) {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(name)}&maxResults=1&key=${YT_KEY}`
  );
  const data = await res.json();
  return data.items?.[0]?.id?.channelId || null;
}

async function getYouTubeChannelStats(channelId) {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${YT_KEY}`
  );
  const data = await res.json();
  const stats = data.items?.[0]?.statistics;
  if (!stats) return null;
  return {
    subscribers: parseInt(stats.subscriberCount || 0),
    views: parseInt(stats.viewCount || 0),
    video_count: parseInt(stats.videoCount || 0),
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    // Get all competitors for this user
    const competitors = await base44.entities.CompetitorArtist.filter({ created_by: user.email });
    if (competitors.length === 0) return Response.json({ updated: 0 });

    const token = await getSpotifyToken();
    const today = new Date().toISOString().slice(0, 10);
    let updated = 0;

    for (const competitor of competitors) {
      let spotifyData = null;
      let ytData = null;

      // Spotify
      if (competitor.spotify_artist_id) {
        spotifyData = await getSpotifyArtistById(competitor.spotify_artist_id, token);
      } else {
        spotifyData = await searchSpotifyArtist(competitor.name, token);
        // Save the found ID back so future fetches are faster
        if (spotifyData?.id) {
          await base44.entities.CompetitorArtist.update(competitor.id, { spotify_artist_id: spotifyData.id });
        }
      }

      // YouTube
      let ytChannelId = competitor.youtube_channel_id;
      if (!ytChannelId) {
        ytChannelId = await searchYouTubeChannel(competitor.name);
        if (ytChannelId) {
          await base44.entities.CompetitorArtist.update(competitor.id, { youtube_channel_id: ytChannelId });
        }
      }
      if (ytChannelId) {
        ytData = await getYouTubeChannelStats(ytChannelId);
      }

      await base44.entities.CompetitorSnapshot.create({
        competitor_id: competitor.id,
        competitor_name: competitor.name,
        snapshot_date: today,
        spotify_popularity: spotifyData?.popularity || 0,
        spotify_followers: spotifyData?.followers?.total || 0,
        yt_subscribers: ytData?.subscribers || 0,
        yt_views: ytData?.views || 0,
        yt_video_count: ytData?.video_count || 0,
      });
      updated++;
    }

    return Response.json({ updated, date: today });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});