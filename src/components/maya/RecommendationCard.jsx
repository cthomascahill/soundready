import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Radar, TrendingUp, ListTodo, CalendarClock, ChevronRight, Pencil,
  Loader2, AlertTriangle, Check, X, Mail,
} from "lucide-react";
import OutcomeControl from "./OutcomeControl";

const KIND_META = {
  career_opportunity: { icon: Radar, label: "Career Opportunity", color: "text-primary bg-primary/10" },
  career_move: { icon: TrendingUp, label: "Career Move", color: "text-orange-400 bg-orange-500/10" },
  daily_task: { icon: ListTodo, label: "Project Task", color: "text-teal-400 bg-teal-500/10" },
  follow_up: { icon: CalendarClock, label: "Follow-Up", color: "text-purple-400 bg-purple-500/10" },
};

const STATUS_BADGE = {
  approved: { label: "You're on it", cls: "bg-teal-500/10 text-teal-400 border-teal-500/25" },
  executed: { label: "Sent by Maya", cls: "bg-primary/10 text-primary border-primary/20" },
  dismissed: { label: "Dismissed", cls: "bg-red-500/10 text-red-400 border-red-500/20" },
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * One recommendation Maya filed. The rationale is always visible, drafts are
 * editable, and nothing sends until the artist approves it here.
 */
export default function RecommendationCard({ rec, onUpdated }) {
  const meta = KIND_META[rec.kind] || KIND_META.career_move;
  const Icon = meta.icon;
  const done = rec.status !== "proposed";

  const [draft, setDraft] = useState(rec.draft || "");
  const [recipient, setRecipient] = useState(rec.recipient_email || "");
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const call = async (payload, fallbackStatus) => {
    setError("");
    setBusy(true);
    const res = await base44.functions.invoke("mayaApprove", {
      recommendation_id: rec.id,
      ...payload,
    }).catch((e) => ({ data: { error: e.message } }));
    setBusy(false);
    if (res.data?.error) { setError(res.data.error); return; }
    onUpdated(res.data?.data || { ...rec, status: fallbackStatus });
  };

  const recordOutcome = async (outcome, note) => {
    const updated = await base44.entities.MayaRecommendation.update(rec.id, {
      outcome,
      outcome_note: note,
      metadata: { ...(rec.metadata || {}), outcome_recorded_at: new Date().toISOString() },
    });
    onUpdated(updated);
  };

  const statusBadge = done ? STATUS_BADGE[rec.status] : null;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{meta.label}</span>
            {statusBadge ? (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge.cls}`}>
                {statusBadge.label}
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-yellow-500/10 text-yellow-400 border-yellow-500/25">
                Suggested by Maya
              </span>
            )}
          </div>
          <p className="text-sm font-semibold leading-tight mt-0.5">{rec.title}</p>
        </div>
      </div>

      {/* Why Maya suggests this */}
      <div className="rounded-lg bg-secondary/40 border border-border/60 p-2.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Why Maya suggests this</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{rec.rationale}</p>
      </div>

      <p className="text-xs leading-relaxed">{rec.proposed_action}</p>

      {/* Manual next step */}
      {rec.manual_next_step && (!done || rec.status === "approved") && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">Your next step</p>
          <p className="text-xs leading-relaxed">{rec.manual_next_step}</p>
        </div>
      )}

      {/* Editable draft for email recommendations */}
      {!done && rec.draft_kind === "email" && rec.draft && (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              {expanded ? "Hide draft" : "View draft"}
              <ChevronRight className={`h-3 w-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
            </button>
            <button
              onClick={() => { setEditing(!editing); setExpanded(true); }}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <Pencil className="h-3 w-3" /> {editing ? "Done editing" : "Edit draft"}
            </button>
          </div>
          {(expanded || editing) && (
            editing ? (
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="text-xs leading-relaxed min-h-48 bg-secondary/50"
                placeholder="Edit Maya's draft before sending..."
              />
            ) : (
              <div className="rounded-lg bg-secondary/50 border border-border p-3 text-xs whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                {draft}
              </div>
            )
          )}
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
            <Input
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Recipient's email (Maya never invents one)"
              className="h-8 text-xs flex-1"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Decision buttons */}
      {!done && (
        <div className="flex gap-2">
          {rec.draft_kind === "email" && rec.draft ? (
            <>
              <Button
                size="sm"
                onClick={() => call({ action: "approve", draft, recipient_email: recipient }, "executed")}
                disabled={busy || !recipient.trim() || !EMAIL_RE.test(recipient.trim())}
                className="flex-1 gap-1.5 font-semibold"
              >
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Approve & Send
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => call({ action: "approve", draft, manual: true }, "approved")}
                disabled={busy}
                className="shrink-0"
              >
                Send it myself
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={() => call({ action: "approve" }, "approved")}
              disabled={busy}
              className="flex-1 gap-1.5 font-semibold"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              I'm on it
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => call({ action: "dismiss" }, "dismissed")}
            disabled={busy}
            className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 shrink-0"
          >
            <X className="h-3.5 w-3.5" /> Dismiss
          </Button>
        </div>
      )}

      {/* Outcome tracking after the action is taken */}
      {done && (rec.status === "executed" || rec.status === "approved") && (
        <div className="pt-1 border-t border-border/60">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">What happened?</p>
          <OutcomeControl outcome={rec.outcome} note={rec.outcome_note} onRecord={recordOutcome} />
        </div>
      )}
    </div>
  );
}