import { ChevronDown } from "lucide-react";

/**
 * Slim 8-segment stage progress strip for a Song Tracker row.
 * Tapping it expands the inline stage checklist.
 */
export default function StageStrip({ song, stages, expanded, onToggleExpand }) {
  const completed = stages.filter((s) => song[s.key]).length;
  return (
    <div className="w-44 shrink-0 px-2 flex items-center justify-center">
      <button
        onClick={onToggleExpand}
        className="flex items-center gap-1.5 group"
        title="Show stage checklist"
      >
        <div className="flex gap-0.5">
          {stages.map((s) => (
            <div
              key={s.key}
              className={`h-2 w-4 rounded-full transition-colors ${
                song[s.key] ? "bg-primary" : "bg-border group-hover:bg-muted-foreground/40"
              }`}
            />
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground">{completed}/{stages.length}</span>
        <ChevronDown className={`h-3 w-3 text-muted-foreground/50 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
    </div>
  );
}