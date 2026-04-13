import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink, Loader2, Music2, TrendingUp, TrendingDown,
  Minus, Search, Users, Star, Sparkles, ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";

function getDeltaInfo(predicted, live) {
  const delta = live - predicted;
  const abs = Math.abs(delta);
  if (abs < 5) return { label: "On target", color: "text-muted-foreground", bg: "bg-secondary", icon: Minus, delta };
  if (delta > 0) return { label: `+${delta} above prediction`, color: "text-accent", bg: "bg-accent/10", icon: TrendingUp, delta };
  return { label: `${delta} below prediction`, color: "text-destructive", bg: "bg-destructive/10", icon: TrendingDown, delta };
}

function ScoreBar({ label, value, colorClass, delay = 0 }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-heading font-bold">{value}</span>
      </div>
      <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${colorClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.1, ease: "easeOut", delay }}
        />
      </div>
    </div>
  );
}

function StatPill({ label, value, sub }) {
  return (
    <div className="rounded-xl bg-secondary/60 border border-border p-3 text-center">
      <p className="font-heading font-bold text-lg">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {sub && <p className="text-[10px] text-muted-foreground/60 mt-0.5">{sub}</p>}
    </div>
  );
}

function InsightPanel({ analysis, track }) {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const delta = track.popularity - (analysis.spotify_score || 0);

  const generate = async () => {
    setLoading(true);
    setOpen(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a music industry analyst. Analyze the gap between a predicted algorithm score and real-world Spotify performance.

Song: "${analysis.title}" by ${analysis.artist_name}
Genre: ${analysis.genre} | Mood: ${analysis.mood} | Energy: ${analysis.energy_level}
SoundScore Predicted Spotify Score: ${analysis.spotify_score}/100
Actual Spotify Popularity Score: ${track.popularity}/100
Score Delta: ${delta > 0 ? "+" : ""}${delta}
Artist Followers: ${track.artist_followers?.toLocaleString()}
Artist Spotify Popularity: ${track.artist_popularity}/100
Artist Genres on Spotify: ${(track.artist_genres || []).join(", ")}
Release Date: ${track.release_date}

${delta > 5 ? "The track is OUTPERFORMING its prediction." : delta < -5 ? "The track is UNDERPERFORMING its prediction." : "The track is performing close to its prediction."}

Provide 3 specific, data-driven insights about WHY this gap exists and what the artist can do. Reference the actual numbers. Be direct and actionable — not generic.`,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string", description: "1 sentence overall verdict" },
          insights: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                body: { type: "string" },
                type: { type: "string", enum: ["positive", "negative", "neutral"] }
              }
            }
          }
        }
      }
    });
    setInsight(result);
    setLoading(false);
  };

  const typeStyles = {
    positive: "border-l-accent text-accent",
    negative: "border-l-destructive text-destructive",
    neutral: "border-l-primary text-primary",
  };

  return (
    <div className="space-y-2">
      {!insight && !loading && (
        <Button variant="outline" size="sm" onClick={generate} className="gap-2 w-full justify-center">
          <Sparkles className="h-3.5 w-3.5" />
          Analyze Performance Gap
        </Button>
      )}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Analyzing discrepancy...
        </div>
      )}
      {insight && (
        <div className="space-y-3">
          <button onClick={() => setOpen(!open)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/15 text-sm text-left">
            <span className="font-medium">{insight.summary}</span>
            {open ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
          </button>
          <AnimatePresence>
            {open && (
              <motion.div key="insights" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden">
                {insight.insights.map((ins, i) => (
                  <div key={i} className={`pl-3 border-l-2 ${typeStyles[ins.type] || typeStyles.neutral}`}>
                    <p className="text-xs font-semibold mb-0.5">{ins.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{ins.body}</p>
                  </div>
                ))}
                <Button variant="ghost" size="sm" onClick={generate} className="gap-1.5 text-muted-foreground text-xs">
                  <Sparkles className="h-3 w-3" />Regenerate
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
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
    setData(null);
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
  const deltaInfo = data ? getDeltaInfo(predicted, live) : null;
  const DeltaIcon = deltaInfo?.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-2xl bg-card border border-border p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#1DB954]/10 flex items-center justify-center">
            <Music2 className="h-5 w-5 text-[#1DB954]" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-lg">Live vs. Predicted</h3>
            <p className="text-xs text-muted-foreground">Spotify popularity vs. SoundScore prediction</p>
          </div>
        </div>
        {data && (
          <button onClick={lookup} disabled={loading}
            className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!data && !loading && !notFound && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center py-8 space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-[#1DB954]/10 flex items-center justify-center mx-auto">
              <Music2 className="h-7 w-7 text-[#1DB954]" />
            </div>
            <div>
              <p className="text-sm font-medium">Look Up on Spotify</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                Compare your SoundScore prediction against this track's real Spotify popularity — and get AI insights on any gap.
              </p>
            </div>
            <Button onClick={lookup} className="gap-2 bg-[#1DB954] hover:bg-[#1DB954]/90 text-black font-semibold">
              <Search className="h-4 w-4" />Search Spotify
            </Button>
          </motion.div>
        )}

        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-3 py-10">
            <Loader2 className="h-5 w-5 text-[#1DB954] animate-spin" />
            <span className="text-sm text-muted-foreground">Searching Spotify catalog...</span>
          </motion.div>
        )}

        {notFound && (
          <motion.div key="notfound" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center py-8 space-y-3">
            <p className="text-sm font-medium">Track not found on Spotify</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              It may not be released yet, or the title / artist name differs slightly from Spotify's catalog.
            </p>
            <Button onClick={lookup} variant="outline" size="sm" className="gap-2">
              <Search className="h-3.5 w-3.5" />Try Again
            </Button>
          </motion.div>
        )}

        {data && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            {/* Track card */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border">
              {data.album_art && (
                <img src={data.album_art} alt={data.album} className="h-14 w-14 rounded-lg object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-heading font-semibold truncate">{data.name}</p>
                <p className="text-sm text-muted-foreground truncate">{data.artist} · {data.album}</p>
                <p className="text-xs text-muted-foreground">{data.release_date}</p>
              </div>
              <a href={data.spotify_url} target="_blank" rel="noopener noreferrer"
                className="h-8 w-8 rounded-lg bg-[#1DB954]/10 flex items-center justify-center hover:bg-[#1DB954]/20 transition-colors shrink-0">
                <ExternalLink className="h-3.5 w-3.5 text-[#1DB954]" />
              </a>
            </div>

            {/* Delta badge */}
            {deltaInfo && (
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${deltaInfo.bg}`}>
                <DeltaIcon className={`h-4 w-4 ${deltaInfo.color}`} />
                <span className={`text-sm font-semibold ${deltaInfo.color}`}>{deltaInfo.label}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {Math.abs(deltaInfo.delta) < 5 ? "Prediction accuracy: excellent" :
                    Math.abs(deltaInfo.delta) < 15 ? "Prediction accuracy: good" : "Significant discrepancy detected"}
                </span>
              </div>
            )}

            {/* Score bars */}
            <div className="space-y-3">
              <ScoreBar label="🎯 SoundScore Prediction" value={predicted} colorClass="bg-primary" delay={0.1} />
              <ScoreBar label="📊 Spotify Live Popularity" value={live} colorClass="bg-[#1DB954]" delay={0.3} />
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-2">
              <StatPill label="Artist Followers" value={data.artist_followers >= 1000000
                ? `${(data.artist_followers / 1000000).toFixed(1)}M`
                : data.artist_followers >= 1000
                ? `${(data.artist_followers / 1000).toFixed(1)}K`
                : data.artist_followers} />
              <StatPill label="Artist Popularity" value={`${data.artist_popularity}/100`} sub="on Spotify" />
              <StatPill label="Track Popularity" value={`${data.popularity}/100`} sub="live score" />
            </div>

            {/* Genre tags */}
            {data.artist_genres?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {data.artist_genres.slice(0, 5).map((g) => (
                  <span key={g} className="px-2 py-0.5 rounded-full bg-[#1DB954]/10 text-[#1DB954] text-xs capitalize">{g}</span>
                ))}
              </div>
            )}

            {/* AI Insight Panel */}
            <div className="pt-1 border-t border-border">
              <p className="text-xs text-muted-foreground mb-3 uppercase tracking-widest font-medium">Performance Analysis</p>
              <InsightPanel analysis={analysis} track={data} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}