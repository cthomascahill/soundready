import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { RefreshCw, Loader2, TrendingUp, Lightbulb, Mic2, Zap, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import moment from "moment";

const GENRES = ["Hip-Hop", "R&B", "Pop", "Afrobeats", "Latin", "Country", "EDM", "Rock", "Gospel", "Lo-Fi"];

export default function GenreTrends() {
  const { user } = useAuth();
  const [genre, setGenre] = useState("Hip-Hop");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cachedAt, setCachedAt] = useState(null);

  const CACHE_DAYS = 7;

  const fetchTrends = async (forceRefresh = false) => {
    if (!user?.id) return;
    setLoading(true);

    // Check cache
    if (!forceRefresh) {
      try {
        const cached = await base44.entities.GenreTrend.filter({ genre, created_by_id: user.id }, "-created_date", 1);
        if (cached.length > 0) {
          const age = moment().diff(moment(cached[0].fetched_at), "days");
          if (age < CACHE_DAYS) {
            setData(cached[0]);
            setCachedAt(cached[0].fetched_at);
            setLoading(false);
            return;
          }
        }
      } catch {}
    }

    // Fetch fresh
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `What sounds, production styles, lyrical topics, aesthetics, tempos, and artist references are trending RIGHT NOW in ${genre} music across Spotify, TikTok, and YouTube as of this week in 2025?

Return a JSON object with exactly these fields:
- top_sounds: array of 5 short strings (e.g. "808 sub bass with reverb tails")
- trending_topics: array of 5 short strings (e.g. "late night regret", "flex culture", "spiritual growth")
- aesthetic_direction: 2-3 sentences describing the overall visual and sonic aesthetic trending in this genre
- breakout_artists: array of 3 objects, each with "name" (string) and "note" (one sentence about why they're hot)
- strategic_tip: 1-2 sentence tip specifically for an independent artist trying to break in ${genre} right now`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          top_sounds: { type: "array", items: { type: "string" } },
          trending_topics: { type: "array", items: { type: "string" } },
          aesthetic_direction: { type: "string" },
          breakout_artists: { type: "array", items: { type: "object" } },
          strategic_tip: { type: "string" },
        }
      },
      model: "gemini_3_flash",
    });

    const now = new Date().toISOString();
    // Upsert: delete old cache for this genre, create new
    try {
      const old = await base44.entities.GenreTrend.filter({ genre, created_by_id: user.id }, "-created_date", 5);
      for (const o of old) await base44.entities.GenreTrend.delete(o.id);
    } catch {}

    const saved = await base44.entities.GenreTrend.create({ genre, ...result, fetched_at: now });
    setData(saved);
    setCachedAt(now);
    setLoading(false);
  };

  useEffect(() => { if (user?.id) fetchTrends(); }, [genre, user?.id]);

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-primary uppercase tracking-widest font-medium">Discovery</p>
            <h1 className="font-heading text-3xl font-bold">What's Trending in Your Genre</h1>
            <p className="text-muted-foreground text-sm mt-1">Live intelligence from Spotify, TikTok & YouTube — updated weekly.</p>
          </div>
          <div className="flex items-center gap-3">
            <select value={genre} onChange={e => setGenre(e.target.value)}
              className="h-9 rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
              {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <Button variant="outline" onClick={() => fetchTrends(true)} disabled={loading} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {cachedAt && !loading && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            Last updated {moment(cachedAt).fromNow()} · refreshes every 7 days
          </p>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">Scanning Spotify, TikTok & YouTube for {genre} trends...</p>
          </div>
        )}

        {data && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Top Sounds */}
            <div className="rounded-2xl bg-card border border-border p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <p className="font-semibold">Top Sounds Right Now</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(data.top_sounds || []).map((s, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-medium">{s}</span>
                ))}
              </div>
            </div>

            {/* Trending Topics */}
            <div className="rounded-2xl bg-card border border-border p-6 space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-400" />
                <p className="font-semibold">Trending Lyrical Topics</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(data.trending_topics || []).map((t, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-sm font-medium">{t}</span>
                ))}
              </div>
            </div>

            {/* Aesthetic Direction */}
            <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6 space-y-2">
              <p className="text-xs font-semibold text-orange-400 uppercase tracking-wider">Aesthetic Direction</p>
              <p className="text-foreground leading-relaxed">{data.aesthetic_direction}</p>
            </div>

            {/* Breakout Artists */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mic2 className="h-4 w-4 text-chart-3" />
                <p className="font-semibold">Breakout Artists to Watch</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(data.breakout_artists || []).map((a, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="rounded-2xl bg-card border border-border p-4 space-y-2">
                    <div className="h-10 w-10 rounded-xl bg-chart-3/10 flex items-center justify-center">
                      <span className="font-heading font-bold text-chart-3">{(a.name || "?")[0]}</span>
                    </div>
                    <p className="font-semibold text-sm">{a.name}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{a.note}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Strategic Tip */}
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                <p className="font-semibold text-primary">Strategic Tip for Independent Artists</p>
              </div>
              <p className="text-foreground leading-relaxed">{data.strategic_tip}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}