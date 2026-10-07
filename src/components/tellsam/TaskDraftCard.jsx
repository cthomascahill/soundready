import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Mail, ExternalLink, Pencil, Check, X, Loader2, Copy, CheckCircle2, Trash2, Send,
} from "lucide-react";

const STATUS_BADGE = {
  draft: { label: "Needs review", cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  approved: { label: "Taken on", cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  sent: { label: "Sent", cls: "bg-primary/10 text-primary border-primary/20" },
  dismissed: { label: "Dismissed", cls: "bg-secondary text-muted-foreground border-border" },
};

export default function TaskDraftCard({ draft }) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(draft.draft || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const badge = STATUS_BADGE[draft.status] || STATUS_BADGE.draft;
  const hasEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test((draft.target_email || "").trim());
  const open = draft.status === "draft" || draft.status === "approved";

  const act = async (action, extra = {}) => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await base44.functions.invoke("samTaskDraft", {
        action,
        draft_id: draft.id,
        draft_text: text,
        ...extra,
      });
      setEditing(false);
      toast({ description: action === "send" ? "Sent — it's on its way." : action === "approve" ? "Marked as handled." : "Draft dismissed." });
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const copyDraft = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ description: "Draft copied — paste it on their contact page." });
    } catch {
      setError("Couldn't copy — select the text manually.");
    }
  };

  return (
    <div className={`rounded-xl border bg-card p-4 space-y-3 ${draft.status === "sent" ? "border-primary/30" : "border-border"}`}>
      {/* Target header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold leading-tight">{draft.target_name}</p>
          {draft.why_fit && <p className="text-xs text-muted-foreground leading-relaxed">{draft.why_fit}</p>}
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${badge.cls}`}>
          {draft.status === "sent" && draft.sent_at ? "Sent" : badge.label}
        </span>
      </div>

      {/* Contact line */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        {hasEmail ? (
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Mail className="h-3 w-3 text-primary" /> {draft.target_email}
          </span>
        ) : (
          <span className="text-yellow-500/90">No verifiable email found — send via the official page below</span>
        )}
        {draft.source_url && (
          <a href={draft.source_url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline">
            <ExternalLink className="h-3 w-3" /> Contact page
          </a>
        )}
      </div>

      {/* Draft body */}
      {editing ? (
        <div className="space-y-2">
          <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={10}
            className="text-xs leading-relaxed bg-secondary/40" />
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { setText(draft.draft); setEditing(false); }}>
              <X className="h-3.5 w-3.5" /> Cancel
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setEditing(false)}>
              <Check className="h-3.5 w-3.5" /> Save
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap border border-border/60 bg-secondary/30 rounded-lg p-3">
          {text}
        </p>
      )}

      {/* Sent note */}
      {draft.status === "sent" && draft.sent_at && (
        <p className="text-[11px] text-muted-foreground/60 flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
          Emailed {new Date(draft.sent_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
        </p>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* Actions */}
      {open && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {!editing && (
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
          )}
          {hasEmail ? (
            <Button size="sm" className="gap-1.5 font-semibold" disabled={busy} onClick={() => act("send")}>
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Approve & Send
            </Button>
          ) : (
            <>
              <Button size="sm" variant="outline" className="gap-1.5" onClick={copyDraft}>
                <Copy className="h-3.5 w-3.5" /> Copy draft
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5" disabled={busy} onClick={() => act("approve")}>
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                I'll send it myself
              </Button>
            </>
          )}
          <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground hover:text-red-400" disabled={busy} onClick={() => act("dismiss")}>
            <Trash2 className="h-3.5 w-3.5" /> Dismiss
          </Button>
        </div>
      )}
    </div>
  );
}