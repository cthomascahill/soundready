import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useMode } from "@/lib/mode";
import ModeToggle from "@/components/ModeToggle";
import { hasAIManager } from "@/lib/tier";
import { Button } from "@/components/ui/button";
import {
  FileText, Mic2, MapPin,
  Music2, BarChart2, ChevronRight, ArrowRight,
  Sparkles, AlertCircle, Shield, Map, TrendingUp, Disc3, ListChecks,
  Store, Users, FileSignature
} from "lucide-react";
import AIActivityFeed from "@/components/dashboard/AIActivityFeed";
import MayaScoutCard from "@/components/dashboard/MayaScoutCard";


const QUICK_ACTIONS = [
  { label: "Song Vault", icon: Music2, to: "/history", color: "text-primary bg-primary/10" },

  { label: "Create EPK", icon: FileText, to: "/pitch-deck", color: "text-purple-400 bg-purple-500/10" },
  { label: "Pitch to Playlist", icon: Mic2, to: "/playlist-pitcher", color: "text-chart-3 bg-chart-3/10" },
  { label: "Find a Venue", icon: MapPin, to: "/gig-finder", color: "text-orange-400 bg-orange-500/10" },

  { label: "Career Roadmap", icon: Map, to: "/career-roadmap", color: "text-teal-400 bg-teal-500/10" },
  { label: "Revenue Splits", icon: TrendingUp, to: "/revenue-splits", color: "text-yellow-400 bg-yellow-500/10" },
  { label: "Analyze Contract", icon: Shield, to: "/contract-analyzer", color: "text-yellow-400 bg-yellow-500/10" },
  { label: "Tour Planner", icon: BarChart2, to: "/tour-planner", color: "text-pink-400 bg-pink-500/10" },
];

const PRODUCER_ACTIONS = [
  { label: "Beat Vault", icon: Disc3, to: "/beat-vault", color: "text-primary bg-primary/10" },
  { label: "Beat Pipeline", icon: ListChecks, to: "/beat-pipeline", color: "text-purple-400 bg-purple-500/10" },
  { label: "Placements", icon: TrendingUp, to: "/placements", color: "text-yellow-400 bg-yellow-500/10" },
  { label: "Artist Match", icon: Mic2, to: "/artist-match", color: "text-teal-400 bg-teal-500/10" },
  { label: "Beat Store", icon: Store, to: "/beat-store", color: "text-teal-400 bg-teal-500/10" },
  { label: "Client CRM", icon: Users, to: "/client-crm", color: "text-orange-400 bg-orange-500/10" },
  { label: "Contracts", icon: FileSignature, to: "/producer-contracts", color: "text-chart-3 bg-chart-3/10" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { mode } = useMode();
  const navigate = useNavigate();
  const isProducer = mode === "producer";
  const [recentSongs, setRecentSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextSteps, setNextSteps] = useState([]);
  const [stepsLoading, setStepsLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    if (isProducer) {
      base44.entities.Beat.filter({ created_by_id: user.id }, "-created_date", 5)
        .then(setRecentSongs)
        .catch(() => setRecentSongs([]))
        .finally(() => setLoading(false));
    } else {
      base44.entities.SongVault.filter({ created_by_id: user.id }, "-created_date", 5)
        .then(setRecentSongs)
        .catch(() => setRecentSongs([]))
        .finally(() => setLoading(false));
    }
  }, [user, isProducer]);

  useEffect(() => {
    if (loading || recentSongs.length === 0) return;
    setStepsLoading(true);
    const itemList = recentSongs.slice(0, 3).map(s => `"${s.title}" (${isProducer ? `stage: ${s.stage || "Idea"}` : `status: ${s.status || "Demo"}`})`).join(", ");
    base44.integrations.Core.InvokeLLM({
      prompt: `You are a music career manager. Based on these recent ${isProducer ? "beats" : "songs"}: ${itemList}, generate exactly 3 short, specific, actionable next-step nudges for the ${isProducer ? "producer" : "artist"}. Each should be 1 sentence, referencing the actual title. Format as a JSON array of strings. Examples: "You haven't pitched 'Song Title' to playlists yet", "Your EPK hasn't been updated this month — add your latest release stats."`,
      response_json_schema: { type: "object", properties: { steps: { type: "array", items: { type: "string" } } } }
    }).then(res => setNextSteps(res.steps || [])).catch(() => setNextSteps([])).finally(() => setStepsLoading(false));
  }, [loading, recentSongs]);

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Welcome back</p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-4xl font-bold">
              {user?.artist_name || user?.full_name || "Dashboard"}
            </h1>
            <ModeToggle />
          </div>
          <p className="text-muted-foreground">Here's where everything stands today.</p>
        </motion.div>

        {/* On-demand Maya scouting for AI Manager producers */}
        {isProducer && hasAIManager(user) && <MayaScoutCard />}

        {/* Your Music Row */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-lg">{isProducer ? "Your Beats" : "Your Music"}</h2>
            <Link to={isProducer ? "/beat-vault" : "/history"} className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="flex gap-4">
              {[1,2,3].map(i => <div key={i} className="flex-1 h-32 rounded-xl bg-card border border-border animate-pulse" />)}
            </div>
          ) : recentSongs.length === 0 ? (
            <div className="rounded-2xl bg-card border border-dashed border-border p-10 text-center space-y-3">
              {isProducer
                ? <Disc3 className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                : <Music2 className="h-10 w-10 text-muted-foreground/30 mx-auto" />}
              <p className="text-muted-foreground">{isProducer ? "No beats yet. Upload your first beat to get started." : "No songs yet. Add your first track to get started."}</p>
              <Link to={isProducer ? "/beat-vault" : "/history"}>
                <Button size="sm" className="gap-2">
                  {isProducer ? <><Disc3 className="h-4 w-4" />Go to Beat Vault</> : <><Music2 className="h-4 w-4" />Go to Song Vault</>}
                </Button>
              </Link>
            </div>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentSongs.slice(0, 3).map((song, i) => (
              <motion.div key={song.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="rounded-xl bg-card border border-border p-4 space-y-3 hover:border-primary/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    {isProducer ? <Disc3 className="h-5 w-5 text-primary" /> : <Music2 className="h-5 w-5 text-primary" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{song.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {isProducer
                        ? [song.genre, song.bpm && `${song.bpm} BPM`].filter(Boolean).join(" · ")
                        : [song.producer && `Prod. ${song.producer}`, song.genre].filter(Boolean).join(" · ")}
                    </p>
                    <span className="mt-1 inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-green-500/15 text-green-400 border-green-500/25">
                      {isProducer ? (song.stage || "Idea") : (song.status || "Demo")}
                    </span>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="w-full text-xs h-7"
                  onClick={() => navigate(isProducer ? "/beat-vault" : "/history")}>
                  View in Vault
                </Button>
              </motion.div>
            ))}
          </div>
          )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Next Steps */}
          <div className="lg:col-span-2 rounded-2xl bg-card border border-border p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="font-heading font-semibold">Next Steps</h2>
            </div>
            {stepsLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-10 rounded-lg bg-secondary animate-pulse" />)}
              </div>
            ) : nextSteps.length === 0 ? (
              <p className="text-sm text-muted-foreground">Upload a song to get personalized recommendations.</p>
            ) : (
              <div className="space-y-2">
                {nextSteps.map((step, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
                    <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm">{step}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Analytics Strip */}
          <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-primary" />
              <h2 className="font-heading font-semibold">Analytics</h2>
            </div>
            <div className="space-y-3">
              {[
                { label: "Total Streams", value: "—" },
                { label: "Playlist Adds", value: "—" },
                { label: "Followers Gained", value: "—" },
                { label: "Revenue", value: "—" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-sm font-semibold">{stat.value}</p>
                </div>
              ))}
            </div>
            <Link to="/analytics">
              <Button size="sm" variant="outline" className="w-full text-xs gap-1 mt-2">
                View Full Analytics <ChevronRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>

        {/* AI Activity Feed (includes Maya Suggestions) */}
        <AIActivityFeed user={user} />

        {/* Quick Actions */}
        <section>
          <h2 className="font-heading font-semibold text-lg mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            {(isProducer ? PRODUCER_ACTIONS : QUICK_ACTIONS).map((action, i) => (
              <Link key={action.label} to={action.to}>
                <motion.button
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-card/80 transition-all text-sm font-medium">
                  <span className={`h-7 w-7 rounded-lg flex items-center justify-center ${action.color}`}>
                    <action.icon className="h-3.5 w-3.5" />
                  </span>
                  {action.label}
                </motion.button>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}