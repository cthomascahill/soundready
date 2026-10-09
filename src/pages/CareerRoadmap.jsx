import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { motion } from "framer-motion";
import { Loader2, Map, RefreshCw, Music2, TrendingUp, MapPin, Mic2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import RoadmapTimeline from "@/components/roadmap/RoadmapTimeline";

export default function CareerRoadmap() {
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      base44.entities.ArtistProfile.filter({ created_by_id: user.id }, "-created_date", 1),
      base44.entities.SongVault.filter({ created_by_id: user.id }, "-created_date", 10),
    ]).then(([profiles, vaultSongs]) => {
      setProfile(profiles[0] || null);
      setSongs(vaultSongs);
    });
  }, [user]);

  const generate = async () => {
    setLoading(true);
    setRoadmap(null);

    const profileSnippet = profile ? `
      Artist: ${profile.stage_name}, Genre: ${(profile.genres || []).join(", ")},
      Career stage: ${profile.career_stage || "emerging"},
      Monthly listeners: ${profile.spotify_monthly_listeners || 0},
      Instagram followers: ${profile.instagram_followers || 0},
      Has manager: ${profile.has_manager || "No"},
      Primary goal: ${profile.primary_goal || "grow audience"},
      Biggest challenge: ${profile.biggest_challenge || "unknown"},
    ` : "No profile data yet.";

    const songSnippet = songs.length
      ? songs.slice(0, 6).map(s => `"${s.title}" (${s.status || "Demo"}, ${s.genre || "unknown genre"})`).join("; ")
      : "No songs in vault yet.";

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a top music industry strategist and the artist's biggest believer. Build a 4-quarter career roadmap for an independent artist. Tone: confident, energizing, forward momentum. Frame everything as the next win, never as a gap or a problem.

Artist Profile: ${profileSnippet}
Recent Songs: ${songSnippet}

Return a JSON object with:
- summary: ONE punchy sentence, max 16 words, framing the year ahead as a win in progress
- quarters: array of 4 objects, each with:
  - label: e.g. "Q1 2026 · Spark"
  - theme: exciting quarter theme, max 4 words
  - actions: exactly 3 specific moves for the quarter, each max 12 words, starting with a verb
  - milestone: one measurable win for quarter end, max 6 words (e.g. "First 1,000 monthly listeners")

Every line must be short, upbeat, and specific to the artist's real data. No lecturing, no filler words.`,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          quarters: {
            type: "array",
            items: {
              type: "object",
              properties: {
                label: { type: "string" },
                theme: { type: "string" },
                actions: { type: "array", items: { type: "string" } },
                milestone: { type: "string" },
              }
            }
          }
        }
      },
      model: "claude_sonnet_4_6",
    });

    setRoadmap(result);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-8">

        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-primary uppercase tracking-widest font-medium">AI Strategy</p>
            <h1 className="font-heading text-3xl font-bold">Career Roadmap</h1>
            <p className="text-muted-foreground text-sm mt-1">Your next 12 months, mapped from your real numbers.</p>
          </div>
          <Button onClick={generate} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Map className="h-4 w-4" />}
            {loading ? "Building Roadmap..." : roadmap ? "Regenerate" : "Generate My Roadmap"}
          </Button>
        </div>

        {/* Info cards */}
        {!roadmap && !loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Music2, label: "Songs in Vault", val: songs.length, color: "text-primary" },
              { icon: TrendingUp, label: "Monthly Listeners", val: profile?.spotify_monthly_listeners ? profile.spotify_monthly_listeners.toLocaleString() : "—", color: "text-purple-400" },
              { icon: MapPin, label: "Career Stage", val: profile?.career_stage || "—", color: "text-orange-400" },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl bg-card border border-border p-4 flex items-center gap-3">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="font-semibold">{stat.val}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">Mapping your next 12 months…</p>
          </div>
        )}

        {roadmap && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Summary */}
            <div className="rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent p-6">
              <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-1.5">The Big Picture</p>
              <p className="font-heading text-lg font-semibold leading-snug">{roadmap.summary}</p>
            </div>

            {/* Quarters */}
            <RoadmapTimeline quarters={roadmap.quarters} />

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={generate} disabled={loading} className="gap-2">
                <RefreshCw className="h-4 w-4" /> Regenerate
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}