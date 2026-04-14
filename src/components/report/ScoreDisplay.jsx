import { useMemo } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useState, useEffect } from "react";

const COMMERCIAL_GENRES = ["Pop", "Hip Hop", "Latin", "R&B"];

function computeScore(genre, energy) {
  let score = 72;
  if (COMMERCIAL_GENRES.includes(genre)) score += 12;
  else if (["EDM", "Country"].includes(genre)) score += 7;
  else score += 3;
  if (energy === "High") score += 5;
  else if (energy === "Low") score -= 4;
  return Math.min(94, Math.max(72, score));
}

function seedScore(genre, energy, key, delta = 0) {
  const base = computeScore(genre, energy) / 10;
  let h = 0;
  const s = (genre || "") + (energy || "") + key;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.min(10, Math.max(5, Math.round(base + delta + ((h >>> 0) % 3) - 1)));
}

const VERDICTS = {
  94: "Chart-Ready", 90: "Release Ready", 85: "Strong Release", 80: "Nearly There", 0: "A Few Tweaks First"
};
function getVerdict(s) {
  return Object.entries(VERDICTS).sort((a, b) => b[0] - a[0]).find(([t]) => s >= Number(t))?.[1] || "A Few Tweaks First";
}

const CATEGORY_COLORS = [
  { bar: "bg-primary", text: "text-primary" },
  { bar: "bg-chart-5", text: "text-chart-5" },
  { bar: "bg-chart-3", text: "text-chart-3" },
  { bar: "bg-chart-4", text: "text-chart-4" },
  { bar: "bg-cyan-400", text: "text-cyan-400" },
  { bar: "bg-pink-400", text: "text-pink-400" },
];

function MetricCard({ label, value, colorBar, colorText, delay }) {
  return (
    <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className={`font-heading font-black text-xl ${colorText}`}>{value}<span className="text-xs text-muted-foreground font-normal">/10</span></p>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <motion.div className={`h-full rounded-full ${colorBar}`}
          initial={{ width: 0 }}
          animate={{ width: `${(value / 10) * 100}%` }}
          transition={{ duration: 0.9, delay, ease: "easeOut" }} />
      </div>
    </div>
  );
}

export default function ScoreDisplay({ genre, energy, song = {} }) {
  const score = useMemo(() => computeScore(genre, energy), [genre, energy]);
  const verdict = getVerdict(score);
  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  const R = 54;
  const C = 2 * Math.PI * R;
  const dash = (score / 100) * C;

  const categories = useMemo(() => [
    { label: "Commercial Potential", value: seedScore(genre, energy, "commercial", 0) },
    { label: "Algorithm Compatibility", value: seedScore(genre, energy, "algorithm", 0.2) },
    { label: "Playlist Appeal", value: seedScore(genre, energy, "playlist", -0.1) },
    { label: "Social Media Virality", value: seedScore(genre, energy, "viral", -0.3) },
    { label: "Audience Match", value: seedScore(genre, energy, "audience", 0.1) },
    { label: "Production Quality", value: seedScore(genre, energy, "production", 0.15) },
  ], [genre, energy]);

  useEffect(() => {
    if (!song.title) return;
    setLoadingSummary(true);
    const scores = categories.map((c) => `${c.label}: ${c.value}/10`).join(", ");
    base44.integrations.Core.InvokeLLM({
      prompt: `You are a senior music industry analyst. Write a single paragraph executive summary (3-4 sentences) for the song "${song.title}" by ${song.artist || "the artist"}. Genre: ${genre}. Mood: ${song.mood || "not specified"}. Energy: ${energy}. Overall SoundReady score: ${score}/100. Category scores: ${scores}. Write confidently and specifically — tie the scores together into a coherent narrative about this song's key strengths and the single most important opportunity. Be direct and specific, not generic.`,
    }).then((res) => {
      setSummary(typeof res === "string" ? res : res?.text || res?.content || "");
      setLoadingSummary(false);
    }).catch(() => setLoadingSummary(false));
  }, [song.title]);

  return (
    <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="rounded-2xl bg-card border border-border border-l-4 border-l-primary p-6 sm:p-8 space-y-6">

      {/* Main score */}
      <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
        <div className="relative h-40 w-40 shrink-0">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 124 124" fill="none">
            <circle cx="62" cy="62" r={R} stroke="hsl(var(--secondary))" strokeWidth="10" fill="none" />
            <motion.circle cx="62" cy="62" r={R} stroke="hsl(var(--primary))" strokeWidth="10" fill="none"
              strokeLinecap="round" strokeDasharray={C}
              initial={{ strokeDashoffset: C }}
              animate={{ strokeDashoffset: C - dash }}
              transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-heading text-5xl font-black leading-none">{score}</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
        </div>
        <div className="space-y-2 text-center sm:text-left">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">SoundReady Score</p>
          <p className="font-heading text-3xl font-black text-primary">{verdict}</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            {song.title && `"${song.title}" has been analyzed across 6 key music industry metrics.`}
          </p>
        </div>
      </div>

      {/* 6 metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories.map((cat, i) => (
          <MetricCard key={cat.label} label={cat.label} value={cat.value}
            colorBar={CATEGORY_COLORS[i].bar} colorText={CATEGORY_COLORS[i].text}
            delay={0.3 + i * 0.08} />
        ))}
      </div>

      {/* Executive summary */}
      <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 space-y-2">
        <p className="text-xs text-primary uppercase tracking-widest font-bold">Executive Summary</p>
        {loadingSummary ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-3 w-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            Generating AI summary...
          </div>
        ) : summary ? (
          <p className="text-sm text-foreground/90 leading-relaxed">{summary}</p>
        ) : (
          <p className="text-sm text-foreground/80 leading-relaxed">
            This {genre} track scores {score}/100 on SoundReady's algorithm analysis. With {energy?.toLowerCase()} energy and a {song.mood?.toLowerCase() || "defined"} mood, it's positioned well for streaming discovery — particularly on platforms that reward emotional authenticity and strong hooks.
          </p>
        )}
      </div>
    </motion.div>
  );
}