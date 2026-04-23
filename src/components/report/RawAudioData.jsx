import { motion } from "framer-motion";
import { Activity, Music, Zap, Volume2, Sun, Clock } from "lucide-react";

function Metric({ icon: Icon, label, value, color = "text-primary", sub }) {
  return (
    <div className="rounded-xl bg-secondary/40 border border-border p-3 flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <Icon className={`h-3.5 w-3.5 ${color} shrink-0`} />
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className={`font-heading font-bold text-xl ${color}`}>{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function BarMetric({ label, value, color }) {
  const pct = Math.round((value || 0) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function RawAudioData({ audioData }) {
  if (!audioData) return null;

  const { bpm, key, energy, danceability, loudness, valence, duration, energyProfile, moodTag } = audioData;

  const fmtDuration = (s) => {
    if (!s) return "—";
    const m = Math.floor(s / 60);
    const sec = Math.round(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card border border-primary/30 overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-3 bg-primary/8 border-b border-primary/20 flex items-center gap-2">
        <Activity className="h-4 w-4 text-primary" />
        <p className="font-heading font-bold text-sm text-primary">Real Audio Analysis</p>
        <span className="ml-auto text-[10px] text-muted-foreground bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
          Extracted from your file
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Key metrics grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Metric icon={Activity} label="BPM" value={bpm ? Math.round(bpm) : "—"} color="text-primary" />
          <Metric icon={Music} label="Key" value={key || "—"} color="text-chart-5" />
          <Metric icon={Clock} label="Duration" value={fmtDuration(duration)} color="text-chart-3" />
          <Metric icon={Volume2} label="Loudness" value={loudness ? `${loudness.toFixed(1)} LUFS` : "—"} color="text-orange-400" />
        </div>

        {/* Bar metrics */}
        <div className="rounded-xl bg-secondary/30 border border-border p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Audio Features</p>
          <BarMetric label="Energy" value={energy} color="bg-primary" />
          <BarMetric label="Danceability" value={danceability} color="bg-chart-5" />
          <BarMetric label="Valence (mood brightness)" value={valence} color="bg-yellow-400" />
        </div>

        {/* Tags */}
        {(energyProfile || moodTag) && (
          <div className="flex flex-wrap gap-2">
            {energyProfile && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                <Zap className="h-3 w-3" />{energyProfile}
              </span>
            )}
            {moodTag && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-chart-5/10 border border-chart-5/20 text-chart-5 text-xs font-semibold">
                <Sun className="h-3 w-3" />{moodTag}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}