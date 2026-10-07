const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");

// Curated searches: long-form music-industry content artists should be watching.
const BASE_QUERIES = [
  '"DJ Akademiks" interview',
  '"The Manager\'s Playbook"',
  '"Million Dollaz Worth of Game" rapper',
  '"Breakfast Club" artist interview',
  'hip hop interview',
  'music industry advice',
];

// Music-culture shows: their artist/industry content stays in.
const KNOWN_MUSIC_CHANNELS = /breakfast club|akademiks|million dollaz|manager's playbook|no jumper|drink champs|rap radar|math hoffman|ebro|big facts/i;
// Anything else has to be clearly about music.
const MUSIC_WORDS = /music|song|album|artist|rap(per)?\b|hip ?hop|producer|dj\b|record label|streaming|spotify|billboard|grammy|singer|rapper|tour|beat|r&b|interview/i;
// Hard off-topic: sports, comedy, movies — even on music channels.
const OFF_TOPIC = /nba|nfl|football|basketball|boxing|ufc|comedy|comedian|chris rock|kevin hart|movie|film|actor|actress|trailer/i;

function isMusicVideo(v) {
  if (OFF_TOPIC.test(v.title)) return false;
  if (KNOWN_MUSIC_CHANNELS.test(v.channel)) return true;
  return MUSIC_WORDS.test(v.title);
}

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

    const publishedAfter = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString();

    // Search each query in parallel — order by viewCount so the biggest
    // videos of the window come back, not just the newest uploads.
    const searchYouTube = async (q) => {
      const url = new URL("https://www.googleapis.com/youtube/v3/search");
      url.searchParams.set("part", "snippet");
      url.searchParams.set("type", "video");
      url.searchParams.set("q", q);
      url.searchParams.set("order", "viewCount");
      url.searchParams.set("maxResults", "15");
      url.searchParams.set("publishedAfter", publishedAfter);
      url.searchParams.set("key", YOUTUBE_API_KEY);
      // One retry: googleapis occasionally returns a 5xx/timeout that must
      // not take the whole refresh down with it.
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const res = await fetch(url.toString());
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          return data.error ? [] : data.items || [];
        } catch (e) {
          if (attempt === 0) await new Promise(r => setTimeout(r, 500));
          else console.log(`search failed for "${q}": ${e?.message || e}`);
        }
      }
      return [];
    };

    const searchResults = await Promise.all(queries.map(searchYouTube));

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
    let statsData = { items: [] };
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const statsRes = await fetch(statsUrl);
        if (!statsRes.ok) throw new Error(`HTTP ${statsRes.status}`);
        statsData = await statsRes.json();
        break;
      } catch (e) {
        if (attempt === 0) await new Promise(r => setTimeout(r, 500));
        else console.log(`stats lookup failed: ${e?.message || e}`);
      }
    }

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
      .filter(v => v.longForm && isMusicVideo(v))
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 36);

    console.log(`fetchMusicVideos: ${videos.length} videos across ${queries.length} queries`);

    return Response.json({ videos, lastUpdated: new Date().toISOString() });
  } catch (err) {
    console.error("fetchMusicVideos error:", err?.message || err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});