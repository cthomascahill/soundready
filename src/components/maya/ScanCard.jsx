import { useState } from "react";
import { ExternalLink, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const STANCE_STYLES = {
  verified: "bg-primary/10 text-primary border-primary/20",
  claim: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  opportunity: "bg-cyan-500/5 text-cyan-400 border-cyan-500/20",
};

export default function ScanCard({ scan, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const findings = scan.findings || [];
  const newCount = findings.filter(f => f.is_new).length;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold">
              Scan · {new Date(scan.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
            {newCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {newCount} NEW
              </span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground/70 mt-0.5 truncate">"{scan.query}"</p>
          {scan.scan_summary && <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{scan.scan_summary}</p>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => setExpanded(v => !v)}
            className="h-7 w-7 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title={expanded ? "Collapse" : "Show findings"}>
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          <button onClick={() => onDelete(scan)}
            className="h-7 w-7 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-accent transition-colors"
            title="Delete scan">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-border/70 space-y-2.5">
          {findings.length === 0 && (
            <p className="text-xs text-muted-foreground">No individual findings recorded for this scan.</p>
          )}
          {findings.map((f, i) => (
            <div key={i} className="text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                {f.is_new && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">NEW</span>
                )}
                {f.category && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground">{f.category}</span>
                )}
                {f.stance && (
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${STANCE_STYLES[f.stance] || "bg-secondary border-border text-muted-foreground"}`}>
                    {f.stance}
                  </span>
                )}
                {f.date && <span className="text-[10px] text-muted-foreground/70">{f.date}</span>}
              </div>
              <p className="font-medium mt-1">{f.title}</p>
              <p className="text-muted-foreground leading-relaxed">{f.summary}</p>
              {f.url && (
                <a href={f.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline mt-0.5">
                  <ExternalLink className="h-2.5 w-2.5" /> Source
                </a>
              )}
            </div>
          ))}

          {(scan.sources || []).length > 0 && (
            <div className="pt-2 border-t border-border/70 flex flex-wrap gap-1.5">
              {scan.sources.slice(0, 8).map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] leading-none px-2 py-1 rounded-full bg-muted border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors max-w-full">
                  <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                  <span className="truncate">{s.title || s.url}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}