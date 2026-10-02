import { CheckCircle2, Circle } from "lucide-react";
import { STAGES } from "@/lib/songStages";

// Full workflow progress: every stage as a toggle, green once done
export default function StageProgress({ song, onToggle }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2">
      {STAGES.map((s) => {
        const done = !!song[s.key];
        return (
          <button
            key={s.key}
            type="button"
            aria-pressed={done}
            onClick={() => onToggle(s.key, !done)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
              done
                ? "bg-primary/15 border-primary/40 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {done ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <Circle className="h-3.5 w-3.5 shrink-0" />}
            {s.label}
          </button>
        );
      })}
    </div>
  );
}