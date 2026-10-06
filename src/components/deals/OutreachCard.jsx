import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { STATUS_META } from "@/components/deals/dealStatus";
import { Loader2, Send, ExternalLink, X, CornerUpLeft } from "lucide-react";

export default function OutreachCard({ record, onUpdated }) {
  const [draft, setDraft] = useState(record.draft || "");
  const [recipient, setRecipient] = useState(record.contact_email || "");
  const [note, setNote] = useState(record.outcome_note || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const meta = STATUS_META[record.status] || STATUS_META.researched;

  const invoke = async (payload) => {
    setBusy(true);
    setError("");
    const res = await base44.functions.invoke("dealOutreach", payload)
      .catch(e => ({ data: { error: e.message } }));
    setBusy(false);
    if (res.data?.error) {
      setError(res.data.error === "profile_incomplete"
        ? "Sam needs your artist profile completed first."
        : res.data.error);
      return null;
    }
    return res.data?.data;
  };

  const send = async () => {
    const updated = await invoke({
      action: "send",
      id: record.id,
      draft,
      recipient_email: recipient,
    });
    if (updated) onUpdated(updated);
  };

  const setStatus = async (status, defaultNote) => {
    const updated = await invoke({
      action: "status",
      id: record.id,
      status,
      outcome_note: note || defaultNote || undefined,
    });
    if (updated) onUpdated(updated);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-heading font-bold">{record.company_name}</p>
          <p className="text-xs text-muted-foreground">
            {[record.company_type, record.location].filter(Boolean).join(" · ") || "—"}
          </p>
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${meta.chip}`}>
          {meta.label}
        </span>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">{record.why_fit}</p>
      {!!record.metadata?.fit_score && (
        <p className="text-[11px] text-muted-foreground/80">
          Sam's fit rating: {record.metadata.fit_score}/10{record.metadata.fit_evidence ? ` — ${record.metadata.fit_evidence}` : ""}
        </p>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
        {record.contact_email && (
          <span className="text-primary font-medium">{record.contact_email}</span>
        )}
        {record.submission_url && (
          <a href={record.submission_url} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
            Submissions page <ExternalLink className="h-3 w-3" />
          </a>
        )}
        {record.source_url && (
          <a href={record.source_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:underline inline-flex items-center gap-1">
            Where Sam found this <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* Awaiting approval — editable draft */}
      {record.status === "draft" && (
        <div className="space-y-3">
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            className="w-full min-h-44 rounded-lg bg-secondary/50 border border-border p-3 text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={recipient}
              onChange={e => setRecipient(e.target.value)}
              placeholder="Recipient email"
              className="flex-1 h-9 rounded-md bg-secondary/50 border border-border px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <Button
              onClick={send}
              disabled={busy || !draft.trim() || !recipient.trim()}
              className="gap-2 font-semibold shrink-0"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Approve & Send
            </Button>
          </div>
          {!record.contact_email && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
              <p className="text-xs text-muted-foreground flex-1 min-w-40">
                No public email on file — apply via their submissions page, then mark it as applied.
              </p>
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => setStatus("approved", "Applied manually via the company's submissions page")}
              >
                I applied via their page
              </Button>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={() => setStatus("declined", "")}
            className="gap-1.5 text-muted-foreground"
          >
            <X className="h-3.5 w-3.5" /> Not interested
          </Button>
        </div>
      )}

      {/* In motion — record what happened */}
      {(record.status === "sent" || record.status === "approved") && (
        <div className="space-y-3 border-t border-border pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Optional note…"
              className="flex-1 min-w-40 h-8 rounded-md bg-secondary/50 border border-border px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <Button variant="outline" size="sm" disabled={busy} onClick={() => setStatus("replied", note)}>
              Replied
            </Button>
            <Button variant="outline" size="sm" disabled={busy} onClick={() => setStatus("follow_up", note)} className="gap-1.5">
              <CornerUpLeft className="h-3.5 w-3.5" /> Follow up
            </Button>
            <Button variant="ghost" size="sm" disabled={busy} onClick={() => setStatus("declined", note)} className="text-muted-foreground">
              Not happening
            </Button>
          </div>
          {record.sent_at && (
            <p className="text-[11px] text-muted-foreground">
              Sent {new Date(record.sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              {record.contact_email ? ` to ${record.contact_email}` : ""}
            </p>
          )}
        </div>
      )}

      {/* Later stages — just the recorded outcome */}
      {["replied", "follow_up", "paused", "declined"].includes(record.status) && (
        <div className="border-t border-border pt-3">
          {record.outcome_note && (
            <p className="text-xs text-muted-foreground italic">{record.outcome_note}</p>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}