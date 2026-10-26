import { Check } from "lucide-react";
import { CHECKLIST_PHASES } from "@/lib/releaseChecklistDefaults";

export default function ChecklistSection({ items, onToggle }) {
  const doneCount = items.filter((i) => i.done).length;
  const pct = items.length ? Math.round((doneCount / items.length) * 100) : 0;

  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-heading font-bold text-lg">Release Checklist</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            In order. Check things off as you go.
          </p>
        </div>
        <span className="text-sm font-bold text-primary whitespace-nowrap">
          {doneCount}/{items.length} done
        </span>
      </div>

      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>

      <div className="space-y-5">
        {CHECKLIST_PHASES.map((phase) => {
          const phaseItems = items.filter((i) => i.phase === phase.label);
          if (!phaseItems.length) return null;
          return (
            <div key={phase.label} className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary">{phase.label}</p>
              {phaseItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onToggle(item)}
                  className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-secondary/50 transition-colors"
                >
                  <span
                    className={`mt-0.5 h-5 w-5 shrink-0 rounded-md border flex items-center justify-center ${
                      item.done ? "bg-primary border-primary" : "border-border"
                    }`}
                  >
                    {item.done && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
                  </span>
                  <span
                    className={`text-sm leading-relaxed ${
                      item.done ? "text-muted-foreground line-through" : "text-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}