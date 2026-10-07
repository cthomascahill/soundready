import { ChevronRight } from "lucide-react";
import { CATEGORY_META } from "./StorageSection";

export default function StorageTile({ category, count, latest, onClick }) {
  const meta = CATEGORY_META[category];
  if (!meta) return null;
  const Icon = meta.icon;
  return (
    <button
      onClick={onClick}
      className="group text-left rounded-2xl border border-border bg-card p-5 space-y-3 hover:border-primary/40 hover:bg-accent/40 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-border bg-muted text-muted-foreground">
          {count}
        </span>
      </div>
      <div>
        <h3 className="font-heading font-bold text-sm">{meta.label}</h3>
        {latest ? (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
            Latest: {latest.title}
          </p>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground/60">Empty</p>
        )}
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border/70">
        <span className="text-[10px] text-muted-foreground/80">
          {latest?.date
            ? new Date(latest.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })
            : ""}
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
      </div>
    </button>
  );
}