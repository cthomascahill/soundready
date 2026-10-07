import { Loader2, CheckCircle2, AlertCircle, Paperclip, Mail, ChevronRight } from "lucide-react";

const STATUS_META = {
  working: { label: "Working", cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", icon: Loader2 },
  complete: { label: "Done", cls: "bg-primary/10 text-primary border-primary/20", icon: CheckCircle2 },
  failed: { label: "Failed", cls: "bg-red-500/10 text-red-400 border-red-500/20", icon: AlertCircle },
};

export default function TaskHistory({ tasks, loading, onOpen }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 rounded-xl bg-card border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  if (!tasks.length) {
    return (
      <div className="rounded-2xl bg-card border border-dashed border-border p-10 text-center space-y-2">
        <p className="font-semibold">No tasks yet</p>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Whatever you give Sam lands here — with the research, the numbers and every draft ready for your review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Sam's task history</p>
      {tasks.map(t => {
        const meta = STATUS_META[t.status] || STATUS_META.working;
        const StatusIcon = meta.icon;
        return (
          <button key={t.id} onClick={() => onOpen(t.id)}
            className="w-full text-left rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors group">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium leading-snug line-clamp-2 flex-1">{t.prompt}</p>
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${meta.cls}`}>
                <StatusIcon className={`h-3 w-3 ${t.status === "working" ? "animate-spin" : ""}`} />
                {meta.label}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground/70">
              <span>{new Date(t.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              {t.drafts_created > 0 && (
                <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {t.drafts_created} draft{t.drafts_created === 1 ? "" : "s"}</span>
              )}
              {(t.attachments || []).length > 0 && (
                <span className="inline-flex items-center gap-1"><Paperclip className="h-3 w-3" /> {t.attachments.length} file{t.attachments.length === 1 ? "" : "s"}</span>
              )}
              <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        );
      })}
    </div>
  );
}