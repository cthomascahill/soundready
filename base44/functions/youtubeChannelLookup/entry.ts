import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const YT_KEY = Deno.env.get("YOUTUBE_API_KEY");

async function searchChannel(artistName) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(artistName)}&maxResults=3&key=${YT_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.items?.[0]?.id?.channelId || null;
}

async function getChannelStats(channelId) {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${channelId}&key=${YT_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const ch = data.items?.[0];
  if (!ch) return null;
  return {
    channel_id: channelId,
    channel_title: ch.snippet.title,
    description: ch.snippet.description,
    thumbnail: ch.snippet.thumbnails?.default?.url,
    subscriber_count: parseInt(ch.statistics.subscriberCount || 0),
    view_count: parseInt(ch.statistics.viewCount || 0),
    video_count: parseInt(ch.statistics.videoCount || 0),
  };
}

async function getTopVideos(channelId, songTitle) {
  // Search videos by artist channel filtered by song title
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&q=${encodeURIComponent(songTitle)}&type=video&maxResults=3&order=viewCount&key=${YT_KEY}`;
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();
  const videoIds = (searchData.items || []).map((v) => v.id.videoId).filter(Boolean);

  if (videoIds.length === 0) {
    // Fallback: get top channel videos
    const fallbackUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&maxResults=5&order=viewCount&key=${YT_KEY}`;
    const fallbackRes = await fetch(fallbackUrl);
    const fallbackData = await fallbackRes.json();
    videoIds.push(...(fallbackData.items || []).map((v) => v.id.videoId).filter(Boolean).slice(0, 5));
  }

  if (videoIds.length === 0) return [];

  const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds.join(",")}&key=${YT_KEY}`;
  const statsRes = await fetch(statsUrl);
  const statsData = await statsRes.json();

  return (statsData.items || []).map((v) => ({
    video_id: v.id,
    title: v.snippet.title,
    thumbnail: v.snippet.thumbnails?.medium?.url,
    published_at: v.snippet.publishedAt,
    view_count: parseInt(v.statistics.viewCount || 0),
    like_count: parseInt(v.statistics.likeCount || 0),
    comment_count: parseInt(v.statistics.commentCount || 0),
    url: `https://www.youtube.com/watch?v=${v.id}`,
  }));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { artist, song_title } = await req.json();
    if (!artist) return Response.json({ error: "artist is required" }, { status: 400 });

    const channelId = await searchChannel(artist);
    if (!channelId) return Response.json({ found: false });

    const [channelStats, videos] = await Promise.all([
      getChannelStats(channelId),
      getTopVideos(channelId, song_title || ""),
    ]);

    return Response.json({ found: true, channel: channelStats, videos });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});