import { ChevronDown } from "lucide-react";

// One color per stage so progress reads at a glance
export const STAGE_COLORS = {
  stage_write: "bg-cyan-400",
  stage_record: "bg-blue-400",
  stage_mix: "bg-purple-400",
  stage_master: "bg-pink-400",
  stage_review: "bg-orange-400",
  stage_artwork: "bg-yellow-400",
  stage_submit: "bg-teal-400",
  stage_released: "bg-primary",
};

/**
 * Slim 8-segment stage progress strip for a Song Tracker row.
 * Tapping it expands the inline stage checklist.
 */
export default function StageStrip({ song, stages, expanded, onToggleExpand }) {
  const completed = stages.filter((s) => song[s.key]).length;
  return (
    <div className="w-40 shrink-0 px-2 flex items-center justify-center">
      <button
        onClick={onToggleExpand}
        className="flex items-center gap-1.5 group"
        title="Show stage checklist"
      >
        <div className="flex gap-0.5">
          {stages.map((s) => (
            <div
              key={s.key}
              className={`h-2 w-3.5 rounded-full transition-colors ${
                song[s.key] ? STAGE_COLORS[s.key] : "bg-border group-hover:bg-muted-foreground/40"
              }`}
            />
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground/70">{completed}/{stages.length}</span>
        <ChevronDown className={`h-3 w-3 text-muted-foreground/40 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
    </div>
  );
}