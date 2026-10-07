import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import TaskDraftCard from "@/components/tellsam/TaskDraftCard";
import FeedbackControl from "@/components/tellsam/FeedbackControl";
import { Button } from "@/components/ui/button";
import {
  Paperclip, ExternalLink, Lightbulb, AlertCircle, Loader2, RefreshCw,
} from "lucide-react";

export default function TaskDetail({ task, onChanged }) {
  const [drafts, setDrafts] = useState([]);
  const [loadingDrafts, setLoadingDrafts] = useState(true);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    let alive = true;
    base44.entities.SamTaskDraft.filter({ task_id: task.id }, "created_date", 100)
      .then(d => { if (alive) { setDrafts(d); setLoadingDrafts(false); } })
      .catch(() => { if (alive) setLoadingDrafts(false); });
    const unsub = base44.entities.SamTaskDraft.subscribe((event) => {
      if (event.data?.task_id !== task.id) return;
      setDrafts(prev => {
        if (event.type === "create") return prev.some(d => d.id === event.data.id) ? prev : [...prev, event.data];
        if (event.type === "update") return prev.map(d => d.id === event.data.id ? event.data : d);
        return prev.filter(d => d.id !== event.data.id);
      });
    });
    return () => { alive = false; unsub(); };
  }, [task.id]);

  const retry = async () => {
    setRetrying(true);
    try {
      await base44.functions.invoke("samTaskRun", { task_id: task.id });
    } catch {}
    setRetrying(false);
    onChanged();
  };

  const result = task.result || {};
  const isWorking = task.status === "working" || retrying;

  return (
    <div className="space-y-5">
      {/* The task as given */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <p className="text-sm italic text-muted-foreground leading-relaxed">"{task.prompt}"</p>
        {(task.attachments || []).length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {task.attachments.map(a => (
              <span key={a.file_uri} className="inline-flex items-center gap-1.5 text-xs bg-secondary border border-border rounded-full px-2.5 py-1">
                <Paperclip className="h-3 w-3 text-muted-foreground" />
                <span className="max-w-48 truncate">{a.name}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {isWorking && (
        <div className="rounded-2xl border border-primary/20 bg-card p-8 text-center space-y-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
          <p className="font-semibold">Sam is on it</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Researching, reading your files and drafting. This can take a minute or two — this page updates the moment Sam finishes.
          </p>
        </div>
      )}

      {task.status === "failed" && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-red-400 mx-auto" />
          <p className="font-semibold">Sam couldn't finish this task</p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">{task.error || "Something went wrong while Sam was working."}</p>
          <Button onClick={retry} disabled={retrying} variant="outline" size="sm" className="gap-2 border-border">
            <RefreshCw className={`h-4 w-4 ${retrying ? "animate-spin" : ""}`} /> Ask Sam to try again
          </Button>
        </div>
      )}

      {task.status === "complete" && (
        <>
          {/* Sam's answer */}
          {result.summary && (
            <div className="rounded-2xl border border-primary/20 bg-card p-5 space-y-4">
              <p className="text-sm leading-relaxed font-medium">{result.summary}</p>
              {(result.sections || []).map((s, i) => (
                <div key={i} className="space-y-1.5 pt-3 border-t border-border/60 first:border-0 first:pt-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">{s.heading}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{s.body}</p>
                </div>
              ))}
              {(result.assumptions || []).length > 0 && (
                <div className="pt-3 border-t border-border/60 space-y-1.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-yellow-500">Assumptions & estimates</p>
                  <ul className="space-y-1">
                    {result.assumptions.map((a, i) => (
                      <li key={i} className="text-xs text-muted-foreground leading-relaxed">• {a}</li>
                    ))}
                  </ul>
                </div>
              )}
              {(result.sources || []).length > 0 && (
                <div className="pt-3 border-t border-border/60 space-y-1.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Sources</p>
                  <div className="flex flex-wrap gap-2">
                    {result.sources.map((s, i) => (
                      s.url ? (
                        <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                          <ExternalLink className="h-3 w-3" /> {s.title || s.url}
                        </a>
                      ) : s.title ? (
                        <span key={i} className="text-xs text-muted-foreground">{s.title}</span>
                      ) : null
                    ))}
                  </div>
                </div>
              )}
              {result.follow_up && (
                <div className="rounded-xl bg-primary/5 border border-primary/20 p-3.5 flex gap-2.5">
                  <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed"><span className="font-semibold text-primary">Next step: </span>{result.follow_up}</p>
                </div>
              )}
            </div>
          )}

          {/* Was this answer good? Sam learns for next time */}
          <FeedbackControl taskId={task.id} />

          {/* Outreach drafts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                Outreach drafts
              </p>
              {drafts.length > 0 && (
                <p className="text-[11px] text-muted-foreground/70">Approve each one — nothing sends until you do</p>
              )}
            </div>
            {loadingDrafts ? (
              <div className="space-y-3">
                {[1, 2].map(i => <div key={i} className="h-32 rounded-xl bg-card border border-border animate-pulse" />)}
              </div>
            ) : drafts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6 border border-dashed border-border rounded-xl">
                No outreach needed for this task.
              </p>
            ) : (
              drafts.map(d => <TaskDraftCard key={d.id} draft={d} />)
            )}
          </div>
        </>
      )}
    </div>
  );
}