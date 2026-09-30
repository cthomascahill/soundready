import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Music2, MapPin, FileText, Mail, Send, Check, X,
  Loader2, ChevronRight, AlertTriangle, Pencil, Disc3,
} from "lucide-react";

const ACTION_META = {
  playlist_pitch: { icon: Music2, color: "text-primary bg-primary/10", typeLabel: "Playlist Pitch" },
  tour_opportunity: { icon: MapPin, color: "text-orange-400 bg-orange-500/10", typeLabel: "Tour / Booking" },
  epk_generated: { icon: FileText, color: "text-purple-400 bg-purple-500/10", typeLabel: "EPK / Press" },
  digest_sent: { icon: Mail, color: "text-chart-5 bg-chart-5/10", typeLabel: "Weekly Digest" },
  booking_outreach: { icon: Send, color: "text-teal-400 bg-teal-500/10", typeLabel: "Booking Outreach" },
  producer_pitch: { icon: Disc3, color: "text-purple-400 bg-purple-500/10", typeLabel: "Beat Pitch" },
};

/**
 * One Maya draft awaiting the artist's decision.
 * Nothing sends until the artist approves — the draft is editable first.
 */
export default function MayaQueueCard({ item, user, onUpdated }) {
  const meta = ACTION_META[item.action_type] || ACTION_META.playlist_pitch;
  const Icon = meta.icon;

  const [draft, setDraft] = useState(item.draft_email || "");
  const [recipient, setRecipient] = useState(
    item.recipient_email || (item.action_type === "digest_sent" ? user?.email || "" : "")
  );
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const approve = async () => {
    setError("");
    if (!recipient.trim()) {
      setError("Enter the recipient's email address — Maya never guesses who to send to.");
      return;
    }
    setBusy(true);
    const res = await base44.functions.invoke("mayaSendDraft", {
      action: "send",
      activity_id: item.id,
      draft_email: draft,
      recipient_email: recipient.trim(),
    }).catch(e => ({ data: { error: e.message } }));
    setBusy(false);
    if (res.data?.error) { setError(res.data.error); return; }
    onUpdated(res.data?.data || { ...item, status: "sent" });
  };

  const deny = async () => {
    setError("");
    setBusy(true);
    const res = await base44.functions.invoke("mayaSendDraft", {
      action: "deny",
      activity_id: item.id,
    }).catch(e => ({ data: { error: e.message } }));
    setBusy(false);
    if (res.data?.error) { setError(res.data.error); return; }
    onUpdated(res.data?.data || { ...item, status: "denied" });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{meta.typeLabel}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-yellow-500/10 text-yellow-400 border-yellow-500/25">
              Needs your approval
            </span>
          </div>
          <p className="text-sm font-semibold leading-tight mt-0.5">{item.title}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
        </div>
      </div>

      {/* Draft preview / editor */}
      {item.draft_email && (
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
                onChange={e => setDraft(e.target.value)}
                className="text-xs leading-relaxed min-h-48 bg-secondary/50"
                placeholder="Edit Maya's draft before sending..."
              />
            ) : (
              <div className="rounded-lg bg-secondary/50 border border-border p-3 text-xs whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                {draft}
              </div>
            )
          )}
        </div>
      )}

      {/* Recipient + actions */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Input
            type="email"
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
            placeholder="Recipient's email (curator, promoter, press...)"
            className="h-8 text-xs flex-1"
          />
        </div>
        {error && (
          <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </div>
        )}
        <div className="flex gap-2">
          <Button size="sm" onClick={approve} disabled={busy} className="flex-1 gap-1.5 font-semibold">
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            Approve & Send
          </Button>
          <Button size="sm" variant="outline" onClick={deny} disabled={busy}
            className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10">
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
            Deny
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground/70">
          Sent as "Maya for {user?.artist_name || user?.full_name || "you"}" — replies go straight to you at {user?.email}.
        </p>
      </div>
    </div>
  );
}