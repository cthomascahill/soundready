import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Loader2, Music2, TrendingUp, TrendingDown, Minus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

function DeltaBadge({ predicted, live }) {
  const delta = live - predicted;
  if (Math.abs(delta) < 5) return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">
      <Minus className="h-3 w-3" /> On target
    </span>
  );
  if (delta > 0) return (
    <span className="flex items-center gap-1 text-xs text-accent px-2 py-0.5 rounded-full bg-accent/10">
      <TrendingUp className="h-3 w-3" /> +{delta} above prediction
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-xs text-destructive px-2 py-0.5 rounded-full bg-destructive/10">
      <TrendingDown className="h-3 w-3" /> {delta} below prediction
    </span>
  );
}

function ScoreBar({ label, value, color, delay = 0 }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-heading font-bold">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut", delay }}
        />
      </div>
    </div>
  );
}

export default function SpotifyComparison({ analysis }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const lookup = async () => {
    setLoading(true);
    setNotFound(false);
    const res = await base44.functions.invoke("spotifyTrackLookup", {
      title: analysis.title,
      artist: analysis.artist_name,
    });
    if (res.data.found) {
      setData(res.data.track);
    } else {
      setNotFound(true);
    }
    setLoading(false);
  };

  const predicted = analysis.spotify_score || 0;
  const live = data?.popularity || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-2xl bg-card border border-border p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="h-10 w-10 rounded-xl bg-[#1DB954]/10 flex items-center justify-center">
          <Music2 className="h-5 w-5 text-[#1DB954]" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-lg">Live vs. Predicted Score</h3>
          <p className="text-xs text-muted-foreground">Spotify popularity vs. your SoundScore prediction</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!data && !loading && !notFound && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-4">
              Look up this track on Spotify to compare your predicted score against its real-world popularity.
            </p>
            <Button onClick={lookup} variant="outline" className="gap-2">
              <Search className="h-4 w-4" /> Look Up on Spotify
            </Button>
          </motion.div>
        )}

        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="h-5 w-5 text-[#1DB954] animate-spin" />
            <span className="text-sm text-muted-foreground">Searching Spotify...</span>
          </motion.div>
        )}

        {notFound && (
          <motion.div key="notfound" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center py-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              Track not found on Spotify. It may not be released yet or the title/artist may differ.
            </p>
            <Button onClick={lookup} variant="ghost" size="sm" className="gap-2">
              <Search className="h-3.5 w-3.5" /> Try Again
            </Button>
          </motion.div>
        )}

        {data && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            {/* Track info */}
            <div className="flex items-center gap-4 p-3 rounded-xl bg-secondary/50">
              {data.album_art && (
                <img src={data.album_art} alt={data.album} className="h-14 w-14 rounded-lg object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-heading font-semibold truncate">{data.name}</p>
                <p className="text-sm text-muted-foreground truncate">{data.artist} · {data.album}</p>
                <p className="text-xs text-muted-foreground">{data.release_date} · {data.artist_followers?.toLocaleString()} followers</p>
              </div>
              <a href={data.spotify_url} target="_blank" rel="noopener noreferrer"
                className="h-8 w-8 rounded-lg bg-[#1DB954]/10 flex items-center justify-center hover:bg-[#1DB954]/20 transition-colors shrink-0">
                <ExternalLink className="h-3.5 w-3.5 text-[#1DB954]" />
              </a>
            </div>

            {/* Score comparison */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <DeltaBadge predicted={predicted} live={live} />
              </div>
              <ScoreBar label="🎯 Predicted Spotify Score (SoundScore)" value={predicted} color="bg-primary" delay={0.1} />
              <ScoreBar label="📊 Live Spotify Popularity" value={live} color="bg-[#1DB954]" delay={0.3} />
            </div>

            {/* Artist genres */}
            {data.artist_genres?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {data.artist_genres.slice(0, 5).map((g) => (
                  <span key={g} className="px-2 py-0.5 rounded-full bg-[#1DB954]/10 text-[#1DB954] text-xs capitalize">{g}</span>
                ))}
              </div>
            )}

            <Button variant="ghost" size="sm" onClick={lookup} disabled={loading} className="gap-1.5 text-muted-foreground">
              <Search className="h-3.5 w-3.5" /> Re-fetch
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}