import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const GREEN = new Set(["sent", "paid", "signed", "approved", "executed", "complete", "delivered"]);
const RED = new Set(["failed", "denied", "declined", "dismissed", "overdue", "cancelled"]);
const YELLOW = new Set(["draft", "drafts", "pending", "ready_to_send", "working", "proposed", "researched", "in progress", "follow_up"]);

function StatusPill({ status }) {
  if (!status) return null;
  const s = String(status).toLowerCase();
  const tone = GREEN.has(s)
    ? "text-primary border-primary/30 bg-primary/10"
    : RED.has(s)
      ? "text-red-400 border-red-500/25 bg-red-500/10"
      : YELLOW.has(s)
        ? "text-yellow-400 border-yellow-500/25 bg-yellow-500/10"
        : "text-muted-foreground border-border bg-muted";
  return (
    <span className={cn("shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize", tone)}>
      {status}
    </span>
  );
}

export default function StorageCard({ doc }) {
  return (
    <Link
      to={doc.link}
      className="group flex flex-col rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:bg-accent/40 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-sm leading-snug line-clamp-2">{doc.title}</p>
        <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
      </div>
      {doc.subtitle && (
        <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">{doc.subtitle}</p>
      )}
      <div className="mt-3 pt-2.5 border-t border-border/70 flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-semibold text-primary/90">{doc.sourceLabel}</span>
        <span className="text-[10px] text-muted-foreground/60">·</span>
        <span className="text-[10px] text-muted-foreground/80">
          {doc.date ? new Date(doc.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : ""}
        </span>
        <span className="ml-auto"><StatusPill status={doc.status} /></span>
      </div>
    </Link>
  );
}