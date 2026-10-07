const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");

// Curated searches: long-form music-industry content artists should be watching.
const BASE_QUERIES = [
  '"DJ Akademiks" interview',
  '"The Manager\'s Playbook"',
  '"Million Dollaz Worth of Game"',
  '"Breakfast Club" interview',
  'music industry podcast',
  'music news interview',
];

// ISO-8601 duration (PT1H2M3S) -> "1:02:03"
function formatDuration(iso) {
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso || "");
  if (!m) return "";
  const h = Number(m[1] || 0), min = Number(m[2] || 0), s = Number(m[3] || 0);
  if (!h && !min && !s) return "";
  return h > 0
    ? `${h}:${String(min).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${min}:${String(s).padStart(2, "0")}`;
}

Deno.serve(async (req) => {
  try {
    if (!YOUTUBE_API_KEY) {
      return Response.json({ error: "YOUTUBE_API_KEY not set" }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const { genre } = body;

    const queries = [...BASE_QUERIES];
    if (genre) queries.push(`"${genre} music" interview`);

    const publishedAfter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Search each query in parallel
    const searchResults = await Promise.all(queries.map(async (q) => {
      const url = new URL("https://www.googleapis.com/youtube/v3/search");
      url.searchParams.set("part", "snippet");
      url.searchParams.set("type", "video");
      url.searchParams.set("q", q);
      url.searchParams.set("order", "date");
      url.searchParams.set("maxResults", "10");
      url.searchParams.set("publishedAfter", publishedAfter);
      url.searchParams.set("key", YOUTUBE_API_KEY);
      const res = await fetch(url.toString());
      const data = await res.json();
      return data.error ? [] : data.items || [];
    }));

    // Merge + dedupe by video id
    const seen = new Set();
    const merged = searchResults.flat().filter(item => {
      const id = item.id?.videoId;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    if (merged.length === 0) {
      return Response.json({ videos: [], lastUpdated: new Date().toISOString() });
    }

    // Pull stats + durations in one batched call
    const ids = merged.map(i => i.id.videoId).slice(0, 50).join(",");
    const statsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    statsUrl.searchParams.set("part", "snippet,statistics,contentDetails");
    statsUrl.searchParams.set("id", ids);
    statsUrl.searchParams.set("key", YOUTUBE_API_KEY);
    const statsRes = await fetch(statsUrl);
    const statsData = await statsRes.json();

    const byId = new Map((statsData.items || []).map(v => [v.id, v]));

    const videos = merged
      .map(item => {
        const id = item.id.videoId;
        const stats = byId.get(id);
        const duration = formatDuration(stats?.contentDetails?.duration);
        // Keep long-form content; skip shorts and sub-minute clips
        const match = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(stats?.contentDetails?.duration || "");
        const secs = (Number(match?.[1] || 0)) * 3600 + (Number(match?.[2] || 0)) * 60 + Number(match?.[3] || 0);
        return {
          id,
          title: item.snippet.title,
          description: (item.snippet.description || "").slice(0, 200),
          channel: stats?.snippet?.channelTitle || item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || null,
          views: stats ? Number(stats.statistics?.viewCount || 0) : null,
          duration,
          longForm: secs >= 60,
        };
      })
      .filter(v => v.longForm)
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, 36);

    console.log(`fetchMusicVideos: ${videos.length} videos across ${queries.length} queries`);

    return Response.json({ videos, lastUpdated: new Date().toISOString() });
  } catch (err) {
    console.error("fetchMusicVideos error:", err?.message || err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});