import { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCw, Youtube, PlayCircle, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const CACHE_KEY = "soundready_scroll_cache";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatViews(v) {
  if (v === null || v === undefined) return "";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M views`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K views`;
  return `${v} views`;
}

// The Scroll tab: recent long-form music videos, interviews and industry
// podcasts pulled from YouTube — click one to watch it right here.
export default function ScrollTab({ genre }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playing, setPlaying] = useState(null);
  const playerRef = useRef(null);

  const fetchVideos = useCallback(async (force = false) => {
    if (!force) {
      try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
        if (cached && Date.now() - cached.timestamp < CACHE_TTL && cached.genre === (genre || "")) {
          setVideos(cached.videos);
          setLoading(false);
          return;
        }
      } catch {}
    }
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("fetchMusicVideos", { genre: genre || "" });
      setVideos(res.data.videos || []);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          videos: res.data.videos || [], genre: genre || "", timestamp: Date.now(),
        }));
      } catch {}
    } catch (err) {
      setError(err.message || "Failed to load videos");
    } finally {
      setLoading(false);
    }
  }, [genre]);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  const isFramed = typeof window !== "undefined" && window.self !== window.top;

  const openPlayer = (v) => {
    // YouTube blocks embeds inside the builder preview frame (error 153).
    // When framed, just open the video on YouTube in a new tab instead.
    if (isFramed) {
      window.open(`https://www.youtube.com/watch?v=${v.id}`, "_blank");
      return;
    }
    setPlaying(v);
    // Let the iframe mount, then scroll it into view
    setTimeout(() => playerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs text-zinc-500 leading-relaxed">
          Fresh long-form music content from across YouTube — interviews, industry podcasts and artist
          conversations, pulled from the last 28 days. Click any video to watch it here.
        </p>
        <Button variant="outline" size="sm" onClick={() => fetchVideos(true)} disabled={loading}
          className="border-zinc-700 gap-2 shrink-0">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Inline player */}
      {playing && (
        <div ref={playerRef} className="rounded-2xl bg-card border border-primary/30 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border gap-2">
            <p className="text-xs font-semibold text-primary truncate flex-1">{playing.title}</p>
            <a href={`https://www.youtube.com/watch?v=${playing.id}`} target="_blank" rel="noopener noreferrer"
              className="text-xs text-zinc-400 hover:text-primary flex items-center gap-1 shrink-0">
              <Youtube className="h-3.5 w-3.5" /> YouTube
            </a>
            <button onClick={() => setPlaying(null)} className="text-zinc-500 hover:text-foreground shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="aspect-video w-full bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${playing.id}?autoplay=1&rel=0`}
              title={playing.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="rounded-xl bg-card border border-border overflow-hidden animate-pulse">
              <div className="aspect-video bg-zinc-800" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-zinc-800 rounded w-full" />
                <div className="h-3 bg-zinc-800 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="text-center py-16 space-y-4">
          <Youtube className="h-12 w-12 text-zinc-700 mx-auto" />
          <p className="text-zinc-400 text-sm">Couldn't load the scroll feed — try again</p>
          <p className="text-xs text-zinc-600">{error}</p>
          <Button onClick={() => fetchVideos(true)} variant="outline" className="border-zinc-700">Retry</Button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && videos.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <PlayCircle className="h-10 w-10 text-zinc-700 mx-auto" />
          <p className="text-zinc-500 text-sm">No new videos in the last 28 days — check back soon.</p>
        </div>
      )}

      {/* Video grid */}
      {!loading && !error && videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map(v => (
            <button key={v.id} onClick={() => openPlayer(v)}
              className="group rounded-xl bg-card border border-border overflow-hidden text-left hover:border-primary/40 transition-all">
              <div className="relative aspect-video bg-zinc-900">
                {v.thumbnail ? (
                  <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Youtube className="h-8 w-8 text-zinc-700" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <PlayCircle className="h-10 w-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {v.duration && (
                  <span className="absolute bottom-1.5 right-1.5 text-[10px] font-bold bg-black/80 text-white px-1.5 py-0.5 rounded">
                    {v.duration}
                  </span>
                )}
              </div>
              <div className="p-3 space-y-1">
                <p className="text-sm font-medium leading-snug line-clamp-2">{v.title}</p>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <p className="truncate">{v.channel}</p>
                  {v.views !== null && (
                    <span className="flex items-center gap-1 shrink-0">
                      <Eye className="h-3 w-3" /> {formatViews(v.views)}
                    </span>
                  )}
                  <span className="shrink-0">{timeAgo(v.publishedAt)}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}