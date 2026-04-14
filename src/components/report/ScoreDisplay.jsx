import { useMemo } from "react";
import { motion } from "framer-motion";

const COMMERCIAL_GENRES = ["Pop", "Hip Hop", "Latin", "R&B"];
const HIGH_ENERGY_BONUS = 5;
const BASE_SCORE = 72;

function computeScore(genre, energy) {
  let score = BASE_SCORE;
  if (COMMERCIAL_GENRES.includes(genre)) score += 12;
  else if (["EDM", "Country"].includes(genre)) score += 7;
  else score += 3;
  if (energy === "High") score += HIGH_ENERGY_BONUS;
  else if (energy === "Low") score -= 4;
  return Math.min(94, Math.max(72, score));
}

function getVerdict(score) {
  if (score >= 85) return "Release Ready";
  if (score >= 75) return "Nearly There";
  return "A Few Tweaks First";
}

function SubScore({ label, value }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-semibold font-heading">{value}<span className="text-muted-foreground text-xs">/10</span></span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${(value / 10) * 100}%` }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default function ScoreDisplay({ genre, energy }) {
  const score = useMemo(() => computeScore(genre, energy), [genre, energy]);
  const verdict = getVerdict(score);

  // SVG circle arc
  const R = 52;
  const C = 2 * Math.PI * R;
  const dash = (score / 100) * C;

  const subScores = useMemo(() => {
    const base = score / 10;
    return {
      commercial: Math.min(10, Math.round(base * (COMMERCIAL_GENRES.includes(genre) ? 1.05 : 0.92))),
      algorithm: Math.min(10, Math.round(base * (energy === "High" ? 1.05 : 0.95))),
      audience: Math.min(10, Math.round(base * 0.98)),
    };
  }, [score, genre, energy]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl bg-card border border-border p-8 flex flex-col items-center gap-8"
    >
      {/* Circle score */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-36 w-36">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120" fill="none">
            {/* Track */}
            <circle cx="60" cy="60" r={R} stroke="hsl(var(--secondary))" strokeWidth="8" fill="none" />
            {/* Arc */}
            <motion.circle
              cx="60" cy="60" r={R}
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={C}
              initial={{ strokeDashoffset: C }}
              animate={{ strokeDashoffset: C - dash }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-heading text-4xl font-black">{score}</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
        </div>
        <p className="text-primary font-heading font-semibold text-lg">{verdict}</p>
      </div>

      {/* Sub-scores */}
      <div className="w-full max-w-sm space-y-4">
        <SubScore label="Commercial Potential" value={subScores.commercial} />
        <SubScore label="Algorithm Fit" value={subScores.algorithm} />
        <SubScore label="Audience Match" value={subScores.audience} />
      </div>
    </motion.div>
  );
}