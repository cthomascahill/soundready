import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import {
  BarChart3, Wand2, Image, Calendar, MessageSquare, FileText,
  ChevronRight, Music, ArrowLeft, Star, Loader2
} from "lucide-react";
import moment from "moment";
import SpotifyComparison from "../components/SpotifyComparison";
import YouTubeStats from "../components/YouTubeStats";

const TOOLS = [
  {
    icon: BarChart3,
    label: "Algorithm Report",
    description: "Full score breakdown, platform performance, and what's working vs holding you back.",
    path: (id) => `/results?id=${id}`,
    color: "primary",
  },
  {
    icon: Wand2,
    label: "AI Mastering",
    description: "One-click mastering to streaming-ready loudness. Download the polished WAV.",
    path: (id) => `/results?id=${id}#mastering`,
    color: "accent",
  },
  {
    icon: Image,
    label: "Marketing Assets",
    description: "AI cover art + Spotify card, Instagram story, TikTok visual, and Twitter banner.",
    path: (id) => `/marketing?id=${id}`,
    color: "chart4",
  },
  {
    icon: Calendar,
    label: "Release Plan",
    description: "When to drop, what to post each day, and your full 7-day pre-release content plan.",
    path: (id) => `/release?id=${id}`,
    color: "chart5",
  },
  {
    icon: MessageSquare,
    label: "Captions & Hooks",
    description: "5 ready-to-post captions for Instagram, TikTok, Twitter/X tuned to your song's vibe.",
    path: (id) => `/captions?id=${id}`,
    color: "chart3",
  },
  {
    icon: FileText,
    label: "Pitch Package",
    description: "Curator pitch, DSP tags, similar artists, press sheet — all as a downloadable PDF.",
    path: (id) => `/pitch?id=${id}`,
    color: "primary",
  },
  {
    icon: MessageSquare,
    label: "TikTok Optimizer",
    description: "Best 3-second hook, sound niche, hashtag strategy, and 5 viral video concepts.",
    path: (id) => `/tiktok?id=${id}`,
    color: "chart5",
  },
  {
    icon: Calendar,
    label: "Release Countdown",
    description: "Enter your release date and get a day-by-day content calendar counting down to drop day.",
    path: (id) => `/countdown?id=${id}`,
    color: "chart3",
  },
];

const COLOR_MAP = {
  primary: { bg: "bg-primary/10", text: "text-primary", border: "hover:border-primary/40" },
  accent:  { bg: "bg-accent/10",  text: "text-accent",  border: "hover:border-accent/40" },
  chart3:  { bg: "bg-chart-3/10", text: "text-chart-3", border: "hover:border-chart-3/40" },
  chart4:  { bg: "bg-chart-4/10", text: "text-chart-4", border: "hover:border-chart-4/40" },
  chart5:  { bg: "bg-chart-5/10", text: "text-chart-5", border: "hover:border-chart-5/40" },
};

function getGrade(score) {
  if (score >= 90) return { grade: "A+", label: "Exceptional" };
  if (score >= 80) return { grade: "A",  label: "Excellent" };
  if (score >= 70) return { grade: "B+", label: "Strong" };
  if (score >= 60) return { grade: "B",  label: "Solid" };
  if (score >= 50) return { grade: "C+", label: "Average" };
  if (score >= 40) return { grade: "C",  label: "Below Avg" };
  return { grade: "D", label: "Needs Work" };
}

export default function SongHub() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  useEffect(() => {
    if (!id) return;
    base44.entities.SongAnalysis.filter({ id }).then((items) => {
      setAnalysis(items[0] || null);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Song not found.</p>
        <Link to="/" className="text-primary text-sm mt-2 inline-block">Go to dashboard</Link>
      </div>
    );
  }

  const { grade, label } = getGrade(analysis.overall_score || 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3">
        <Link to="/" className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-sm text-muted-foreground">Dashboard</span>
      </motion.div>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="rounded-2xl bg-gradient-to-br from-primary/15 via-card to-accent/5 border border-primary/20 p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Music className="h-10 w-10 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Your SoundScore Report</p>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold truncate">{analysis.title}</h1>
            <p className="text-muted-foreground mt-1">{analysis.artist_name} · {analysis.genre} · {moment(analysis.created_date).format("MMM D, YYYY")}</p>
          </div>
          {/* Score */}
          <div className="flex flex-col items-center shrink-0 text-center">
            <div className="relative">
              <div className="h-28 w-28 rounded-full bg-primary/10 border-4 border-primary/30 flex flex-col items-center justify-center">
                <span className="font-heading text-4xl font-black text-primary">{analysis.overall_score}</span>
                <span className="text-xs text-muted-foreground">/ 100</span>
              </div>
              <div className="absolute -top-2 -right-2 h-9 w-9 rounded-full bg-primary flex items-center justify-center shadow-lg">
                <span className="font-heading font-black text-sm text-white">{grade}</span>
              </div>
            </div>
            <span className="text-sm font-medium text-muted-foreground mt-2">{label}</span>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-6 pt-6 border-t border-border/50">
          {[
            { label: "Spotify", val: analysis.spotify_score },
            { label: "Apple", val: analysis.apple_music_score },
            { label: "YouTube", val: analysis.youtube_score },
            { label: "TikTok", val: analysis.tiktok_score },
            { label: "Hook", val: analysis.hook_strength },
            { label: "Production", val: analysis.production_quality },
          ].map(({ label, val }) => (
            <div key={label} className="text-center">
              <p className="font-heading font-bold text-xl">{val || "—"}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tool Grid */}
      <div>
        <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium mb-4">Your Tools</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS.map(({ icon: Icon, label, description, path, color }, i) => {
            const c = COLOR_MAP[color] || COLOR_MAP.primary;
            return (
              <motion.div key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
              >
                <Link to={path(id)} className={`block rounded-2xl bg-card border border-border p-5 transition-all hover:scale-[1.02] hover:shadow-lg ${c.border}`}>
                  <div className={`h-10 w-10 rounded-xl ${c.bg} flex items-center justify-center mb-4`}>
                    <Icon className={`h-5 w-5 ${c.text}`} />
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-heading font-semibold">{label}</p>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Platform Stats Grid */}
      {analysis.status === "complete" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpotifyComparison analysis={analysis} />
          <YouTubeStats analysis={analysis} />
        </div>
      )}

      {/* Mood tags */}
      {(analysis.mood || analysis.energy_level || analysis.bpm_estimate) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="rounded-xl bg-card border border-border p-4 flex flex-wrap items-center gap-3">
          <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Song Profile</span>
          {[analysis.mood, analysis.energy_level && `${analysis.energy_level} energy`, analysis.bpm_estimate && `~${analysis.bpm_estimate} BPM`, analysis.genre]
            .filter(Boolean).map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full bg-secondary text-sm">{tag}</span>
            ))}
          {(analysis.similar_artists || []).slice(0, 3).map((a) => (
            <span key={a} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">≈ {a}</span>
          ))}
        </motion.div>
      )}
    </div>
  );
}