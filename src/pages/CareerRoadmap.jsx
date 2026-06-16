import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { motion } from "framer-motion";
import { Loader2, Map, RefreshCw, ChevronRight, Calendar, Music2, TrendingUp, MapPin, Mic2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const QUARTER_COLORS = [
  "border-primary bg-primary/5",
  "border-purple-500 bg-purple-500/5",
  "border-orange-500 bg-orange-500/5",
  "border-chart-5 bg-chart-5/5",
];
const QUARTER_TEXT = ["text-primary", "text-purple-400", "text-orange-400", "text-chart-5"];

const ACTION_LINKS = {
  "song vault": "/history", "release": "/history", "playlist": "/playlist-pitcher",
  "epk": "/pitch-deck", "tour": "/tour-planner", "venue": "/gig-finder",
  "stream": "/streaming", "analytics": "/analytics", "branding": "/branding-studio",
  "royalt": "/royalties", "social": "/scheduler",
};

function getLink(text) {
  const lower = text.toLowerCase();
  for (const [kw, path] of Object.entries(ACTION_LINKS)) {
    if (lower.includes(kw)) return path;
  }
  return null;
}

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
      prompt: `You are a top music industry strategist. Generate a realistic, specific 4-quarter career roadmap for an independent artist.

Artist Profile: ${profileSnippet}
Recent Songs: ${songSnippet}

Return a JSON object with:
- summary: 1–2 sentence big-picture overview
- quarters: array of 4 objects, each with:
  - label: e.g. "Q1 2026 · Foundation"
  - theme: short quarter theme (e.g. "Build the Foundation")
  - actions: array of 3–4 specific, actionable steps for that quarter (each a plain sentence)
  - milestone: 1 measurable goal for the quarter end (e.g. "500 monthly listeners")

Make the advice concrete and specific to the artist's actual data.`,
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
            <p className="text-muted-foreground text-sm mt-1">A personalized quarterly plan built from your artist profile & vault data.</p>
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
            <p className="text-muted-foreground text-sm">Analyzing your data and building your roadmap...</p>
          </div>
        )}

        {roadmap && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Summary */}
            <div className="rounded-2xl bg-primary/5 border border-primary/20 p-6">
              <p className="text-sm text-primary font-medium mb-1">Big Picture</p>
              <p className="text-foreground">{roadmap.summary}</p>
            </div>

            {/* Quarters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {(roadmap.quarters || []).map((q, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className={`rounded-2xl border p-5 space-y-4 ${QUARTER_COLORS[i % 4]}`}>
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-widest ${QUARTER_TEXT[i % 4]}`}>{q.label}</p>
                    <p className="font-heading font-bold text-lg mt-0.5">{q.theme}</p>
                  </div>
                  <ul className="space-y-2">
                    {(q.actions || []).map((action, j) => {
                      const link = getLink(action);
                      return (
                        <li key={j} className="flex items-start gap-2.5 text-sm">
                          <div className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${QUARTER_TEXT[i % 4].replace("text-", "bg-")}`} />
                          <span className="text-muted-foreground flex-1">{action}</span>
                          {link && (
                            <Link to={link} className={`shrink-0 ${QUARTER_TEXT[i % 4]} hover:underline text-xs flex items-center gap-0.5`}>
                              Go <ChevronRight className="h-3 w-3" />
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  {q.milestone && (
                    <div className="flex items-center gap-2 border-t border-border/50 pt-3">
                      <Calendar className={`h-3.5 w-3.5 shrink-0 ${QUARTER_TEXT[i % 4]}`} />
                      <p className="text-xs text-muted-foreground">Goal: <span className="text-foreground font-medium">{q.milestone}</span></p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

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