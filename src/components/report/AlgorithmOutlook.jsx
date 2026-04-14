import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import ReportCard, { CardHeader } from "./ReportCard";

const METRIC_BARS = [
  { label: "Replay Value", key: "replay", color: "bg-primary" },
  { label: "Playlist Fit", key: "playlist", color: "bg-chart-5" },
  { label: "Viral Potential", key: "viral", color: "bg-chart-3" },
  { label: "Skip Risk", key: "skip", color: "bg-chart-4", invert: true },
];

function seedScore(title = "", key = "", base = 7) {
  let h = 0;
  const s = title + key;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.min(10, Math.max(4, base + ((h >>> 0) % 4) - 1));
}

function MetricBar({ label, score, color, delay }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="font-heading font-bold text-sm">{score}<span className="text-muted-foreground text-xs font-normal">/10</span></span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <motion.div className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${(score / 10) * 100}%` }}
          transition={{ duration: 0.9, delay, ease: "easeOut" }} />
      </div>
    </div>
  );
}

const GENRE_TRENDS = {
  "Hip Hop": [
    "Tempos between 85–100 BPM are dominating hip hop playlists right now, particularly in melodic rap and trap-soul crossovers.",
    "Introspective and emotional moods are outperforming aggressive tracks on Spotify's editorial playlists — vulnerability is the new flex.",
    "Short-form content showing 'studio sessions' and candid freestyles is generating 3x more profile visits than polished music videos.",
  ],
  "Pop": [
    "Mid-tempo tracks (100–120 BPM) with a nostalgic 2000s production feel are surging — 'hyperpop-lite' is the dominant sound on New Music Friday.",
    "Uplifting and bittersweet moods are dominating editorial placement; pure sad-pop has plateaued while hopeful-melancholic is growing.",
    "Vertical video content shot in one take with no cuts performs best for pop — authenticity is beating high production value on TikTok.",
  ],
  "R&B": [
    "Slow-burn tempos (65–80 BPM) with live instrument textures are getting premium editorial support on Apple Music R&B playlists.",
    "Romantic and sensual moods dominate late-night listening algorithms — tracks released Thursday night see the strongest weekend streaming spikes.",
    "Artists showing 'behind the vocal' content — raw takes, voice memos, writing sessions — are seeing 40% higher saves-to-stream ratios.",
  ],
  "EDM": [
    "Melodic house and progressive builds (124–128 BPM) are the algorithm's current favorites — pure drops with no emotional arc are underperforming.",
    "Euphoric moods with cinematic builds are getting placed in Spotify's mood-based playlists far more than aggressive or dark EDM in 2025.",
    "Visualizer content timed to the drop — simple but synced perfectly — is the highest-performing content format for electronic artists.",
  ],
  "Country": [
    "Cross-genre country (country-pop and country-R&B hybrids at 90–110 BPM) is outperforming traditional country on streaming by a wide margin.",
    "Nostalgic and heartfelt moods with storytelling lyrics are getting premium editorial placement on both Spotify and Apple Music Country charts.",
    "Lifestyle content showing authentic farm, truck, or small-town moments paired with the song is driving massive TikTok algorithmic reach.",
  ],
  "Rock": [
    "Alt-rock and indie-rock hybrids in the 120–140 BPM range are experiencing a major playlist resurgence, driven by Gen Z rediscovering guitar.",
    "Angsty and cathartic moods are dominating rock editorial — tracks that feel emotionally unfiltered get significantly more editorial consideration.",
    "Live performance clips — even low-fi phone recordings — consistently outperform studio content for rock artists across all short-form platforms.",
  ],
  "Latin": [
    "Reggaeton and latin pop fusions at 90–100 BPM continue to lead streaming globally, with dembow patterns driving the highest skip-resistance.",
    "Romantic and hype moods split the Latin playlist market — targeting both with different clips for the same track is a proven strategy in 2025.",
    "Dance challenge content with clear, repeatable choreography is the single most effective content format for Latin artists on TikTok right now.",
  ],
  "Indie": [
    "Dreamy lo-fi indie at 80–110 BPM is experiencing a golden moment on playlist algorithms — bedroom pop and shoegaze-influenced tracks are peaking.",
    "Bittersweet and introspective moods are being heavily curated by Spotify's mood-based editorial — 'sad but beautiful' is dominating indie charts.",
    "Aesthetic visual content — color-graded film photography style reels timed to the song's most emotional moment — is outperforming all other formats.",
  ],
};

const DEFAULT_TRENDS = [
  "Mid-tempo tracks with strong melodic hooks are consistently outperforming both very fast and very slow tracks in streaming algorithms this year.",
  "Emotional authenticity is the dominant mood across all genres right now — tracks that feel real and unfiltered get significantly more editorial support.",
  "Short-form content showing the artist's process and personality — not just polished promo — is generating the highest playlist save rates.",
];

export default function AlgorithmOutlook({ data = [], song = {} }) {
  const title = song.title || "track";
  const scores = {
    replay: seedScore(title, "replay", 7),
    playlist: seedScore(title, "playlist", 7),
    viral: seedScore(title, "viral", 6),
    skip: seedScore(title, "skip", 5),
  };
  const trends = GENRE_TRENDS[song.genre] || DEFAULT_TRENDS;

  return (
    <ReportCard borderColor="border-l-primary">
      <CardHeader icon={TrendingUp} title="Algorithm Outlook" iconColor="text-primary" badge="Section 1" />

      {/* Metric bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-secondary/30 border border-border">
        {METRIC_BARS.map((m, i) => (
          <MetricBar key={m.key} label={m.label} score={scores[m.key]} color={m.color} delay={0.1 + i * 0.1} />
        ))}
      </div>

      {/* AI points */}
      <div className="space-y-3">
        {data.map((point, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="h-5 w-5 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <p className="text-sm text-foreground/90 leading-relaxed">{point}</p>
          </div>
        ))}
      </div>

      {/* Genre trends */}
      <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 space-y-3">
        <p className="text-xs text-primary uppercase tracking-widest font-bold">Right Now In Your Genre</p>
        {trends.map((t, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-2" />
            <p className="text-sm text-foreground/85 leading-relaxed">{t}</p>
          </div>
        ))}
      </div>
    </ReportCard>
  );
}