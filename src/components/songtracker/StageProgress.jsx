import { CheckCircle2, Circle } from "lucide-react";
import { STAGES, RELEASE_PREP } from "@/lib/songStages";

const Toggle = ({ done, label, onToggle }) => (
  <button
    type="button"
    aria-pressed={done}
    onClick={onToggle}
    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
      done
        ? "bg-foreground/10 border-foreground/25 text-foreground"
        : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
    }`}
  >
    {done ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 fill-current" /> : <Circle className="h-3.5 w-3.5 shrink-0" />}
    <span className="truncate">{label}</span>
  </button>
);

// Workflow progress: the six-stage ladder shared with the Vault, then the
// release-prep checklist as its own row — those don't change the song's stage
export default function StageProgress({ song, onToggle }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {STAGES.map((s) => (
          <Toggle key={s.key} done={!!song[s.key]} label={s.label} onToggle={() => onToggle(s.key, !song[s.key])} />
        ))}
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Release prep</p>
        <div className="grid grid-cols-3 gap-2">
          {RELEASE_PREP.map((s) => (
            <Toggle key={s.key} done={!!song[s.key]} label={s.label} onToggle={() => onToggle(s.key, !song[s.key])} />
          ))}
        </div>
      </div>
    </div>
  );
}