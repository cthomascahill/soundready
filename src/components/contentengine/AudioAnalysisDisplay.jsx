import { Music2, Zap, Clock, Mic2 } from "lucide-react";

const VIBE_COLORS = {
  aggressive: "text-red-400 bg-red-500/10 border-red-500/20",
  emotional: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  confident: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  storytelling: "text-teal-400 bg-teal-500/10 border-teal-500/20",
};

const ENERGY_COLORS = {
  low: "text-blue-400",
  medium: "text-yellow-400",
  high: "text-orange-400",
  explosive: "text-red-400",
};

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AudioAnalysisDisplay({ analysis, selectedVibe }) {
  if (!analysis) return null;

  const vibeColor = VIBE_COLORS[analysis.detected_vibe || selectedVibe] || VIBE_COLORS.confident;
  const energyColor = ENERGY_COLORS[analysis.energy_level] || "text-primary";

  return (
    <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Music2 className="h-4 w-4 text-primary" />
        <p className="font-heading font-semibold">Audio Analysis</p>
        <span className={`ml-auto text-xs px-2.5 py-1 rounded-full font-bold capitalize border ${vibeColor}`}>
          {analysis.detected_vibe || selectedVibe} vibe detected
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-secondary/30 p-3 text-center space-y-1">
          <p className="font-heading font-black text-2xl text-primary">{analysis.bpm}</p>
          <p className="text-xs text-muted-foreground">BPM</p>
        </div>
        <div className="rounded-xl bg-secondary/30 p-3 text-center space-y-1">
          <p className={`font-heading font-black text-2xl capitalize ${energyColor}`}>{analysis.energy_level}</p>
          <p className="text-xs text-muted-foreground">Energy</p>
        </div>
        <div className="rounded-xl bg-secondary/30 p-3 text-center space-y-1">
          <p className="font-heading font-black text-2xl text-foreground">{analysis.key}</p>
          <p className="text-xs text-muted-foreground">Key</p>
        </div>
        <div className="rounded-xl bg-secondary/30 p-3 text-center space-y-1">
          <p className="font-heading font-black text-lg text-chart-5">
            {formatTime(analysis.hook_start)}–{formatTime(analysis.hook_end)}
          </p>
          <p className="text-xs text-muted-foreground">Hook Window</p>
        </div>
      </div>

      {/* Hook description */}
      {analysis.hook_description && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/15">
          <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-foreground/85 leading-relaxed">{analysis.hook_description}</p>
        </div>
      )}

      {/* Selected lyrics */}
      {analysis.selected_lyrics && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-secondary/30 border border-border">
          <Mic2 className="h-4 w-4 text-chart-5 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-1">Selected for overlay</p>
            <p className="text-sm font-medium italic text-foreground">"{analysis.selected_lyrics}"</p>
          </div>
        </div>
      )}

      {/* Tone */}
      {analysis.tone_description && (
        <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-3">{analysis.tone_description}</p>
      )}
    </div>
  );
}