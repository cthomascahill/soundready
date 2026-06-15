import { Check, ChevronDown } from "lucide-react";

export default function ProfileBlock({ title, icon: Icon, filledCount, totalCount, isActive, onClick, children }) {
  const pct = totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0;
  const complete = filledCount === totalCount;

  return (
    <div className={`rounded-2xl border transition-colors ${isActive ? "border-primary/40 bg-card" : "border-border bg-card/60"}`}>
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${complete ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-sm">{title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{filledCount}/{totalCount} fields filled</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-24 h-1.5 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
          </div>
          {complete && <Check className="h-4 w-4 text-primary" />}
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isActive ? "rotate-180" : ""}`} />
        </div>
      </button>
      {isActive && (
        <div className="px-5 pb-6 pt-1 border-t border-border/50 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}